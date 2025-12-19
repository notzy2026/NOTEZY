import { X, Star, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { Note, Review } from '../types';
import { useState, useEffect } from 'react';
import { getReviewsForNote, hasUserReviewedNote, addReview, isNotePurchased } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';

interface NotePreviewModalProps {
  note: Note;
  onClose: () => void;
}

export function NotePreviewModal({ note, onClose }: NotePreviewModalProps) {
  const { user, userProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    loadReviews();
    checkPurchaseAndReviewStatus();
  }, [note.id, user?.uid]);

  async function loadReviews() {
    setLoadingReviews(true);
    try {
      const reviewsData = await getReviewsForNote(note.id);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  }

  async function checkPurchaseAndReviewStatus() {
    if (!user?.uid) return;
    try {
      const purchased = await isNotePurchased(user.uid, note.id);
      setHasPurchased(purchased);
      if (purchased) {
        const reviewed = await hasUserReviewedNote(user.uid, note.id);
        setHasReviewed(reviewed);
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.uid || !userProfile) return;

    setSubmittingReview(true);
    setReviewError('');
    try {
      await addReview({
        noteId: note.id,
        userId: user.uid,
        userName: userProfile.name,
        rating: reviewRating,
        comment: reviewComment,
      });
      setShowReviewForm(false);
      setReviewComment('');
      setHasReviewed(true);
      await loadReviews();
    } catch (error: any) {
      setReviewError(error.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  }

  const nextPage = () => {
    if (currentPage < note.previewPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 lg:p-6 flex items-center justify-between z-10 rounded-t-2xl">
          <h2 className="text-gray-900 dark:text-white pr-8">{note.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-4 lg:p-6">
          {/* Preview Pages */}
          <div className="mb-6">
            <h3 className="text-gray-900 dark:text-white mb-3">Preview Pages ({note.previewPages.length} pages)</h3>
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
              <img
                src={note.previewPages[currentPage]}
                alt={`Page ${currentPage + 1}`}
                className="w-full h-auto"
              />

              {note.previewPages.length > 1 && (
                <>
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </button>

                  <button
                    onClick={nextPage}
                    disabled={currentPage === note.previewPages.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-xl text-sm backdrop-blur-sm">
                    {currentPage + 1} / {note.previewPages.length}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300">{note.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg">
              <div className="text-white text-opacity-90 text-sm mb-1">Price</div>
              <div className="text-white text-xl">₹{note.price}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 rounded-xl shadow-lg">
              <div className="text-white text-opacity-90 text-sm mb-1">Rating</div>
              <div className="flex items-center gap-1 text-white">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xl">{note.rating}</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl shadow-lg">
              <div className="text-white text-opacity-90 text-sm mb-1">Sales</div>
              <div className="text-white text-xl">{note.salesCount}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg">
              <div className="text-white text-opacity-90 text-sm mb-1">Category</div>
              <div className="text-white text-xl capitalize">{note.category}</div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-5 rounded-2xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Uploaded by</div>
                <div className="text-gray-900 dark:text-white">{note.uploaderName}</div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 dark:text-white">Reviews ({reviews.length})</h3>
              {hasPurchased && !hasReviewed && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                >
                  Write a Review
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${star <= reviewRating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">Comment</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this note..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                    required
                  />
                </div>
                {reviewError && (
                  <div className="mb-4 text-red-600 dark:text-red-400 text-sm">{reviewError}</div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {loadingReviews ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-900 dark:text-white font-medium">{review.userName}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{review.comment}</p>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">{review.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}