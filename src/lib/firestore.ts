import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    increment,
    connectFirestoreEmulator,
    onSnapshot,
    limit,
    startAfter, // Added startAfter as per instruction's Code Edit snippet
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from './firebase';
import { Note, UserProfile, NoteCategory, SupportChat, ChatMessage, Review, PayoutRequest, NoteRequest, FreePYQ, Course, Notification, NotificationType, Announcement } from '../types';

// Collection references
const usersCollection = collection(db, 'users');
const notesCollection = collection(db, 'notes');
const purchasesCollection = collection(db, 'purchases');
const bookmarksCollection = collection(db, 'bookmarks');
const reviewsCollection = collection(db, 'reviews');
const payoutsCollection = collection(db, 'payouts');
const noteRequestsCollection = collection(db, 'noteRequests');
const freePYQsCollection = collection(db, 'freePYQs');
const coursesCollection = collection(db, 'courses');
const notificationsCollection = collection(db, 'notifications');
const announcementsCollection = collection(db, 'announcements');
const settingsDoc = doc(db, 'settings', 'platform');

// ============ USER FUNCTIONS ============

export async function createUserProfile(
    uid: string,
    data: { name: string; email: string; avatarUrl?: string }
): Promise<void> {
    await setDoc(doc(usersCollection, uid), {
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl || '',
        totalEarnings: 0,
        createdAt: Timestamp.now(),
    });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const docSnap = await getDoc(doc(usersCollection, uid));
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    const uploadedNotes = await getUserUploadedNotes(uid);

    return {
        id: uid,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl || '',
        bio: data.bio || '',
        totalEarnings: data.totalEarnings || 0,
        uploadedNotes,
        isAdmin: data.isAdmin || false,
        isVerified: data.isVerified || false,
        isBlocked: data.isBlocked || false,
    };
}

export async function updateUserProfile(
    uid: string,
    data: Partial<{ name: string; email: string; avatarUrl: string; bio: string }>
): Promise<void> {
    await updateDoc(doc(usersCollection, uid), data);
}

export async function updateUserEarnings(uid: string, amount: number): Promise<void> {
    await updateDoc(doc(usersCollection, uid), {
        totalEarnings: increment(amount),
    });
}

// ============ NOTES FUNCTIONS ============

export async function getNotes(): Promise<Note[]> {
    const q = query(notesCollection, orderBy('uploadDate', 'desc'));
    const querySnapshot = await getDocs(q);

    const notes = querySnapshot.docs
        .map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                description: data.description,
                category: data.category as NoteCategory,
                price: data.price,
                rating: data.rating || 0,
                reviewCount: data.reviewCount || 0,
                salesCount: data.salesCount || 0,
                previewPages: data.previewPages || [],
                thumbnailUrl: data.thumbnailUrl || '',
                pdfUrls: data.pdfUrls || [],
                uploaderId: data.uploaderId,
                uploaderName: data.uploaderName,
                uploadDate: data.uploadDate instanceof Timestamp
                    ? data.uploadDate.toDate().toISOString().split('T')[0]
                    : data.uploadDate,
                isDeleted: data.isDeleted || false,
                isTopSelling: data.isTopSelling || false,
                isVerified: data.isVerified || false,
                totalPages: data.totalPages || 0,
            };
        })
        .filter(note => !note.isDeleted); // Filter out soft-deleted notes

    // Sort: Top Selling first, then Verified, then the rest
    return notes.sort((a, b) => {
        // Top selling notes come first
        if (a.isTopSelling && !b.isTopSelling) return -1;
        if (!a.isTopSelling && b.isTopSelling) return 1;
        // Then verified notes
        if (a.isVerified && !b.isVerified) return -1;
        if (!a.isVerified && b.isVerified) return 1;
        // Keep original order for the rest
        return 0;
    });
}

export async function getNoteById(noteId: string): Promise<Note | null> {
    const docSnap = await getDoc(doc(notesCollection, noteId));
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
        id: docSnap.id,
        title: data.title,
        description: data.description,
        category: data.category as NoteCategory,
        price: data.price,
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
        salesCount: data.salesCount || 0,
        previewPages: data.previewPages || [],
        thumbnailUrl: data.thumbnailUrl || '',
        pdfUrls: data.pdfUrls || [],
        uploaderId: data.uploaderId,
        uploaderName: data.uploaderName,
        uploadDate: data.uploadDate instanceof Timestamp
            ? data.uploadDate.toDate().toISOString().split('T')[0]
            : data.uploadDate,
        isDeleted: data.isDeleted || false,
        isTopSelling: data.isTopSelling || false,
        isVerified: data.isVerified || false,
        totalPages: data.totalPages || 0,
    };
}

export async function createNote(noteData: {
    title: string;
    description: string;
    category: NoteCategory;
    price: number;
    previewPages: string[];
    thumbnailUrl: string;
    pdfUrls: string[];
    totalPages?: number;
    uploaderId: string;
    uploaderName: string;
}): Promise<string> {
    const docRef = await addDoc(notesCollection, {
        ...noteData,
        rating: 0,
        reviewCount: 0,
        salesCount: 0,
        uploadDate: Timestamp.now(),
    });
    return docRef.id;
}

export async function getUserUploadedNotes(uid: string): Promise<Note[]> {
    const q = query(notesCollection, where('uploaderId', '==', uid));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            description: data.description,
            category: data.category as NoteCategory,
            price: data.price,
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
            salesCount: data.salesCount || 0,
            previewPages: data.previewPages || [],
            thumbnailUrl: data.thumbnailUrl || '',
            pdfUrls: data.pdfUrls || [],
            uploaderId: data.uploaderId,
            uploaderName: data.uploaderName,
            uploadDate: data.uploadDate instanceof Timestamp
                ? data.uploadDate.toDate().toISOString().split('T')[0]
                : data.uploadDate,
            isDeleted: data.isDeleted || false,
            isTopSelling: data.isTopSelling || false,
            isVerified: data.isVerified || false,
            totalPages: data.totalPages || 0,
        };
    });
}

// Soft delete a note (mark as deleted but keep data for existing purchasers)
export async function softDeleteNote(noteId: string): Promise<void> {
    await updateDoc(doc(notesCollection, noteId), {
        isDeleted: true,
    });
}

// Restore a soft-deleted note
export async function restoreNote(noteId: string): Promise<void> {
    await updateDoc(doc(notesCollection, noteId), {
        isDeleted: false,
    });
}

// Update note price
export async function updateNotePrice(noteId: string, newPrice: number): Promise<void> {
    await updateDoc(doc(notesCollection, noteId), {
        price: newPrice,
    });
}

export async function incrementNoteSales(noteId: string): Promise<void> {
    await updateDoc(doc(notesCollection, noteId), {
        salesCount: increment(1),
    });
}

// ============ PURCHASES FUNCTIONS ============

export async function getUserPurchases(uid: string): Promise<Note[]> {
    const q = query(purchasesCollection, where('userId', '==', uid));
    const querySnapshot = await getDocs(q);

    const noteIds = querySnapshot.docs.map((doc) => doc.data().noteId);
    if (noteIds.length === 0) return [];

    const notes: Note[] = [];
    for (const noteId of noteIds) {
        const note = await getNoteById(noteId);
        if (note) notes.push(note);
    }

    return notes;
}

export async function addPurchase(uid: string, noteId: string, buyerName?: string): Promise<void> {
    // Check if already purchased
    const q = query(
        purchasesCollection,
        where('userId', '==', uid),
        where('noteId', '==', noteId)
    );
    const existing = await getDocs(q);
    if (!existing.empty) return;

    await addDoc(purchasesCollection, {
        userId: uid,
        noteId: noteId,
        purchasedAt: Timestamp.now(),
    });

    // Increment sales count
    await incrementNoteSales(noteId);

    // Notify the seller about the purchase
    const note = await getNoteById(noteId);
    if (note && note.uploaderId !== uid) {
        await createNotification({
            userId: note.uploaderId,
            type: 'purchase',
            title: 'New Sale! 🎉',
            message: `${buyerName || 'Someone'} purchased your note "${note.title}"`,
            linkTo: 'earnings',
            relatedId: noteId,
        });
    }
}

export async function isNotePurchased(uid: string, noteId: string): Promise<boolean> {
    const q = query(
        purchasesCollection,
        where('userId', '==', uid),
        where('noteId', '==', noteId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

// ============ BOOKMARKS FUNCTIONS ============

export async function getUserBookmarks(uid: string): Promise<Note[]> {
    const q = query(bookmarksCollection, where('userId', '==', uid));
    const querySnapshot = await getDocs(q);

    const noteIds = querySnapshot.docs.map((doc) => doc.data().noteId);
    if (noteIds.length === 0) return [];

    const notes: Note[] = [];
    for (const noteId of noteIds) {
        const note = await getNoteById(noteId);
        if (note) notes.push(note);
    }

    return notes;
}

export async function addBookmark(uid: string, noteId: string): Promise<void> {
    // Check if already bookmarked
    const q = query(
        bookmarksCollection,
        where('userId', '==', uid),
        where('noteId', '==', noteId)
    );
    const existing = await getDocs(q);
    if (!existing.empty) return;

    await addDoc(bookmarksCollection, {
        userId: uid,
        noteId: noteId,
        createdAt: Timestamp.now(),
    });
}

export async function removeBookmark(uid: string, noteId: string): Promise<void> {
    const q = query(
        bookmarksCollection,
        where('userId', '==', uid),
        where('noteId', '==', noteId)
    );
    const querySnapshot = await getDocs(q);

    for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(bookmarksCollection, docSnap.id));
    }
}

export async function isNoteBookmarked(uid: string, noteId: string): Promise<boolean> {
    const q = query(
        bookmarksCollection,
        where('userId', '==', uid),
        where('noteId', '==', noteId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

export async function getUserBookmarkIds(uid: string): Promise<string[]> {
    const q = query(bookmarksCollection, where('userId', '==', uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data().noteId);
}

export async function getUserPurchaseIds(uid: string): Promise<string[]> {
    const q = query(purchasesCollection, where('userId', '==', uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data().noteId);
}

// ============ REVIEWS FUNCTIONS ============

export async function getReviewsForNote(noteId: string): Promise<Review[]> {
    try {
        const q = query(reviewsCollection, where('noteId', '==', noteId), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);

        console.log(`Found ${querySnapshot.docs.length} reviews for note ${noteId}`);

        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                noteId: data.noteId,
                userId: data.userId,
                userName: data.userName,
                rating: data.rating,
                comment: data.comment,
                date: data.date instanceof Timestamp
                    ? data.date.toDate().toISOString().split('T')[0]
                    : data.date,
            };
        });
    } catch (error: any) {
        // If the composite index is missing, try without ordering
        console.warn('Error fetching reviews, trying without order:', error.message);
        const q = query(reviewsCollection, where('noteId', '==', noteId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                noteId: data.noteId,
                userId: data.userId,
                userName: data.userName,
                rating: data.rating,
                comment: data.comment,
                date: data.date instanceof Timestamp
                    ? data.date.toDate().toISOString().split('T')[0]
                    : data.date,
            };
        });
    }
}

export async function hasUserReviewedNote(userId: string, noteId: string): Promise<boolean> {
    const q = query(
        reviewsCollection,
        where('userId', '==', userId),
        where('noteId', '==', noteId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

export async function addReview(reviewData: {
    noteId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
}): Promise<void> {
    // Check if user has already reviewed
    const alreadyReviewed = await hasUserReviewedNote(reviewData.userId, reviewData.noteId);
    if (alreadyReviewed) {
        throw new Error('You have already reviewed this note');
    }

    // Check if user has purchased the note
    const hasPurchased = await isNotePurchased(reviewData.userId, reviewData.noteId);
    if (!hasPurchased) {
        throw new Error('You must purchase this note before reviewing');
    }

    // Add the review
    await addDoc(reviewsCollection, {
        ...reviewData,
        date: Timestamp.now(),
    });

    // Update note's average rating
    await updateNoteRating(reviewData.noteId);

    // Notify the seller about the review
    const note = await getNoteById(reviewData.noteId);
    if (note && note.uploaderId !== reviewData.userId) {
        const stars = '⭐'.repeat(reviewData.rating);
        await createNotification({
            userId: note.uploaderId,
            type: 'review',
            title: 'New Review!',
            message: `${reviewData.userName} left a ${reviewData.rating}-star review ${stars} on "${note.title}"`,
            linkTo: 'profile',
            relatedId: reviewData.noteId,
        });
    }
}

export async function updateNoteRating(noteId: string): Promise<void> {
    // Get all reviews for this note
    const q = query(reviewsCollection, where('noteId', '==', noteId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        await updateDoc(doc(notesCollection, noteId), {
            rating: 0,
            reviewCount: 0,
        });
        return;
    }

    // Calculate average rating
    let totalRating = 0;
    querySnapshot.docs.forEach((doc) => {
        totalRating += doc.data().rating;
    });

    const averageRating = Math.round((totalRating / querySnapshot.docs.length) * 10) / 10;

    // Update the note
    await updateDoc(doc(notesCollection, noteId), {
        rating: averageRating,
        reviewCount: querySnapshot.docs.length,
    });
}

// ============ ADMIN FUNCTIONS ============

const supportChatsCollection = collection(db, 'supportChats');

export async function getAllUsers(): Promise<UserProfile[]> {
    const querySnapshot = await getDocs(usersCollection);
    const users: UserProfile[] = [];

    for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const uploadedNotes = await getUserUploadedNotes(docSnap.id);
        users.push({
            id: docSnap.id,
            name: data.name,
            email: data.email,
            avatarUrl: data.avatarUrl || '',
            totalEarnings: data.totalEarnings || 0,
            uploadedNotes,
            isAdmin: data.isAdmin || false,
            isVerified: data.isVerified || false,
            isBlocked: data.isBlocked || false,
        });
    }

    return users;
}

export async function updateUserVerificationStatus(userId: string, isVerified: boolean): Promise<void> {
    await updateDoc(doc(usersCollection, userId), { isVerified });
}

export async function updateUserBlockStatus(userId: string, isBlocked: boolean): Promise<void> {
    await updateDoc(doc(usersCollection, userId), { isBlocked });
}

export async function setNoteTopSelling(noteId: string, isTopSelling: boolean): Promise<void> {
    await updateDoc(doc(notesCollection, noteId), { isTopSelling });
}

export async function setNoteVerified(noteId: string, isVerified: boolean): Promise<void> {
    await updateDoc(doc(notesCollection, noteId), { isVerified });
}

export async function deleteNote(noteId: string): Promise<void> {
    await deleteDoc(doc(notesCollection, noteId));
}

// ============ SUPPORT CHAT FUNCTIONS ============

export async function createSupportChat(userId: string, userName: string, userEmail: string, initialMessage: string): Promise<string> {
    const chatRef = await addDoc(supportChatsCollection, {
        userId,
        userName,
        userEmail,
        status: 'open',
        createdAt: Timestamp.now(),
        lastMessage: initialMessage,
        lastMessageAt: Timestamp.now(),
    });

    // Add the first message
    const messagesCollection = collection(db, 'supportChats', chatRef.id, 'messages');
    await addDoc(messagesCollection, {
        senderId: userId,
        senderName: userName,
        isAdmin: false,
        text: initialMessage,
        timestamp: Timestamp.now(),
    });

    return chatRef.id;
}

export async function sendChatMessage(chatId: string, senderId: string, senderName: string, isAdmin: boolean, text: string): Promise<void> {
    const messagesCollection = collection(db, 'supportChats', chatId, 'messages');
    await addDoc(messagesCollection, {
        senderId,
        senderName,
        isAdmin,
        text,
        timestamp: Timestamp.now(),
    });

    // Update last message
    await updateDoc(doc(supportChatsCollection, chatId), {
        lastMessage: text,
        lastMessageAt: Timestamp.now(),
    });
}

export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
    const messagesCollection = collection(db, 'supportChats', chatId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            senderId: data.senderId,
            senderName: data.senderName,
            isAdmin: data.isAdmin,
            text: data.text,
            timestamp: data.timestamp instanceof Timestamp
                ? data.timestamp.toDate().toISOString()
                : data.timestamp,
        };
    });
}

export async function getUserChats(userId: string): Promise<SupportChat[]> {
    const q = query(supportChatsCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const chats = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail,
            status: data.status,
            createdAt: data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt,
            lastMessage: data.lastMessage,
            lastMessageAt: data.lastMessageAt instanceof Timestamp
                ? data.lastMessageAt.toDate().toISOString()
                : data.lastMessageAt,
        };
    });

    // Sort by lastMessageAt descending
    return chats.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export async function getAllChats(): Promise<SupportChat[]> {
    const q = query(supportChatsCollection, orderBy('lastMessageAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail,
            status: data.status,
            createdAt: data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt,
            lastMessage: data.lastMessage,
            lastMessageAt: data.lastMessageAt instanceof Timestamp
                ? data.lastMessageAt.toDate().toISOString()
                : data.lastMessageAt,
        };
    });
}

export async function updateChatStatus(chatId: string, status: 'open' | 'closed'): Promise<void> {
    await updateDoc(doc(supportChatsCollection, chatId), { status });
}

// ============ PAYOUT FUNCTIONS ============

export async function getPlatformFee(): Promise<number> {
    const docSnap = await getDoc(settingsDoc);
    if (!docSnap.exists()) {
        // Default 30% fee
        await setDoc(settingsDoc, { platformFee: 30 });
        return 30;
    }
    return docSnap.data().platformFee || 30;
}

export async function updatePlatformFee(fee: number): Promise<void> {
    await setDoc(settingsDoc, { platformFee: fee }, { merge: true });
}

export async function createPayoutRequest(
    userId: string,
    userName: string,
    userEmail: string,
    upiId: string,
    grossAmount: number
): Promise<string> {
    const functions = getFunctions(undefined, 'asia-south1');
    const createPayout = httpsCallable(functions, 'createPayoutRequest');

    try {
        const result = await createPayout({
            upiId,
            grossAmount
        });
        const data = result.data as { success: boolean; payoutId: string };
        return data.payoutId;
    } catch (error: any) {
        console.error('Error creating payout request:', error);
        throw new Error(error.message || 'Failed to create payout request');
    }
}

export async function getPendingPayouts(): Promise<PayoutRequest[]> {
    const q = query(payoutsCollection, where('status', '==', 'pending'), orderBy('requestedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail,
            upiId: data.upiId,
            grossAmount: data.grossAmount,
            platformFee: data.platformFee,
            netAmount: data.netAmount,
            status: data.status,
            requestedAt: data.requestedAt instanceof Timestamp
                ? data.requestedAt.toDate().toISOString()
                : data.requestedAt,
        };
    });
}

export async function getAllPayouts(): Promise<PayoutRequest[]> {
    const q = query(payoutsCollection, orderBy('requestedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail,
            upiId: data.upiId,
            grossAmount: data.grossAmount,
            platformFee: data.platformFee,
            netAmount: data.netAmount,
            status: data.status,
            requestedAt: data.requestedAt instanceof Timestamp
                ? data.requestedAt.toDate().toISOString()
                : data.requestedAt,
            completedAt: data.completedAt instanceof Timestamp
                ? data.completedAt.toDate().toISOString()
                : data.completedAt,
        };
    });
}

export async function markPayoutComplete(requestId: string): Promise<void> {
    const functions = getFunctions(undefined, 'asia-south1');
    const markComplete = httpsCallable(functions, 'markPayoutComplete');

    try {
        await markComplete({ payoutId: requestId });
    } catch (error: any) {
        console.error('Error marking payout complete:', error);
        throw new Error(error.message || 'Failed to complete payout');
    }
}

export async function getUserPayoutStatus(userId: string): Promise<PayoutRequest | null> {
    const q = query(
        payoutsCollection,
        where('userId', '==', userId),
        where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    return {
        id: docSnap.id,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        upiId: data.upiId,
        grossAmount: data.grossAmount,
        platformFee: data.platformFee,
        netAmount: data.netAmount,
        status: data.status,
        requestedAt: data.requestedAt instanceof Timestamp
            ? data.requestedAt.toDate().toISOString()
            : data.requestedAt,
    };
}

// Create a new note request with broadcast notification to all users
export async function createNoteRequest(
    userId: string,
    userName: string,
    userEmail: string,
    title: string,
    description: string,
    category: NoteCategory
): Promise<string> {
    const functions = getFunctions(undefined, 'asia-south1');
    const createRequest = httpsCallable(functions, 'createNoteRequestWithNotification');

    try {
        const result = await createRequest({
            title,
            description,
            category
        });
        return (result.data as any).requestId;
    } catch (error: any) {
        console.error('Error creating request:', error);
        throw new Error(error.message || 'Failed to create request');
    }
}

export async function getUserNoteRequests(userId: string): Promise<NoteRequest[]> {
    try {
        const q = query(noteRequestsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                userId: data.userId,
                userName: data.userName,
                userEmail: data.userEmail,
                title: data.title,
                description: data.description,
                category: data.category,
                status: data.status,
                createdAt: data.createdAt instanceof Timestamp
                    ? data.createdAt.toDate().toISOString()
                    : data.createdAt,
                response: data.response,
                responseLink: data.responseLink,
                respondedAt: data.respondedAt instanceof Timestamp
                    ? data.respondedAt.toDate().toISOString()
                    : data.respondedAt,
                fulfilledBy: data.fulfilledBy,
                fulfillerName: data.fulfillerName,
                fulfilledNoteId: data.fulfilledNoteId,
                fulfilledAt: data.fulfilledAt instanceof Timestamp
                    ? data.fulfilledAt.toDate().toISOString()
                    : data.fulfilledAt,
            };
        });
    } catch (error: any) {
        // Fallback: query without ordering if composite index is missing
        console.warn('getUserNoteRequests: Falling back to unordered query:', error.message);
        const q = query(noteRequestsCollection, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const requests = querySnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                userId: data.userId,
                userName: data.userName,
                userEmail: data.userEmail,
                title: data.title,
                description: data.description,
                category: data.category,
                status: data.status,
                createdAt: data.createdAt instanceof Timestamp
                    ? data.createdAt.toDate().toISOString()
                    : data.createdAt,
                response: data.response,
                responseLink: data.responseLink,
                respondedAt: data.respondedAt instanceof Timestamp
                    ? data.respondedAt.toDate().toISOString()
                    : data.respondedAt,
                fulfilledBy: data.fulfilledBy,
                fulfillerName: data.fulfillerName,
                fulfilledNoteId: data.fulfilledNoteId,
                fulfilledAt: data.fulfilledAt instanceof Timestamp
                    ? data.fulfilledAt.toDate().toISOString()
                    : data.fulfilledAt,
            };
        });

        // Sort by createdAt descending in JavaScript
        return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
}

export async function getAllNoteRequests(): Promise<NoteRequest[]> {
    const q = query(noteRequestsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            userId: data.userId,
            userName: data.userName,
            userEmail: data.userEmail,
            title: data.title,
            description: data.description,
            category: data.category,
            status: data.status,
            createdAt: data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt,
            response: data.response,
            responseLink: data.responseLink,
            respondedAt: data.respondedAt instanceof Timestamp
                ? data.respondedAt.toDate().toISOString()
                : data.respondedAt,
        };
    });
}

export async function respondToNoteRequest(
    requestId: string,
    response: string,
    responseLink?: string
): Promise<void> {
    await updateDoc(doc(noteRequestsCollection, requestId), {
        status: 'responded',
        response,
        responseLink: responseLink || null,
        respondedAt: Timestamp.now(),
    });
}

export async function closeNoteRequest(requestId: string): Promise<void> {
    await updateDoc(doc(noteRequestsCollection, requestId), {
        status: 'closed',
    });
}

// Delete a note request (admin only - uses Cloud Function)
export async function deleteNoteRequest(requestId: string): Promise<void> {
    const functions = getFunctions(undefined, 'asia-south1');
    const deleteRequest = httpsCallable(functions, 'deleteNoteRequest');

    try {
        await deleteRequest({ requestId });
    } catch (error: any) {
        console.error('Error deleting request:', error);
        throw new Error(error.message || 'Failed to delete request');
    }
}

// Get open note requests for community fulfillment (excludes user's own requests)
export async function getOpenNoteRequests(excludeUserId: string): Promise<NoteRequest[]> {
    try {
        // Try with ordering first (requires composite index)
        const q = query(noteRequestsCollection, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs
            .map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    userId: data.userId,
                    userName: data.userName,
                    userEmail: data.userEmail,
                    title: data.title,
                    description: data.description,
                    category: data.category,
                    status: data.status,
                    createdAt: data.createdAt instanceof Timestamp
                        ? data.createdAt.toDate().toISOString()
                        : data.createdAt,
                };
            })
            .filter((request) => request.userId !== excludeUserId);
    } catch (error: any) {
        // Fallback: query without ordering if composite index is missing
        console.warn('getOpenNoteRequests: Falling back to unordered query:', error.message);
        const q = query(noteRequestsCollection, where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);

        const requests = querySnapshot.docs
            .map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    userId: data.userId,
                    userName: data.userName,
                    userEmail: data.userEmail,
                    title: data.title,
                    description: data.description,
                    category: data.category,
                    status: data.status,
                    createdAt: data.createdAt instanceof Timestamp
                        ? data.createdAt.toDate().toISOString()
                        : data.createdAt,
                };
            })
            .filter((request) => request.userId !== excludeUserId);

        // Sort by createdAt descending in JavaScript
        return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
}

// Get a single note request by ID
export async function getNoteRequestById(requestId: string): Promise<NoteRequest | null> {
    const docSnap = await getDoc(doc(noteRequestsCollection, requestId));
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
        id: docSnap.id,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
        createdAt: data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
        response: data.response,
        responseLink: data.responseLink,
        fulfilledBy: data.fulfilledBy,
        fulfillerName: data.fulfillerName,
        fulfilledNoteId: data.fulfilledNoteId,
        fulfilledAt: data.fulfilledAt instanceof Timestamp
            ? data.fulfilledAt.toDate().toISOString()
            : data.fulfilledAt,
    };
}

// Fulfill a note request by uploading the requested notes
// Uses Cloud Function to bypass security rules
export async function fulfillNoteRequest(
    requestId: string,
    noteId: string,
    fulfillerId: string,
    fulfillerName: string
): Promise<void> {
    const functions = getFunctions(undefined, 'asia-south1');
    const fulfillRequest = httpsCallable(functions, 'fulfillNoteRequest');

    try {
        await fulfillRequest({
            requestId,
            noteId
        });
    } catch (error: any) {
        console.error('Error fulfilling request:', error);
        throw new Error(error.message || 'Failed to fulfill request');
    }
}

// ============ FREE PYQ FUNCTIONS ============

export async function addFreePYQ(
    courseCode: string,
    courseName: string,
    driveLink: string,
    addedBy: string,
    driveFolderId?: string
): Promise<string> {
    // Check if a PYQ entry for this course already exists
    const q = query(freePYQsCollection, where('courseCode', '==', courseCode));
    const existing = await getDocs(q);

    if (!existing.empty) {
        // Course already has a PYQ entry - just return the existing ID
        // (The file was uploaded to the existing folder, no need to create a new DB entry)
        return existing.docs[0].id;
    }

    // No existing entry - create a new one
    const docRef = await addDoc(freePYQsCollection, {
        courseCode,
        courseName,
        driveLink,
        driveFolderId: driveFolderId || null,
        addedAt: Timestamp.now(),
        addedBy,
    });
    return docRef.id;
}

export async function getFreePYQs(): Promise<FreePYQ[]> {
    const q = query(freePYQsCollection, orderBy('addedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            courseCode: data.courseCode,
            courseName: data.courseName,
            driveLink: data.driveLink,
            driveFolderId: data.driveFolderId || undefined,
            addedAt: data.addedAt instanceof Timestamp
                ? data.addedAt.toDate().toISOString()
                : data.addedAt,
            addedBy: data.addedBy,
        };
    });
}

export async function deleteFreePYQ(pyqId: string): Promise<void> {
    await deleteDoc(doc(freePYQsCollection, pyqId));
}

// ============ COURSE FUNCTIONS ============

export async function getCourses(): Promise<Course[]> {
    const querySnapshot = await getDocs(coursesCollection);
    return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            courseCode: data.courseCode,
            courseName: data.courseName,
            createdAt: data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt,
        };
    });
}

export async function addCourse(courseCode: string, courseName: string): Promise<string> {
    // Check if course already exists
    const q = query(coursesCollection, where('courseCode', '==', courseCode));
    const existing = await getDocs(q);

    if (!existing.empty) {
        return existing.docs[0].id;
    }

    const docRef = await addDoc(coursesCollection, {
        courseCode,
        courseName,
        createdAt: Timestamp.now(),
    });
    return docRef.id;
}

// ============ NOTIFICATIONS FUNCTIONS ============

export async function getUserNotifications(userId: string): Promise<Notification[]> {
    const q = query(
        notificationsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            userId: data.userId,
            type: data.type as NotificationType,
            title: data.title,
            message: data.message,
            isRead: data.isRead || false,
            createdAt: data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt,
            linkTo: data.linkTo,
            relatedId: data.relatedId,
        };
    });
}

export async function createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    linkTo?: string;
    relatedId?: string;
}): Promise<string> {
    const docRef = await addDoc(notificationsCollection, {
        ...data,
        isRead: false,
        createdAt: Timestamp.now(),
    });
    return docRef.id;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
    await updateDoc(doc(notificationsCollection, notificationId), {
        isRead: true,
    });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
    const q = query(
        notificationsCollection,
        where('userId', '==', userId),
        where('isRead', '==', false)
    );
    const querySnapshot = await getDocs(q);

    const updatePromises = querySnapshot.docs.map((docSnap) =>
        updateDoc(doc(notificationsCollection, docSnap.id), { isRead: true })
    );
    await Promise.all(updatePromises);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
    const q = query(
        notificationsCollection,
        where('userId', '==', userId),
        where('isRead', '==', false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
}

// Real-time subscription to notifications
export function subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
): () => void {
    const q = query(
        notificationsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notifications = querySnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                userId: data.userId,
                type: data.type as NotificationType,
                title: data.title,
                message: data.message,
                isRead: data.isRead || false,
                createdAt: data.createdAt instanceof Timestamp
                    ? data.createdAt.toDate().toISOString()
                    : data.createdAt || new Date().toISOString(),
                linkTo: data.linkTo,
                relatedId: data.relatedId,
            };
        });
        callback(notifications);
    }, (error) => {
        console.error('Error subscribing to notifications:', error);
    });

    return unsubscribe;
}

// ============ ANNOUNCEMENTS FUNCTIONS ============

export async function createAnnouncement(
    title: string,
    message: string,
    createdBy: string,
    authorName: string
): Promise<string> {
    const docRef = await addDoc(announcementsCollection, {
        title,
        message,
        createdBy,
        authorName,
        createdAt: Timestamp.now(),
    });
    return docRef.id;
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
    const docRef = doc(announcementsCollection, announcementId);
    await deleteDoc(docRef);
}

export async function getAnnouncements(limitCount = 10): Promise<Announcement[]> {
    const q = query(
        announcementsCollection,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            title: data.title,
            message: data.message,
            createdBy: data.createdBy,
            authorName: data.authorName,
            createdAt: data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt,
        };
    });
}

export function subscribeToAnnouncements(callback: (announcements: Announcement[]) => void, limitCount = 10) {
    const q = query(
        announcementsCollection,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    return onSnapshot(q, (snapshot) => {
        const announcements = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                title: data.title,
                message: data.message,
                createdBy: data.createdBy,
                authorName: data.authorName,
                createdAt: data.createdAt instanceof Timestamp
                    ? data.createdAt.toDate().toISOString()
                    : data.createdAt,
            } as Announcement;
        });
        callback(announcements);
    });
}
