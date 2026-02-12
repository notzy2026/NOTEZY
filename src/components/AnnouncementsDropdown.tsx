import { useState, useEffect, useRef } from 'react';
import { Megaphone, X, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { Announcement } from '../types';
import { getAnnouncements, deleteAnnouncement, subscribeToAnnouncements } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';

export function AnnouncementsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const isOpenRef = useRef(false); // Ref to track open state without effect deps
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasUnread, setHasUnread] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { userProfile } = useAuth();
    const isAdmin = userProfile?.isAdmin || false;

    // Sync ref
    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    useEffect(() => {
        // Subscribe once, don't re-subscribe on toggle
        const unsubscribe = subscribeToAnnouncements((data) => {
            setAnnouncements(data);
            setLoading(false);

            // Check for unread
            if (data.length > 0) {
                const lastSeenId = localStorage.getItem('lastSeenAnnouncementId');
                const latestId = data[0].id;

                // Debug logs removed

                if (latestId !== lastSeenId) {
                    // Only set unread if the dropdown is NOT currently open
                    if (!isOpenRef.current) {
                        setHasUnread(true);
                    } else {
                        // If open, we just saw it
                        localStorage.setItem('lastSeenAnnouncementId', latestId);
                    }
                }
            }
        });

        return () => unsubscribe();
    }, []); // Empty dependency array = stable subscription

    const handleToggle = () => {
        if (!isOpen) {
            setIsOpen(true);
            // When opening, verify if we need to clear unread
            if (announcements.length > 0) {
                setHasUnread(false);
                localStorage.setItem('lastSeenAnnouncementId', announcements[0].id);
            }
        } else {
            setIsOpen(false);
        }
    };

    async function handleDelete(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                await deleteAnnouncement(id);
                // List will refresh automatically via subscription
            } catch (error) {
                console.error('Error deleting announcement:', error);
                alert('Failed to delete announcement');
            }
        }
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function formatTimeAgo(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors group"
                title="Announcements"
            >
                <Megaphone className="w-5 h-5 transition-transform group-hover:scale-110" />
                {hasUnread && (
                    <span
                        className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full z-50"
                        style={{ backgroundColor: '#DC2626' }} // Force red-600
                    />
                )}
            </button>

            {isOpen && (
                <div className="fixed left-2 right-2 top-16 w-auto lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-3 lg:w-[400px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-100 origin-top lg:origin-top-right">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Megaphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Announcements</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    <div className="max-h-[40rem] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : announcements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full mb-3">
                                    <AlertCircle className="w-6 h-6 opacity-50" />
                                </div>
                                <p className="text-sm font-medium">No announcements yet</p>
                                <p className="text-xs text-gray-400 mt-1">Check back later for updates</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {announcements.map((announcement) => (
                                    <div key={announcement.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <div className="flex items-start justify-between mb-2 gap-3">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                                                {announcement.title}
                                            </h4>
                                            <span className="flex-shrink-0 flex items-center text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                                {formatTimeAgo(announcement.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                            {announcement.message}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] text-white font-bold">
                                                    {announcement.authorName.charAt(0)}
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                    {announcement.authorName}
                                                </span>
                                            </div>

                                            {isAdmin && (
                                                <button
                                                    onClick={(e) => handleDelete(announcement.id, e)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete Announcement"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
