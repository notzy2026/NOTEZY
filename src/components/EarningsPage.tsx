import { IndianRupee, TrendingUp, ShoppingBag, FileText, Wallet, X, Clock, CheckCircle } from 'lucide-react';
import { Note, PayoutRequest } from '../types';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPlatformFee, createPayoutRequest, getUserPayoutStatus } from '../lib/firestore';

interface EarningsPageProps {
  totalEarnings: number;
  uploadedNotes: Note[];
}

export function EarningsPage({ totalEarnings, uploadedNotes }: EarningsPageProps) {
  const { user, userProfile } = useAuth();
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [platformFee, setPlatformFee] = useState(30);
  const [pendingPayout, setPendingPayout] = useState<PayoutRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculate total sales
  const totalSales = uploadedNotes.reduce((sum, note) => sum + note.salesCount, 0);

  // Calculate earnings breakdown
  const earningsBreakdown = uploadedNotes.map(note => ({
    ...note,
    earnings: note.price * note.salesCount
  })).sort((a, b) => b.earnings - a.earnings);

  // Calculate net amount after fee
  const netAmount = totalEarnings * (1 - platformFee / 100);

  useEffect(() => {
    async function loadData() {
      try {
        const fee = await getPlatformFee();
        setPlatformFee(fee);

        if (user?.uid) {
          const payout = await getUserPayoutStatus(user.uid);
          setPendingPayout(payout);
        }
      } catch (error) {
        console.error('Error loading payout data:', error);
      }
    }
    loadData();
  }, [user?.uid]);

  async function handleRedeemSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !userProfile || !upiId.trim()) return;

    // Validate UPI ID format
    const upiPattern = /^[\w.-]+@[\w]+$/;
    if (!upiPattern.test(upiId.trim())) {
      setError('Invalid UPI ID format (e.g., name@upi)');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await createPayoutRequest(
        user.uid,
        userProfile.name,
        userProfile.email,
        upiId.trim(),
        totalEarnings
      );
      const payout = await getUserPayoutStatus(user.uid);
      setPendingPayout(payout);
      setShowRedeemModal(false);
      setUpiId('');
    } catch (error: any) {
      setError(error.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 lg:pb-8 lg:ml-64 mobile-page-content">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
            <IndianRupee className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white">My Earnings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track your sales performance</p>
          </div>
        </div>

        {/* Pending Payout Banner */}
        {pendingPayout && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">Payout Request Pending</p>
                <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                  ₹{pendingPayout.netAmount.toFixed(2)} will be sent to {pendingPayout.upiId}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee className="w-8 h-8" />
              <span className="text-white text-opacity-90">Available Balance</span>
            </div>
            <div className="text-white text-3xl">₹{totalEarnings.toFixed(2)}</div>
            <div className="text-white text-opacity-75 text-sm mt-1">
              You'll receive ₹{netAmount.toFixed(2)} ({100 - platformFee}% after {platformFee}% platform fee)
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="w-8 h-8" />
              <span className="text-white text-opacity-90">Total Sales</span>
            </div>
            <div className="text-white text-3xl">{totalSales}</div>
            <div className="text-white text-opacity-75 text-sm mt-1">Notes sold</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8" />
              <span className="text-white text-opacity-90">Active Listings</span>
            </div>
            <div className="text-white text-3xl">{uploadedNotes.length}</div>
            <div className="text-white text-opacity-75 text-sm mt-1">Available for sale</div>
          </div>
        </div>

        {/* Redeem Button */}
        {totalEarnings > 0 && !pendingPayout && (
          <div className="mb-8">
            <button
              onClick={() => setShowRedeemModal(true)}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-medium text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
            >
              <Wallet className="w-6 h-6" />
              Redeem ₹{netAmount.toFixed(2)} to UPI
            </button>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Platform fee: {platformFee}% • You'll receive {100 - platformFee}% of your earnings
            </p>
          </div>
        )}

        {/* Earnings Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-gray-900 dark:text-white">Earnings Breakdown</h2>
          </div>

          {earningsBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Note Title</th>
                    <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Price</th>
                    <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Sales</th>
                    <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Rating</th>
                    <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {earningsBreakdown.map((note) => (
                    <tr key={note.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{note.title}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">₹{note.price}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{note.salesCount}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <span className="text-gray-900 dark:text-white">{note.rating}</span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">({note.reviewCount})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ₹{note.earnings.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
              <p>No earnings yet. Start uploading notes to earn!</p>
            </div>
          )}
        </div>
      </div>

      {/* Redeem Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900 dark:text-white">Redeem Earnings</h2>
              <button
                onClick={() => setShowRedeemModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl mb-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Total Earnings</span>
                <span className="text-gray-900 dark:text-white font-medium">₹{totalEarnings.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Platform Fee ({platformFee}%)</span>
                <span className="text-red-600 dark:text-red-400">-₹{(totalEarnings * platformFee / 100).toFixed(2)}</span>
              </div>
              <div className="border-t border-green-200 dark:border-green-700 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-green-700 dark:text-green-400 font-medium">You'll Receive</span>
                  <span className="text-green-700 dark:text-green-400 font-bold text-xl">₹{netAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleRedeemSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">Your UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  required
                />
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                  Enter your UPI ID (e.g., name@paytm, name@gpay, 9876543210@ybl)
                </p>
              </div>

              {error && (
                <div className="mb-4 text-red-600 dark:text-red-400 text-sm">{error}</div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRedeemModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !upiId.trim()}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>

            <p className="text-gray-500 dark:text-gray-400 text-xs text-center mt-4">
              Admin will manually process your payout within 24-48 hours
            </p>
          </div>
        </div>
      )}
    </div>
  );
}