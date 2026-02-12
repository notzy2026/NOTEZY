import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getNoteById } from '../lib/firestore';
import { Note } from '../types';
import { NotePreviewModal } from './NotePreviewModal';
import { Loader2 } from 'lucide-react';
import { useRazorpay } from '../hooks/useRazorpay';
import { useAuth } from '../contexts/AuthContext';

export function NoteDeepLink() {
    const { noteId } = useParams<{ noteId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [purchasingNoteId, setPurchasingNoteId] = useState<string | null>(null);

    // Auth and payment hooks
    const { user, isGuest, isAuthenticated, isLoading: authLoading, setReturnUrl, exitGuestMode } = useAuth();
    const { initiatePayment, loading: paymentLoading } = useRazorpay();

    useEffect(() => {
        async function fetchNote() {
            if (!noteId) {
                setError('No note ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const fetchedNote = await getNoteById(noteId);
                if (fetchedNote) {
                    setNote(fetchedNote);
                } else {
                    setError('Note not found');
                }
            } catch (err) {
                console.error('Error fetching note:', err);
                setError('Failed to load note');
            } finally {
                setLoading(false);
            }
        }

        fetchNote();
    }, [noteId]);

    const handleClose = () => {
        navigate('/');
    };

    const handlePurchase = async (noteIdToPurchase: string) => {
        // Check if user is logged in
        if (!isAuthenticated || isGuest || !user) {
            // Save current URL so we can redirect back after login
            setReturnUrl(location.pathname);
            // Exit guest mode to trigger login page
            exitGuestMode();
            // Navigate to root where login page will be shown
            navigate('/');
            return;
        }

        if (!note) return;

        try {
            setPurchasingNoteId(noteIdToPurchase);
            const result = await initiatePayment(noteIdToPurchase, note.price, note.title);

            if (result.success) {
                // Refresh the note to get updated data
                const freshNote = await getNoteById(noteIdToPurchase);
                if (freshNote) {
                    setNote(freshNote);
                }
                alert(`Successfully purchased "${note.title}"!`);
            } else if (result.error && result.error !== 'Payment cancelled') {
                alert(`Payment failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Error purchasing note:', error);
            alert('Failed to initiate payment. Please try again.');
        } finally {
            setPurchasingNoteId(null);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-700 dark:text-gray-300">Loading note...</p>
                </div>
            </div>
        );
    }

    if (error || !note) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Note Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The note you\'re looking for doesn\'t exist or has been removed.'}</p>
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <NotePreviewModal
            note={note}
            onClose={handleClose}
            onPurchase={handlePurchase}
            paymentLoading={paymentLoading}
            purchasingNoteId={purchasingNoteId}
        />
    );
}
