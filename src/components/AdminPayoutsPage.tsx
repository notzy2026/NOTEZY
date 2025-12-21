import { IndianRupee, ArrowLeft, CheckCircle, Clock, Settings, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PayoutRequest } from '../types';
import { getPendingPayouts, getAllPayouts, markPayoutComplete, getPlatformFee, updatePlatformFee } from '../lib/firestore';

interface AdminPayoutsPageProps {
    onBack: () => void;
}

export function AdminPayoutsPage({ onBack }: AdminPayoutsPageProps) {
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [platformFee, setPlatformFee] = useState(30);
    const [newFee, setNewFee] = useState('30');
    const [savingFee, setSavingFee] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        loadData();
    }, [showAll]);

    async function loadData() {
        setLoading(true);
        try {
            const [payoutsData, fee] = await Promise.all([
                showAll ? getAllPayouts() : getPendingPayouts(),
                getPlatformFee()
            ]);
            setPayouts(payoutsData);
            setPlatformFee(fee);
            setNewFee(fee.toString());
        } catch (error) {
            console.error('Error loading payouts:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleMarkComplete(requestId: string) {
        setProcessingId(requestId);
        try {
            await markPayoutComplete(requestId);
            await loadData();
        } catch (error) {
            console.error('Error marking payout complete:', error);
            alert('Failed to process payout');
        } finally {
            setProcessingId(null);
        }
    }

    async function handleSaveFee() {
        const feeValue = parseFloat(newFee);
        if (isNaN(feeValue) || feeValue < 0 || feeValue > 100) {
            alert('Fee must be between 0 and 100');
            return;
        }
        setSavingFee(true);
        try {
            await updatePlatformFee(feeValue);
            setPlatformFee(feeValue);
            alert('Platform fee updated successfully');
        } catch (error) {
            console.error('Error updating fee:', error);
            alert('Failed to update fee');
        } finally {
            setSavingFee(false);
        }
    }

    const pendingCount = payouts.filter(p => p.status === 'pending').length;
    const totalPendingAmount = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.netAmount, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 lg:ml-64 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 lg:pb-8 lg:ml-64 mobile-page-content">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <IndianRupee className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl text-gray-900 dark:text-white">Payout Requests</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {pendingCount} pending • ₹{totalPendingAmount.toFixed(2)} to pay
                            </p>
                        </div>
                    </div>
                </div>

                {/* Platform Fee Settings */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings className="w-5 h-5 text-gray-500" />
                        <h2 className="text-lg text-gray-900 dark:text-white">Platform Fee Settings</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 max-w-xs">
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Platform Fee Percentage
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={newFee}
                                    onChange={(e) => setNewFee(e.target.value)}
                                    min="0"
                                    max="100"
                                    className="w-24 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                />
                                <span className="text-gray-500">%</span>
                            </div>
                        </div>
                        <button
                            onClick={handleSaveFee}
                            disabled={savingFee || newFee === platformFee.toString()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 mt-6"
                        >
                            <Save className="w-4 h-4" />
                            {savingFee ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                        Current: {platformFee}% • Sellers receive {100 - platformFee}% of their earnings
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setShowAll(false)}
                        className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${!showAll
                            ? 'text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        style={!showAll ? { backgroundColor: '#2563eb' } : undefined}
                    >
                        <Clock className="w-4 h-4" />
                        Pending
                    </button>
                    <button
                        onClick={() => setShowAll(true)}
                        className={`px-4 py-2 rounded-xl font-medium transition-colors ${showAll
                            ? 'text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        style={showAll ? { backgroundColor: '#2563eb' } : undefined}
                    >
                        All Payouts
                    </button>
                </div>

                {/* Payouts Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg">
                    {payouts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">User</th>
                                        <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">UPI ID</th>
                                        <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Gross</th>
                                        <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Fee</th>
                                        <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Net Amount</th>
                                        <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Status</th>
                                        <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {payouts.map((payout) => (
                                        <tr key={payout.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-gray-900 dark:text-white font-medium">{payout.userName}</div>
                                                    <div className="text-gray-500 dark:text-gray-400 text-sm">{payout.userEmail}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg text-sm font-mono">
                                                    {payout.upiId}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                ₹{payout.grossAmount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-red-600 dark:text-red-400">
                                                {payout.platformFee}%
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-green-600 dark:text-green-400 font-bold">
                                                    ₹{payout.netAmount.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {payout.status === 'pending' ? (
                                                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                                        <Clock className="w-4 h-4" />
                                                        Pending
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Completed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {payout.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleMarkComplete(payout.id)}
                                                        disabled={processingId === payout.id}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {processingId === payout.id ? (
                                                            <>Processing...</>
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="w-4 h-4" />
                                                                Mark Paid
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                            <p>No {showAll ? '' : 'pending '}payout requests</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
