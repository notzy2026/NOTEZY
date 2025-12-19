import { Star, ArrowLeft, Search, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Note } from '../types';
import { getNotes, setNoteTopSelling } from '../lib/firestore';

interface AdminNotesPageProps {
    onBack: () => void;
}

export function AdminNotesPage({ onBack }: AdminNotesPageProps) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        loadNotes();
    }, []);

    async function loadNotes() {
        try {
            const notesData = await getNotes();
            setNotes(notesData);
        } catch (error) {
            console.error('Error loading notes:', error);
        } finally {
            setLoading(false);
        }
    }

    async function toggleTopSelling(noteId: string, currentValue: boolean) {
        setUpdating(noteId);
        try {
            await setNoteTopSelling(noteId, !currentValue);
            setNotes(notes.map(note =>
                note.id === noteId ? { ...note, isTopSelling: !currentValue } : note
            ));
        } catch (error) {
            console.error('Error updating note:', error);
        } finally {
            setUpdating(null);
        }
    }

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.uploaderName.toLowerCase().includes(searchQuery.toLowerCase())
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
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Star className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl text-gray-900 dark:text-white">Manage Notes</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Mark notes as top selling</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>

                {/* Notes Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Note</th>
                                    <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Uploader</th>
                                    <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Price</th>
                                    <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Sales</th>
                                    <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Top Selling</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredNotes.map((note) => (
                                    <tr key={note.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {note.thumbnailUrl ? (
                                                    <img src={note.thumbnailUrl} alt={note.title} className="w-12 h-12 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                                                )}
                                                <div>
                                                    <div className="text-gray-900 dark:text-white font-medium">{note.title}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{note.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{note.uploaderName}</td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">₹{note.price}</td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{note.salesCount}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleTopSelling(note.id, note.isTopSelling || false)}
                                                disabled={updating === note.id}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${note.isTopSelling
                                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700'
                                                    } ${updating === note.id ? 'opacity-50' : 'hover:scale-105'}`}
                                            >
                                                {updating === note.id ? (
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <>
                                                        <TrendingUp className="w-4 h-4" />
                                                        {note.isTopSelling ? 'Top Selling' : 'Mark Top'}
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredNotes.length === 0 && (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            No notes found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
