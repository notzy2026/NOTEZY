import { BookOpen, ArrowLeft, Plus, Trash2, ExternalLink, Link } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FreePYQ } from '../types';
import { getFreePYQs, addFreePYQ, deleteFreePYQ } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';

interface AdminFreePYQPageProps {
    onBack: () => void;
}

export function AdminFreePYQPage({ onBack }: AdminFreePYQPageProps) {
    const { userProfile } = useAuth();
    const [pyqs, setPyqs] = useState<FreePYQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [courseCode, setCourseCode] = useState('');
    const [courseName, setCourseName] = useState('');
    const [driveLink, setDriveLink] = useState('');

    useEffect(() => {
        loadPYQs();
    }, []);

    async function loadPYQs() {
        try {
            const data = await getFreePYQs();
            setPyqs(data);
        } catch (error) {
            console.error('Error loading PYQs:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!courseCode.trim() || !courseName.trim() || !driveLink.trim()) return;

        setSubmitting(true);
        try {
            await addFreePYQ(
                courseCode.trim(),
                courseName.trim(),
                driveLink.trim(),
                userProfile?.name || 'Admin'
            );
            await loadPYQs();
            setCourseCode('');
            setCourseName('');
            setDriveLink('');
            setShowForm(false);
        } catch (error) {
            console.error('Error adding PYQ:', error);
            alert('Failed to add PYQ');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(pyqId: string) {
        if (!confirm('Are you sure you want to delete this PYQ?')) return;

        try {
            await deleteFreePYQ(pyqId);
            setPyqs(prev => prev.filter(p => p.id !== pyqId));
        } catch (error) {
            console.error('Error deleting PYQ:', error);
            alert('Failed to delete PYQ');
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 lg:ml-64 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 lg:pb-8 lg:ml-64 mobile-page-content">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors">
                            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl text-gray-900 dark:text-white">Free PYQ Papers</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{pyqs.length} papers available</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 text-white rounded-xl flex items-center gap-2 hover:opacity-90 transition-colors shadow-md"
                        style={{ backgroundColor: '#16a34a' }}
                    >
                        <Plus className="w-5 h-5" />
                        Add PYQ
                    </button>
                </div>

                {/* Add Form */}
                {showForm && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-lg">
                        <h2 className="text-lg text-gray-900 dark:text-white mb-4">Add New PYQ Paper</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Course Code</label>
                                    <input
                                        type="text"
                                        value={courseCode}
                                        onChange={(e) => setCourseCode(e.target.value)}
                                        placeholder="e.g., CS101"
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Course Name</label>
                                    <input
                                        type="text"
                                        value={courseName}
                                        onChange={(e) => setCourseName(e.target.value)}
                                        placeholder="e.g., Introduction to Programming"
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    <Link className="w-4 h-4 inline mr-1" />
                                    Google Drive Link
                                </label>
                                <input
                                    type="url"
                                    value={driveLink}
                                    onChange={(e) => setDriveLink(e.target.value)}
                                    placeholder="https://drive.google.com/..."
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-white rounded-xl hover:opacity-90 disabled:opacity-50"
                                    style={{ backgroundColor: '#16a34a' }}
                                >
                                    {submitting ? 'Adding...' : 'Add PYQ'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* PYQ List */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg">
                    {pyqs.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Course Code</th>
                                        <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Course Name</th>
                                        <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Drive Link</th>
                                        <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Added By</th>
                                        <th className="px-6 py-4 text-left text-sm text-gray-600 dark:text-gray-400">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {pyqs.map((pyq) => (
                                        <tr key={pyq.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-mono bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-sm">
                                                    {pyq.courseCode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 dark:text-white">
                                                {pyq.courseName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <a
                                                    href={pyq.driveLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Open
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                                                {pyq.addedBy}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDelete(pyq.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                            <p>No PYQ papers added yet</p>
                            <p className="text-sm mt-1">Click "Add PYQ" to add your first paper</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
