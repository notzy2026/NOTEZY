import { Users, Shield, ShieldCheck, Ban, CheckCircle, Search, X, Mail, FileText, IndianRupee, Eye, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getAllUsers, updateUserVerificationStatus, updateUserBlockStatus } from '../lib/firestore';

export function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

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
            if (selectedUser?.id === userId) {
                setSelectedUser(prev => prev ? { ...prev, isVerified: !currentStatus } : null);
            }
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
            if (selectedUser?.id === userId) {
                setSelectedUser(prev => prev ? { ...prev, isBlocked: !currentStatus } : null);
            }
        } catch (error) {
            console.error('Error updating block status:', error);
        } finally {
            setUpdating(null);
        }
    }

    // Filter users by search query
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#db2777' }}>
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl text-gray-900 dark:text-white">Manage Users</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Verify or block platform users</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white"
                        />
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
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium overflow-hidden" style={{ backgroundColor: '#6366f1' }}>
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.name.charAt(0).toUpperCase()
                                                    )}
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
                                                {/* View Profile Button */}
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    title="View Profile"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
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

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchQuery ? 'No users found matching your search' : 'No users found'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* User Profile Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl text-gray-900 dark:text-white">User Profile</h2>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Profile Content */}
                        <div className="p-6">
                            {/* User Header */}
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-medium overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                                    {selectedUser.avatarUrl ? (
                                        <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="w-full h-full object-cover" />
                                    ) : (
                                        selectedUser.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl text-gray-900 dark:text-white font-medium mb-1">{selectedUser.name}</h3>
                                    {selectedUser.bio && (
                                        <p className="text-gray-600 dark:text-gray-400 italic mb-2">"{selectedUser.bio}"</p>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUser.isVerified && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                <ShieldCheck className="w-3 h-3" />
                                                Verified
                                            </span>
                                        )}
                                        {selectedUser.isBlocked && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                                <Ban className="w-3 h-3" />
                                                Blocked
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                    <Mail className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                                    <p className="text-sm text-gray-900 dark:text-white truncate">{selectedUser.email}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                    <FileText className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Uploaded Notes</p>
                                    <p className="text-2xl text-gray-900 dark:text-white font-bold">{selectedUser.uploadedNotes.length}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                    <IndianRupee className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Earnings</p>
                                    <p className="text-2xl text-gray-900 dark:text-white font-bold">₹{selectedUser.totalEarnings.toFixed(0)}</p>
                                </div>
                            </div>

                            {/* Uploaded Notes */}
                            {selectedUser.uploadedNotes.length > 0 && (
                                <div>
                                    <h4 className="text-gray-900 dark:text-white font-medium mb-3">Uploaded Notes</h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {selectedUser.uploadedNotes.map((note) => (
                                            <div key={note.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                                {note.thumbnailUrl ? (
                                                    <img src={note.thumbnailUrl} alt={note.title} className="w-12 h-12 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-gray-900 dark:text-white font-medium truncate">{note.title}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">₹{note.price} • {note.salesCount} sales</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    {note.isVerified && (
                                                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">Verified</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                                <button
                                    onClick={() => handleToggleVerified(selectedUser.id, selectedUser.isVerified || false)}
                                    disabled={updating === selectedUser.id}
                                    className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${selectedUser.isVerified
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                        : 'bg-green-600 text-white'
                                        }`}
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    {selectedUser.isVerified ? 'Remove Verification' : 'Verify User'}
                                </button>
                                <button
                                    onClick={() => handleToggleBlocked(selectedUser.id, selectedUser.isBlocked || false)}
                                    disabled={updating === selectedUser.id}
                                    className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${selectedUser.isBlocked
                                        ? 'bg-green-600 text-white'
                                        : 'bg-red-600 text-white'
                                        }`}
                                >
                                    {selectedUser.isBlocked ? (
                                        <>
                                            <Shield className="w-5 h-5" />
                                            Unblock User
                                        </>
                                    ) : (
                                        <>
                                            <Ban className="w-5 h-5" />
                                            Block User
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
