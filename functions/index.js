const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Common options for all functions - Asia South 1 for lower latency in India
const functionOptions = {
    region: 'asia-south1',
    concurrency: 80,
};

// Lazy initialization of Razorpay - only when actually needed
let razorpayInstance = null;
function getRazorpay() {
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
}

/**
 * Create Razorpay Order
 * Called when user clicks "Buy" button
 */
exports.createRazorpayOrder = onCall(functionOptions, async (request) => {
    // Verify user is authenticated
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in to make a purchase');
    }

    const { noteId, amount } = request.data;
    const userId = request.auth.uid;

    // Validate input
    if (!noteId || !amount) {
        throw new HttpsError('invalid-argument', 'Note ID and amount are required');
    }

    // Run checks in parallel to save time
    const [existingPurchase, noteDoc] = await Promise.all([
        db.collection('purchases')
            .where('userId', '==', userId)
            .where('noteId', '==', noteId)
            .get(),
        db.collection('notes').doc(noteId).get()
    ]);

    if (!existingPurchase.empty) {
        throw new HttpsError('already-exists', 'You have already purchased this note');
    }

    if (!noteDoc.exists) {
        throw new HttpsError('not-found', 'Note not found');
    }

    try {
        // Create Razorpay order
        const order = await getRazorpay().orders.create({
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: `note_${noteId}_${Date.now()}`,
            notes: {
                noteId: noteId,
                userId: userId,
                noteTitle: noteDoc.data().title,
            },
        });

        // Store order in Firestore for verification later
        await db.collection('razorpay_orders').doc(order.id).set({
            orderId: order.id,
            noteId: noteId,
            userId: userId,
            amount: amount,
            status: 'created',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        };
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw new HttpsError('internal', 'Failed to create payment order');
    }
});

/**
 * Verify Razorpay Payment
 * Called after successful payment on frontend
 */
exports.verifyRazorpayPayment = onCall(functionOptions, async (request) => {
    // Verify user is authenticated
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in');
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.data;
    const userId = request.auth.uid;

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new HttpsError('invalid-argument', 'Payment details are required');
    }

    // Get the order from Firestore
    const orderDoc = await db.collection('razorpay_orders').doc(razorpay_order_id).get();
    if (!orderDoc.exists) {
        throw new HttpsError('not-found', 'Order not found');
    }

    const orderData = orderDoc.data();

    // Verify the user making request is the same who created the order
    if (orderData.userId !== userId) {
        throw new HttpsError('permission-denied', 'Unauthorized');
    }

    // Verify payment signature
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (generatedSignature !== razorpay_signature) {
        // Update order status to failed
        await db.collection('razorpay_orders').doc(razorpay_order_id).update({
            status: 'failed',
            failureReason: 'Signature verification failed',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        throw new HttpsError('invalid-argument', 'Payment verification failed');
    }

    // Payment is valid - process the purchase
    const batch = db.batch();

    // 1. Update order status
    const orderRef = db.collection('razorpay_orders').doc(razorpay_order_id);
    batch.update(orderRef, {
        status: 'paid',
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Create purchase record
    const purchaseRef = db.collection('purchases').doc();
    batch.set(purchaseRef, {
        userId: userId,
        noteId: orderData.noteId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: orderData.amount,
        purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 3. Increment note sales count
    const noteRef = db.collection('notes').doc(orderData.noteId);
    batch.update(noteRef, {
        salesCount: admin.firestore.FieldValue.increment(1),
    });

    // 4. Get note to find uploader and update their earnings
    const noteDoc = await db.collection('notes').doc(orderData.noteId).get();
    if (noteDoc.exists) {
        const noteData = noteDoc.data();
        const uploaderId = noteData.uploaderId;

        // Add full sale amount to earnings (platform fee is deducted at redemption time)
        const userRef = db.collection('users').doc(uploaderId);
        batch.update(userRef, {
            totalEarnings: admin.firestore.FieldValue.increment(orderData.amount),
        });
    }

    // Commit all changes
    await batch.commit();

    return {
        success: true,
        message: 'Payment verified and purchase recorded',
        noteId: orderData.noteId,
    };
});

// ============ GOOGLE DRIVE INTEGRATION ============

// const { google } = require('googleapis'); // Moved to lazy load

// Lazy initialization of Google Drive API
let driveInstance = null;
let authClient = null;

function getAuthClient() {
    if (!authClient) {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

        if (!clientId || !clientSecret || !refreshToken) {
            console.error('Missing Google OAuth credentials in .env');
            throw new Error('Google OAuth credentials missing');
        }

        const { google } = require('googleapis');
        authClient = new google.auth.OAuth2(clientId, clientSecret);
        authClient.setCredentials({ refresh_token: refreshToken });
    }
    return authClient;
}

function getDrive() {
    if (!driveInstance) {
        const { google } = require('googleapis');
        const auth = getAuthClient();
        driveInstance = google.drive({ version: 'v3', auth });
    }
    return driveInstance;
}

/**
 * Upload PYQ to Google Drive
 * Called after user uploads PYQ to Firebase Storage
 */
exports.uploadPYQToDrive = onCall(functionOptions, async (request) => {
    // Verify user is authenticated
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in to upload PYQ');
    }

    const { storagePath, courseCode, courseName, fileName } = request.data;
    const userId = request.auth.uid;

    // Validate input
    if (!storagePath || !courseCode || !courseName || !fileName) {
        throw new HttpsError('invalid-argument', 'Storage path, course code, course name, and file name are required');
    }

    const drive = getDrive();
    // Optional parent folder, default to root if not set
    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    try {
        // 1. Find or create the course folder
        const folderName = `${courseCode} ${courseName}`;
        let courseFolderId;

        // Search Query: Match test.py logic (search by name, not trashed, is folder)
        // If parentFolderId is set, restrict search to it. Otherwise search valid locations.
        let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        if (parentFolderId) {
            query += ` and '${parentFolderId}' in parents`;
        }

        const folderSearch = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
        });

        if (folderSearch.data.files && folderSearch.data.files.length > 0) {
            // Folder exists
            courseFolderId = folderSearch.data.files[0].id;
            console.log(`Found existing folder: ${folderName} (${courseFolderId})`);
        } else {
            // Create new folder
            const folderMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
            };

            if (parentFolderId) {
                folderMetadata.parents = [parentFolderId];
            }

            const folder = await drive.files.create({
                requestBody: folderMetadata,
                fields: 'id',
                supportsAllDrives: true,
            });
            courseFolderId = folder.data.id;
            console.log(`Created new folder: ${folderName} (${courseFolderId})`);
        }

        // 2. Download file from Firebase Storage
        const bucket = admin.storage().bucket();
        const file = bucket.file(storagePath);
        const [fileBuffer] = await file.download();
        console.log(`Downloaded file from Storage: ${storagePath}`);

        // 3. Upload to Google Drive
        const { Readable } = require('stream');
        const fileStream = Readable.from(fileBuffer);

        const fileMetadata = {
            name: fileName,
            parents: [courseFolderId],
        };

        const media = {
            mimeType: 'application/pdf',
            body: fileStream,
        };

        const driveFile = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink',
            supportsAllDrives: true,
        });

        console.log(`Uploaded to Drive: ${driveFile.data.id}`);

        // 4. Make the file viewable by anyone with the link
        await drive.permissions.create({
            fileId: driveFile.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // 5. Delete from Firebase Storage
        await file.delete();
        console.log(`Deleted from Storage: ${storagePath}`);

        // 6. Store PYQ record in Firestore
        await db.collection('freePYQs').add({
            courseCode,
            courseName,
            fileName,
            driveLink: driveFile.data.webViewLink,
            driveFileId: driveFile.data.id,
            addedBy: userId,
            addedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
            success: true,
            driveLink: driveFile.data.webViewLink,
            driveFileId: driveFile.data.id,
        };
    } catch (error) {
        console.error('Error uploading PYQ to Drive:', error);
        throw new HttpsError('internal', 'Failed to upload PYQ to Google Drive: ' + error.message);
    }
});

/**
 * Get list of courses from freePYQs collection
 */
exports.getCourses = onCall(functionOptions, async (request) => {
    try {
        const snapshot = await db.collection('courses').get();
        const courses = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        return { courses };
    } catch (error) {
        console.error('Error getting courses:', error);
        throw new HttpsError('internal', 'Failed to get courses');
    }
});

/**
 * Add a new course
 */
exports.addCourse = onCall(functionOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in');
    }

    const { courseCode, courseName } = request.data;

    if (!courseCode || !courseName) {
        throw new HttpsError('invalid-argument', 'Course code and name are required');
    }

    try {
        // Check if course already exists
        const existing = await db.collection('courses')
            .where('courseCode', '==', courseCode)
            .get();

        if (!existing.empty) {
            return { success: true, message: 'Course already exists', courseId: existing.docs[0].id };
        }

        const docRef = await db.collection('courses').add({
            courseCode,
            courseName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, courseId: docRef.id };
    } catch (error) {
        console.error('Error adding course:', error);
        throw new HttpsError('internal', 'Failed to add course');
    }
});

/**
 * Get Google Drive Access Token for Frontend Upload
 * Returns a temporary access token so frontend can upload directly to Drive
 */
exports.getDriveAccessToken = onCall(functionOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in');
    }

    try {
        const auth = getAuthClient();
        const tokenResponse = await auth.getAccessToken();

        return {
            accessToken: tokenResponse.token || tokenResponse,
            // Check if we have expiry info, otherwise default to 1 hour
            expiresAt: (tokenResponse.res && tokenResponse.res.data && tokenResponse.res.data.expiry_date)
                ? tokenResponse.res.data.expiry_date
                : (Date.now() + 3500 * 1000),
            parentFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
        };
    } catch (error) {
        console.error('Error getting access token:', error);
        throw new HttpsError('internal', 'Failed to get access token: ' + error.message);
    }
});

/**
 * Create Payout Request
 * Securely handles payout creation to avoid permission errors and tampering
 */
exports.createPayoutRequest = onCall(functionOptions, async (request) => {
    // 1. Verify Authentication
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in to request payout');
    }

    const { upiId, grossAmount } = request.data;
    const userId = request.auth.uid;
    const userEmail = request.auth.token.email || '';
    const userName = request.auth.token.name || 'User';

    // 2. Validate Input
    if (!upiId || !grossAmount) {
        throw new HttpsError('invalid-argument', 'UPI ID and amount are required');
    }

    if (grossAmount <= 0) {
        throw new HttpsError('invalid-argument', 'Amount must be greater than 0');
    }

    try {
        // 3. Get User Profile to verify earnings (Double Check)
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new HttpsError('not-found', 'User not found');
        }

        const userData = userDoc.data();
        if (userData.totalEarnings < grossAmount) {
            throw new HttpsError('failed-precondition', 'Insufficient earnings');
        }

        if (userData.pendingPayout) {
            throw new HttpsError('already-exists', 'You already have a pending payout request');
        }

        // 4. Get Platform Fee
        const settingsDoc = await db.collection('settings').doc('platform').get();
        const platformFee = settingsDoc.exists ? (settingsDoc.data().platformFee || 30) : 30;

        // 5. Calculate Net Amount
        const netAmount = grossAmount * (1 - platformFee / 100);

        const batch = db.batch();

        // 6. Create Payout Request
        const payoutRef = db.collection('payouts').doc();
        batch.set(payoutRef, {
            userId,
            userName: userData.name || userName,
            userEmail: userData.email || userEmail,
            upiId,
            grossAmount,
            platformFee,
            netAmount,
            status: 'pending',
            requestedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 7. Update User Status
        const userRef = db.collection('users').doc(userId);
        batch.update(userRef, {
            pendingPayout: true,
        });

        await batch.commit();

        return { success: true, payoutId: payoutRef.id };

    } catch (error) {
        console.error('Error creating payout request:', error);
        throw new HttpsError('internal', 'Failed to create payout request: ' + error.message);
    }
});

/**
 * Mark Payout as Complete (Admin Only)
 * Securely handles payout completion with admin verification
 */
/**
 * Fulfill Note Request
 * Called when a user uploads notes to fulfill a community request
 * Uses admin SDK to bypass security rules since users can't update others' requests
 */
exports.fulfillNoteRequest = onCall(functionOptions, async (request) => {
    // 1. Verify Authentication
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in to fulfill a request');
    }

    const { requestId, noteId } = request.data;
    const fulfillerId = request.auth.uid;

    // 2. Validate Input
    if (!requestId || !noteId) {
        throw new HttpsError('invalid-argument', 'Request ID and Note ID are required');
    }

    try {
        // 3. Get the request to verify it exists and is pending
        const requestDoc = await db.collection('noteRequests').doc(requestId).get();
        if (!requestDoc.exists) {
            throw new HttpsError('not-found', 'Request not found');
        }

        const requestData = requestDoc.data();

        // 4. Check if request is still pending
        if (requestData.status !== 'pending') {
            throw new HttpsError('failed-precondition', 'This request has already been fulfilled or closed');
        }

        // 5. Get the note to verify it exists
        const noteDoc = await db.collection('notes').doc(noteId).get();
        if (!noteDoc.exists) {
            throw new HttpsError('not-found', 'Note not found');
        }

        const noteData = noteDoc.data();

        // 6. Get fulfiller name
        const fulfillerDoc = await db.collection('users').doc(fulfillerId).get();
        const fulfillerName = fulfillerDoc.exists ? fulfillerDoc.data().name : 'A user';

        const batch = db.batch();

        // 7. Update the request status
        const requestRef = db.collection('noteRequests').doc(requestId);
        batch.update(requestRef, {
            status: 'fulfilled',
            fulfilledBy: fulfillerId,
            fulfillerName: fulfillerName,
            fulfilledNoteId: noteId,
            fulfilledAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 8. Create notification for the original requester
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, {
            userId: requestData.userId,
            type: 'system',
            title: 'Request Fulfilled! 🎉',
            message: `${fulfillerName} has uploaded "${noteData.title}" in response to your request "${requestData.title}"`,
            linkTo: 'requests',
            relatedId: noteId,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await batch.commit();

        return {
            success: true,
            message: 'Request fulfilled successfully',
            noteId: noteId
        };

    } catch (error) {
        console.error('Error fulfilling request:', error);
        if (error.code) {
            throw error; // Re-throw HttpsError
        }
        throw new HttpsError('internal', 'Failed to fulfill request: ' + error.message);
    }
});

exports.markPayoutComplete = onCall(functionOptions, async (request) => {
    // 1. Verify Authentication
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in');
    }

    const { payoutId } = request.data;
    const adminUserId = request.auth.uid;

    // 2. Validate Input
    if (!payoutId) {
        throw new HttpsError('invalid-argument', 'Payout ID is required');
    }

    try {
        // 3. Verify the user is an admin
        const adminDoc = await db.collection('users').doc(adminUserId).get();
        if (!adminDoc.exists || !adminDoc.data().isAdmin) {
            throw new HttpsError('permission-denied', 'Only admins can complete payouts');
        }

        // 4. Get the payout request
        const payoutDoc = await db.collection('payouts').doc(payoutId).get();
        if (!payoutDoc.exists) {
            throw new HttpsError('not-found', 'Payout request not found');
        }

        const payoutData = payoutDoc.data();

        // 5. Check if already completed
        if (payoutData.status === 'completed') {
            throw new HttpsError('already-exists', 'Payout already completed');
        }

        const userId = payoutData.userId;
        const netAmount = payoutData.netAmount;

        // 6. Use batch write to update everything atomically
        const batch = db.batch();

        // Update payout status
        const payoutRef = db.collection('payouts').doc(payoutId);
        batch.update(payoutRef, {
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            completedBy: adminUserId,
        });

        // Reset user earnings to 0 and clear pending flag
        const userRef = db.collection('users').doc(userId);
        batch.update(userRef, {
            totalEarnings: 0,
            pendingPayout: false,
        });

        // Create notification for the user
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, {
            userId: userId,
            type: 'payout',
            title: 'Payout Completed! 💰',
            message: `Your payout of ₹${netAmount.toFixed(2)} has been sent to your UPI ID`,
            linkTo: 'earnings',
            relatedId: payoutId,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await batch.commit();

        return { success: true, message: 'Payout marked as complete' };

    } catch (error) {
        console.error('Error marking payout complete:', error);
        if (error.code) {
            throw error; // Re-throw HttpsError
        }
        throw new HttpsError('internal', 'Failed to complete payout: ' + error.message);
    }
});

/**
 * Create Note Request with Broadcast Notification
 * Creates a new note request and notifies all users so they can fulfill it
 */
exports.createNoteRequestWithNotification = onCall(functionOptions, async (request) => {
    // 1. Verify Authentication
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in to create a request');
    }

    const { title, description, category } = request.data;
    const userId = request.auth.uid;

    // 2. Validate Input
    if (!title || !description || !category) {
        throw new HttpsError('invalid-argument', 'Title, description, and category are required');
    }

    try {
        // 3. Get user details
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        const userName = userData.name || 'A user';
        const userEmail = userData.email || '';

        // 4. Create the request
        const requestRef = await db.collection('noteRequests').add({
            userId,
            userName,
            userEmail,
            title,
            description,
            category,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 5. Get all users to notify (excluding the requester)
        const usersSnapshot = await db.collection('users').get();
        const batch = db.batch();
        let notificationCount = 0;

        usersSnapshot.docs.forEach((doc) => {
            // Don't notify the user who created the request
            if (doc.id !== userId) {
                const notificationRef = db.collection('notifications').doc();
                batch.set(notificationRef, {
                    userId: doc.id,
                    type: 'request',
                    title: 'New Note Request! 📚',
                    message: `${userName} is looking for: "${title}"`,
                    linkTo: 'requests',
                    relatedId: requestRef.id,
                    isRead: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                notificationCount++;
            }
        });

        // 6. Commit all notifications
        if (notificationCount > 0) {
            await batch.commit();
        }

        console.log(`Created request ${requestRef.id} and notified ${notificationCount} users`);

        return {
            success: true,
            requestId: requestRef.id,
            notifiedUsers: notificationCount
        };

    } catch (error) {
        console.error('Error creating request with notification:', error);
        if (error.code) {
            throw error;
        }
        throw new HttpsError('internal', 'Failed to create request: ' + error.message);
    }
});

/**
 * Delete Note Request (Admin Only)
 * Allows admins to permanently delete any note request
 */
exports.deleteNoteRequest = onCall(functionOptions, async (request) => {
    // 1. Verify Authentication
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in');
    }

    const { requestId } = request.data;
    const adminUserId = request.auth.uid;

    // 2. Validate Input
    if (!requestId) {
        throw new HttpsError('invalid-argument', 'Request ID is required');
    }

    try {
        // 3. Verify the user is an admin
        const adminDoc = await db.collection('users').doc(adminUserId).get();
        if (!adminDoc.exists || !adminDoc.data().isAdmin) {
            throw new HttpsError('permission-denied', 'Only admins can delete requests');
        }

        // 4. Check if the request exists
        const requestDoc = await db.collection('noteRequests').doc(requestId).get();
        if (!requestDoc.exists) {
            throw new HttpsError('not-found', 'Request not found');
        }

        // 5. Delete the request
        await db.collection('noteRequests').doc(requestId).delete();

        console.log(`Admin ${adminUserId} deleted request ${requestId}`);

        return { success: true, message: 'Request deleted successfully' };

    } catch (error) {
        console.error('Error deleting request:', error);
        if (error.code) {
            throw error; // Re-throw HttpsError
        }
        throw new HttpsError('internal', 'Failed to delete request: ' + error.message);
    }
});
