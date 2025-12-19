import { Users, Shield, ShieldCheck, Ban, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getAllUsers, updateUserVerificationStatus, updateUserBlockStatus } from '../lib/firestore';

export function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            const usersData = await getAllUsers();
            // Filter out admin users
            setUsers(usersData.filter(u => !u.isAdmin));
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleVerified(userId: string, currentStatus: boolean) {
        setUpdating(userId);
        try {
            await updateUserVerificationStatus(userId, !currentStatus);
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, isVerified: !currentStatus } : u
            ));
        } catch (error) {
            console.error('Error updating verification status:', error);
        } finally {
            setUpdating(null);
        }
    }

    async function handleToggleBlocked(userId: string, currentStatus: boolean) {
        setUpdating(userId);
        try {
            await updateUserBlockStatus(userId, !currentStatus);
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, isBlocked: !currentStatus } : u
            ));
        } catch (error) {
            console.error('Error updating block status:', error);
        } finally {
            setUpdating(null);
        }
    }

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
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#db2777' }}>
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl text-gray-900 dark:text-white">Manage Users</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Verify or block platform users</p>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                    <th className="text-left p-4 text-gray-600 dark:text-gray-400 font-medium">User</th>
                                    <th className="text-left p-4 text-gray-600 dark:text-gray-400 font-medium">Email</th>
                                    <th className="text-left p-4 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                                    <th className="text-left p-4 text-gray-600 dark:text-gray-400 font-medium">Notes</th>
                                    <th className="text-left p-4 text-gray-600 dark:text-gray-400 font-medium">Earnings</th>
                                    <th className="text-right p-4 text-gray-600 dark:text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: '#6366f1' }}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-gray-900 dark:text-white font-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                {user.isVerified && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                                                        <ShieldCheck className="w-3 h-3" />
                                                        Verified
                                                    </span>
                                                )}
                                                {user.isBlocked && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                                                        <Ban className="w-3 h-3" />
                                                        Blocked
                                                    </span>
                                                )}
                                                {!user.isVerified && !user.isBlocked && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                                                        Unverified
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">{user.uploadedNotes.length}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-400">₹{user.totalEarnings.toFixed(2)}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleToggleVerified(user.id, user.isVerified || false)}
                                                    disabled={updating === user.id}
                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${user.isVerified
                                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                            : 'text-white hover:opacity-90'
                                                        }`}
                                                    style={!user.isVerified ? { backgroundColor: '#16a34a' } : {}}
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    {user.isVerified ? 'Unverify' : 'Verify'}
                                                </button>
                                                <button
                                                    onClick={() => handleToggleBlocked(user.id, user.isBlocked || false)}
                                                    disabled={updating === user.id}
                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${user.isBlocked
                                                            ? 'text-white hover:opacity-90'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400'
                                                        }`}
                                                    style={user.isBlocked ? { backgroundColor: '#16a34a' } : {}}
                                                >
                                                    {user.isBlocked ? (
                                                        <>
                                                            <Shield className="w-4 h-4" />
                                                            Unblock
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Ban className="w-4 h-4" />
                                                            Block
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                            <p className="text-gray-500 dark:text-gray-400">No users found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
