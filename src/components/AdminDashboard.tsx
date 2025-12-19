import { Users, FileText, IndianRupee, MessageSquare, TrendingUp, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserProfile, Note } from '../types';
import { getAllUsers, getNotes } from '../lib/firestore';

interface AdminDashboardProps {
    onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [usersData, notesData] = await Promise.all([
                    getAllUsers(),
                    getNotes(),
                ]);
                setUsers(usersData);
                setNotes(notesData);
            } catch (error) {
                console.error('Error loading admin data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const totalEarnings = users.reduce((sum, user) => sum + user.totalEarnings, 0);
    const totalSales = notes.reduce((sum, note) => sum + note.salesCount, 0);

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
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl text-gray-900 dark:text-white">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your platform</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-8 h-8" />
                            <span className="text-white text-opacity-90">Total Users</span>
                        </div>
                        <div className="text-3xl font-bold">{users.length}</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-8 h-8" />
                            <span className="text-white text-opacity-90">Total Notes</span>
                        </div>
                        <div className="text-3xl font-bold">{notes.length}</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <IndianRupee className="w-8 h-8" />
                            <span className="text-white text-opacity-90">Total Revenue</span>
                        </div>
                        <div className="text-3xl font-bold">₹{totalEarnings.toFixed(2)}</div>
                    </div>

                    <div className="text-white p-6 rounded-2xl shadow-xl" style={{ backgroundColor: '#f97316' }}>
                        <div className="flex items-center gap-3 mb-2">
                            <Star className="w-8 h-8" />
                            <span className="text-white text-opacity-90">Total Sales</span>
                        </div>
                        <div className="text-3xl font-bold">{totalSales}</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 className="text-xl text-gray-900 dark:text-white mb-4">Admin Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                        onClick={() => onNavigate('admin-earnings')}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all text-left"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                            <IndianRupee className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg text-gray-900 dark:text-white mb-2">User Earnings</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">View earnings for all users</p>
                    </button>

                    <button
                        onClick={() => onNavigate('admin-notes')}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all text-left"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                            <Star className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg text-gray-900 dark:text-white mb-2">Manage Notes</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Mark notes as top selling</p>
                    </button>

                    <button
                        onClick={() => onNavigate('admin-chats')}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all text-left"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg text-gray-900 dark:text-white mb-2">Support Chats</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Respond to customer queries</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
