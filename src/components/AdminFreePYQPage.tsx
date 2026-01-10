
import { BookOpen, ArrowLeft, Plus, Trash2, ExternalLink, File, Loader2, Link as LinkIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FreePYQ } from '../types';
import { getFreePYQs, deleteFreePYQ, addFreePYQ } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface AdminFreePYQPageProps {
    onBack: () => void;
}

type UploadMode = 'file' | 'link';

export function AdminFreePYQPage({ onBack }: AdminFreePYQPageProps) {
    const { userProfile } = useAuth();
    const [pyqs, setPyqs] = useState<FreePYQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    // Form State
    const [courseCode, setCourseCode] = useState('');
    const [courseName, setCourseName] = useState('');
    const [uploadMode, setUploadMode] = useState<UploadMode>('file');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [manualLink, setManualLink] = useState('');

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

    // --- Direct Drive Upload Logic ---

    async function getAccessToken(): Promise<{ accessToken: string; parentFolderId?: string }> {
        const functions = getFunctions(undefined, 'asia-south1');
        const getDriveAccessToken = httpsCallable(functions, 'getDriveAccessToken');
        const result = await getDriveAccessToken();
        return result.data as any;
    }

    async function searchOrCreateFolder(token: string, parentId: string | undefined, name: string): Promise<{ id: string, webViewLink: string }> {
        // 1. Search for existing folder
        let query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        if (parentId) {
            query += ` and '${parentId}' in parents`;
        }

        const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,webViewLink)`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const searchData = await searchRes.json();

        if (searchData.files && searchData.files.length > 0) {
            // Folder exists - return it
            return { id: searchData.files[0].id, webViewLink: searchData.files[0].webViewLink };
        }

        // 2. Create new folder
        const metadata: any = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
        };
        if (parentId) {
            metadata.parents = [parentId];
        }

        const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,webViewLink', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadata)
        });
        const createData = await createRes.json();

        if (createData.error) throw new Error(createData.error.message);
        return { id: createData.id, webViewLink: createData.webViewLink };
    }

    async function uploadFileToDrive(token: string, folderId: string, file: File): Promise<{ id: string }> {
        const metadata = {
            name: file.name,
            parents: [folderId]
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        // Uses multipart upload
        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form
        });
        const data = await res.json();

        if (data.error) throw new Error(data.error.message);
        return data; // { id }
    }

    async function makeFolderPublic(token: string, folderId: string) {
        // Make the FOLDER publicly viewable (all files inside inherit this)
        await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role: 'reader',
                type: 'anyone'
            })
        });
    }

    // --- End Direct Drive Upload Logic ---

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        if (!courseCode.trim() || !courseName.trim()) {
            alert('Please fill in course details');
            return;
        }

        if (uploadMode === 'file' && selectedFiles.length === 0) {
            alert('Please select files to upload');
            return;
        }

        if (uploadMode === 'link' && !manualLink.trim()) {
            alert('Please enter a Google Drive link');
            return;
        }

        setSubmitting(true);
        setUploadProgress('Initializing...');

        try {
            if (uploadMode === 'link') {
                // MANUAL LINK MODE
                await addFreePYQ(
                    courseCode.trim().toUpperCase(),
                    courseName.trim(),
                    manualLink.trim(),
                    userProfile?.name || 'Admin',
                    undefined // No folder ID for manual links
                );
            } else {
                // FILE UPLOAD MODE
                // 1. Get Access Token from Backend (securely using stored refresh token)
                setUploadProgress('Authenticating...');
                const { accessToken, parentFolderId } = await getAccessToken();
    
                // 2. Find or Create Folder
                setUploadProgress('Organizing folders...');
                const folderName = `${courseCode.trim().toUpperCase()} ${courseName.trim()}`;
                const { id: folderId, webViewLink: folderLink } = await searchOrCreateFolder(accessToken, parentFolderId, folderName);
    
                // 3. Make folder public (so all files inside are accessible)
                setUploadProgress('Setting folder permissions...');
                await makeFolderPublic(accessToken, folderId);
    
                // 4. Upload ALL files to the folder
                for (let i = 0; i < selectedFiles.length; i++) {
                    setUploadProgress(`Uploading file ${i + 1} of ${selectedFiles.length}...`);
                    await uploadFileToDrive(accessToken, folderId, selectedFiles[i]);
                }
    
                // 5. Save to Database (using FOLDER link, not file link)
                setUploadProgress('Saving to database...');
                await addFreePYQ(
                    courseCode.trim().toUpperCase(),
                    courseName.trim(),
                    folderLink, // This is the FOLDER link, not the file link
                    userProfile?.name || 'Admin',
                    folderId, // Store folder ID for deletion later
                );
            }

            // 6. Refresh List
            await loadPYQs();

            // Reset
            setCourseCode('');
            setCourseName('');
            setSelectedFiles([]);
            setManualLink('');
            setShowForm(false);
            setUploadProgress('');
            setUploadMode('file'); // Reset to default
            alert(uploadMode === 'file' ? `${selectedFiles.length} file(s) uploaded successfully!` : 'Manual link added successfully!');

        } catch (error: any) {
            console.error('Error adding PYQ:', error);
            alert(`Failed to add PYQ: ${error.message || 'Unknown error'}`);
        } finally {
            setSubmitting(false);
            setUploadProgress('');
        }
    }

    async function deleteFolderFromDrive(token: string, folderId: string) {
        // Delete the folder and all its contents from Google Drive
        console.log('Attempting to delete Drive folder:', folderId);
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            console.error('Drive delete failed:', res.status, error);
            throw new Error(error.error?.message || `Drive delete failed with status ${res.status}`);
        }
        console.log('Drive folder deleted successfully');
    }

    async function handleDelete(pyqId: string, driveFolderId?: string) {
        console.log('handleDelete called with:', { pyqId, driveFolderId });

        if (!confirm('Are you sure you want to delete this PYQ?' + (driveFolderId ? ' This will also delete the folder and all files from Google Drive!' : ''))) return;
        try {
            // Delete from Google Drive first (if we have the folder ID)
            if (driveFolderId) {
                console.log('Folder ID found, getting access token...');
                const { accessToken } = await getAccessToken();
                console.log('Got access token, deleting folder...');
                await deleteFolderFromDrive(accessToken, driveFolderId);
            } else {
                console.warn('No driveFolderId stored for this PYQ - cannot delete from Drive');
            }

            // Then delete from database
            await deleteFreePYQ(pyqId);
            setPyqs(prev => prev.filter(p => p.id !== pyqId));
            alert(driveFolderId ? 'PYQ and Drive folder deleted successfully!' : 'PYQ removed from database.');
        } catch (error: any) {
            console.error('Error deleting PYQ:', error);
            alert(`Failed to delete PYQ: ${error.message || 'Unknown error'}`);
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
                        
                        {/* Mode Toggle */}
                        <div className="flex gap-4 mb-6">
                            <button
                                type="button"
                                onClick={() => setUploadMode('file')}
                                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border-2 ${
                                    uploadMode === 'file'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : 'border-transparent bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                <File className="w-5 h-5" />
                                <span className="font-medium">Upload PDF Files</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setUploadMode('link')}
                                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border-2 ${
                                    uploadMode === 'link'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        : 'border-transparent bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                <LinkIcon className="w-5 h-5" />
                                <span className="font-medium">Manual Drive Link</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Course Code</label>
                                    <input
                                        type="text"
                                        value={courseCode}
                                        onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
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

                            {/* Conditional Input based on Mode */}
                            {uploadMode === 'file' ? (
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                                        <File className="w-4 h-4 inline mr-1" />
                                        PDF Files (Multiple)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
                                        <input
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            multiple
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    setSelectedFiles(Array.from(e.target.files));
                                                }
                                            }}
                                            className="hidden"
                                            id="pyq-file-upload"
                                            required
                                        />
                                        <label htmlFor="pyq-file-upload" className="cursor-pointer block w-full h-full">
                                            {selectedFiles.length > 0 ? (
                                                <div className="text-green-600 dark:text-green-400">
                                                    <File className="w-8 h-8 mx-auto mb-2" />
                                                    <span className="font-medium">{selectedFiles.length} file(s) selected</span>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {selectedFiles.map(f => f.name).join(', ')}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-gray-500 dark:text-gray-400">
                                                    <Plus className="w-8 h-8 mx-auto mb-2" />
                                                    <p>Click to select PDF files (multiple allowed)</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                                        <LinkIcon className="w-4 h-4 inline mr-1" />
                                        Google Drive Folder Link
                                    </label>
                                    <input
                                        type="url"
                                        value={manualLink}
                                        onChange={(e) => setManualLink(e.target.value)}
                                        placeholder="https://drive.google.com/drive/folders/..."
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-mono text-sm"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Paste the public share link of the Google Drive folder containing the PYQs.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 justify-end items-center">
                                {submitting && (
                                    <div className="text-sm text-gray-500 animate-pulse">
                                        {uploadProgress}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`px-4 py-2 text-white rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-2 ${
                                        uploadMode === 'file' ? 'bg-green-600' : 'bg-blue-600'
                                    }`}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        uploadMode === 'file' ? 'Upload & Add' : 'Add Link'
                                    )}
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
                                                    onClick={() => handleDelete(pyq.id, pyq.driveFolderId)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete PYQ and Drive folder"
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
