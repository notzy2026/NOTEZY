const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay Order
 * Called when user clicks "Buy" button
 */
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
    // Verify user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in to make a purchase');
    }

    const { noteId, amount } = data;
    const userId = context.auth.uid;

    // Validate input
    if (!noteId || !amount) {
        throw new functions.https.HttpsError('invalid-argument', 'Note ID and amount are required');
    }

    // Check if already purchased
    const existingPurchase = await db.collection('purchases')
        .where('userId', '==', userId)
        .where('noteId', '==', noteId)
        .get();

    if (!existingPurchase.empty) {
        throw new functions.https.HttpsError('already-exists', 'You have already purchased this note');
    }

    // Get note details for receipt
    const noteDoc = await db.collection('notes').doc(noteId).get();
    if (!noteDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Note not found');
    }

    try {
        // Create Razorpay order
        const order = await razorpay.orders.create({
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
        throw new functions.https.HttpsError('internal', 'Failed to create payment order');
    }
});

/**
 * Verify Razorpay Payment
 * Called after successful payment on frontend
 */
exports.verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
    // Verify user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
    const userId = context.auth.uid;

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new functions.https.HttpsError('invalid-argument', 'Payment details are required');
    }

    // Get the order from Firestore
    const orderDoc = await db.collection('razorpay_orders').doc(razorpay_order_id).get();
    if (!orderDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Order not found');
    }

    const orderData = orderDoc.data();

    // Verify the user making request is the same who created the order
    if (orderData.userId !== userId) {
        throw new functions.https.HttpsError('permission-denied', 'Unauthorized');
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
        throw new functions.https.HttpsError('invalid-argument', 'Payment verification failed');
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

        // Calculate earning (e.g., 80% to seller, 20% platform fee)
        const sellerEarning = orderData.amount * 0.8;

        const userRef = db.collection('users').doc(uploaderId);
        batch.update(userRef, {
            totalEarnings: admin.firestore.FieldValue.increment(sellerEarning),
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
