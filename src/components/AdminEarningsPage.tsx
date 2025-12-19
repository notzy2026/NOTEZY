import { IndianRupee, ArrowLeft, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getAllUsers } from '../lib/firestore';

interface AdminEarningsPageProps {
    onBack: () => void;
}

export function AdminEarningsPage({ onBack }: AdminEarningsPageProps) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function loadUsers() {
            try {
                const usersData = await getAllUsers();
                setUsers(usersData.sort((a, b) => b.totalEarnings - a.totalEarnings));
            } catch (error) {
                console.error('Error loading users:', error);
            } finally {
                setLoading(false);
            }
        }
        loadUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalEarnings = users.reduce((sum, user) => sum + user.totalEarnings, 0);

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
                            <h1 className="text-2xl text-gray-900 dark:text-white">User Earnings</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Platform Revenue: ₹{totalEarnings.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">User</th>
                                    <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Email</th>
                                    <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Notes Uploaded</th>
                                    <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Total Earnings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-medium">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-gray-900 dark:text-white">{user.name}</span>
                                                {user.isAdmin && (
                                                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.uploadedNotes.length}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-green-600 dark:text-green-400 font-medium">
                                                ₹{user.totalEarnings.toFixed(2)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            No users found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
