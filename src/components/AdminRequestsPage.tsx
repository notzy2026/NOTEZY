import { FileQuestion, ArrowLeft, Search, Clock, CheckCircle, Send, X, Link, ExternalLink, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NoteRequest } from '../types';
import { getAllNoteRequests, respondToNoteRequest, closeNoteRequest, deleteNoteRequest } from '../lib/firestore';

interface AdminRequestsPageProps {
    onBack: () => void;
}

export function AdminRequestsPage({ onBack }: AdminRequestsPageProps) {
    const [requests, setRequests] = useState<NoteRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [respondingTo, setRespondingTo] = useState<NoteRequest | null>(null);
    const [response, setResponse] = useState('');
    const [responseLink, setResponseLink] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'responded'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadRequests();
    }, []);

    async function loadRequests() {
        try {
            const data = await getAllNoteRequests();
            setRequests(data);
        } catch (error) {
            console.error('Error loading requests:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleRespond() {
        if (!respondingTo || !response.trim()) return;

        setSubmitting(true);
        try {
            await respondToNoteRequest(respondingTo.id, response.trim(), responseLink.trim() || undefined);
            setRequests(prev => prev.map(r =>
                r.id === respondingTo.id ? { ...r, status: 'responded' as const, response: response.trim(), responseLink: responseLink.trim() } : r
            ));
            setRespondingTo(null);
            setResponse('');
            setResponseLink('');
        } catch (error) {
            console.error('Error responding:', error);
            alert('Failed to send response');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleClose(requestId: string) {
        try {
            await closeNoteRequest(requestId);
            setRequests(prev => prev.map(r =>
                r.id === requestId ? { ...r, status: 'closed' as const } : r
            ));
        } catch (error) {
            console.error('Error closing request:', error);
        }
    }

    async function handleDelete(requestId: string) {
        try {
            await deleteNoteRequest(requestId);
            setRequests(prev => prev.filter(r => r.id !== requestId));
            setDeletingId(null);
        } catch (error) {
            console.error('Error deleting request:', error);
            alert('Failed to delete request');
        }
    }

    const filteredRequests = requests.filter(r => {
        const matchesFilter = filter === 'all' || r.status === filter;
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const pendingCount = requests.filter(r => r.status === 'pending').length;

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
                    <button onClick={onBack} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                            <FileQuestion className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl text-gray-900 dark:text-white">Note Requests</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{pendingCount} pending requests</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(['pending', 'responded', 'all'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl font-medium transition-colors capitalize ${filter === f
                                    ? 'text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                style={filter === f ? { backgroundColor: '#2563eb' } : undefined}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Requests List */}
                {filteredRequests.length > 0 ? (
                    <div className="space-y-4">
                        {filteredRequests.map((request) => (
                            <div key={request.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg text-gray-900 dark:text-white font-medium">{request.title}</h3>
                                            <span className="text-sm px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded capitalize">
                                                {request.category.replace('-', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            by {request.userName} • {request.userEmail}
                                        </p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${request.status === 'pending'
                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                        : request.status === 'responded'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        }`}>
                                        {request.status === 'pending' && <Clock className="w-3 h-3" />}
                                        {request.status === 'responded' && <CheckCircle className="w-3 h-3" />}
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 mb-4">{request.description}</p>

                                {/* Previous Response */}
                                {request.response && (
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-4 border border-green-200 dark:border-green-800">
                                        <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">Your Response:</p>
                                        <p className="text-gray-700 dark:text-gray-300">{request.response}</p>
                                        {request.responseLink && (
                                            <a href={request.responseLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 mt-2 text-sm">
                                                <ExternalLink className="w-3 h-3" />
                                                {request.responseLink}
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    {request.status === 'pending' && (
                                        <button
                                            onClick={() => setRespondingTo(request)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                            Respond
                                        </button>
                                    )}
                                    {request.status !== 'closed' && (
                                        <button
                                            onClick={() => handleClose(request.id)}
                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Close Request
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setDeletingId(request.id)}
                                        className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                        <CheckCircle className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                        <h3 className="text-gray-900 dark:text-white mb-2">No Requests Found</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {filter === 'pending' ? 'All pending requests have been handled!' : 'No requests match your search.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Response Modal */}
            {respondingTo && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl text-gray-900 dark:text-white">Respond to Request</h2>
                            <button onClick={() => setRespondingTo(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
                                <h4 className="text-gray-900 dark:text-white font-medium">{respondingTo.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{respondingTo.description}</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Your Response</label>
                                    <textarea
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        placeholder="Provide helpful information or let them know if notes are available..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                                        <Link className="w-4 h-4 inline mr-1" />
                                        Link to Notes (optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={responseLink}
                                        onChange={(e) => setResponseLink(e.target.value)}
                                        placeholder="https://example.com/notes or link to uploaded note"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <button
                                    onClick={handleRespond}
                                    disabled={submitting || !response.trim()}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                    {submitting ? 'Sending...' : 'Send Response'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingId && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-xl text-gray-900 dark:text-white font-semibold">Delete Request</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to permanently delete this request? The user will no longer see it.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="flex-1 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deletingId)}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-5 h-5" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
