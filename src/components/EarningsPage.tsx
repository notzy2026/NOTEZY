import { IndianRupee, TrendingUp, ShoppingBag, FileText } from 'lucide-react';
import { Note } from '../types';

interface EarningsPageProps {
  totalEarnings: number;
  uploadedNotes: Note[];
}

export function EarningsPage({ totalEarnings, uploadedNotes }: EarningsPageProps) {
  // Calculate total sales
  const totalSales = uploadedNotes.reduce((sum, note) => sum + note.salesCount, 0);

  // Calculate earnings breakdown
  const earningsBreakdown = uploadedNotes.map(note => ({
    ...note,
    earnings: note.price * note.salesCount
  })).sort((a, b) => b.earnings - a.earnings);

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

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee className="w-8 h-8" />
              <span className="text-white text-opacity-90">Total Earnings</span>
            </div>
            <div className="text-white text-3xl">₹{totalEarnings.toFixed(2)}</div>
            <div className="text-white text-opacity-75 text-sm mt-1">All time revenue</div>
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
    </div>
  );
}