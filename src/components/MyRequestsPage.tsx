import { FileQuestion, Plus, X, Clock, CheckCircle, Link, ExternalLink, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NoteRequest, NoteCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { createNoteRequest, getUserNoteRequests } from '../lib/firestore';

export function MyRequestsPage() {
    const { user, userProfile } = useAuth();
    const [requests, setRequests] = useState<NoteRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<NoteCategory>('lecture-notes');

    useEffect(() => {
        if (user) {
            loadRequests();
        }
    }, [user]);

    async function loadRequests() {
        if (!user) return;
        try {
            const data = await getUserNoteRequests(user.uid);
            setRequests(data);
        } catch (error) {
            console.error('Error loading requests:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user || !userProfile || !title.trim() || !description.trim()) return;

        setSubmitting(true);
        try {
            await createNoteRequest(
                user.uid,
                userProfile.name,
                userProfile.email,
                title.trim(),
                description.trim(),
                category
            );
            setTitle('');
            setDescription('');
            setCategory('lecture-notes');
            setShowForm(false);
            await loadRequests();
        } catch (error) {
            console.error('Error creating request:', error);
            alert('Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    }

    const getStatusBadge = (status: NoteRequest['status']) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
                        <Clock className="w-3 h-3" />
                        Pending
                    </span>
                );
            case 'responded':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Responded
                    </span>
                );
            case 'closed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        Closed
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 lg:ml-64 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 lg:pb-8 lg:ml-64 mobile-page-content">
            <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                            <FileQuestion className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl text-gray-900 dark:text-white">My Requests</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Request notes you can't find</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl flex items-center gap-2 hover:shadow-lg transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        New Request
                    </button>
                </div>

                {/* Request Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                                <h2 className="text-xl text-gray-900 dark:text-white">Request Notes</h2>
                                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Title / Subject</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Data Structures - Unit 3"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as NoteCategory)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    >
                                        <option value="lecture-notes">Lecture Notes</option>
                                        <option value="assignment">Assignment</option>
                                        <option value="pyq">PYQ (Previous Year Question)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe what you're looking for, course code, semester, etc."
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Requests List */}
                {requests.length > 0 ? (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div key={request.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-lg text-gray-900 dark:text-white font-medium">{request.title}</h3>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{request.category.replace('-', ' ')}</span>
                                    </div>
                                    {getStatusBadge(request.status)}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">{request.description}</p>
                                <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                                    Requested on {new Date(request.createdAt).toLocaleDateString()}
                                </div>

                                {/* Response Section */}
                                {request.response && (
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                                            <MessageSquare className="w-4 h-4" />
                                            <span className="font-medium">Admin Response</span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300">{request.response}</p>
                                        {request.responseLink && (
                                            <a
                                                href={request.responseLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                View Notes
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                        <FileQuestion className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                        <h3 className="text-gray-900 dark:text-white mb-2">No Requests Yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Can't find notes you need? Submit a request!
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                        >
                            Submit Your First Request
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
