import { Upload, X, FileText, IndianRupee, Loader2, File, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { NoteRequest, NoteCategory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { createNote, fulfillNoteRequest } from '../lib/firestore';
import { uploadNotePreview, uploadNoteFile } from '../lib/storage';
import { extractPdfPreviews, getPdfPageCount } from '../lib/pdfUtils';
import { compressPdf, formatFileSize, CompressionResult } from '../lib/compressPdf';

interface FulfillUploadModalProps {
    request: NoteRequest;
    onClose: () => void;
    onSuccess: () => void;
}

export function FulfillUploadModal({ request, onClose, onSuccess }: FulfillUploadModalProps) {
    const { user, userProfile } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [noteFiles, setNoteFiles] = useState<File[]>([]);
    const [previewFiles, setPreviewFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [error, setError] = useState('');
    const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);

            setNoteFiles(files);
            setPreviewFiles([]);
            setError('');

            const firstFile = files[0];
            const fileType = firstFile.type;
            const fileName = firstFile.name.toLowerCase();

            const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');
            const isDoc = fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx') ||
                fileType.includes('presentation') || fileName.endsWith('.ppt') || fileName.endsWith('.pptx');

            if (isPdf) {
                // Auto-extract previews from the first PDF
                setExtracting(true);
                try {
                    const maxPreviewPages = request.category === 'assignment' ? 1 : 4;
                    const previews = await extractPdfPreviews(firstFile, maxPreviewPages);
                    setPreviewFiles(previews);
                } catch (err) {
                    console.error('Error extracting previews:', err);
                    setError('Could not extract previews. Please try a different PDF file.');
                } finally {
                    setExtracting(false);
                }
            } else if (isDoc) {
                // Supported but no image preview generation
            } else {
                setError(`Preview of ${fileType || 'this file type'} is not supported.`);
            }
        }
    };

    const removeFile = async (indexToRemove: number) => {
        const newFiles = noteFiles.filter((_, index) => index !== indexToRemove);
        setNoteFiles(newFiles);

        if (indexToRemove === 0 && newFiles.length > 0) {
            setExtracting(true);
            try {
                const maxPreviewPages = request.category === 'assignment' ? 1 : 4;
                const previews = await extractPdfPreviews(newFiles[0], maxPreviewPages);
                setPreviewFiles(previews);
            } catch (err) {
                setPreviewFiles([]);
            } finally {
                setExtracting(false);
            }
        } else if (newFiles.length === 0) {
            setPreviewFiles([]);
        }
    };

    const handleDragStart = (index: number) => setDraggedIndex(index);
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDragEnd = () => setDraggedIndex(null);

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            return;
        }

        const newFiles = [...noteFiles];
        const draggedFile = newFiles[draggedIndex];
        newFiles.splice(draggedIndex, 1);
        newFiles.splice(dropIndex, 0, draggedFile);
        setNoteFiles(newFiles);

        const firstFileChanged = draggedIndex === 0 || dropIndex === 0;
        if (firstFileChanged) {
            setExtracting(true);
            try {
                const maxPreviewPages = request.category === 'assignment' ? 1 : 4;
                const previews = await extractPdfPreviews(newFiles[0], maxPreviewPages);
                setPreviewFiles(previews);
            } catch (err) {
                console.error('Error extracting previews:', err);
            } finally {
                setExtracting(false);
            }
        }
        setDraggedIndex(null);
    };

    const getTotalFileSize = () => {
        const totalBytes = noteFiles.reduce((sum, file) => sum + file.size, 0);
        return (totalBytes / 1024 / 1024).toFixed(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !userProfile) {
            setError('You must be logged in to upload notes');
            return;
        }

        if (noteFiles.length === 0) {
            setError('Please upload at least one file');
            return;
        }

        if (parseFloat(price) < 20) {
            setError('Minimum price is ₹20');
            return;
        }

        setError('');
        setUploading(true);

        try {
            const tempId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Process files (compress only PDFs)
            setUploadProgress(`Processing ${noteFiles.length} file(s)...`);
            const processedFiles: File[] = [];
            const compressionResultsList: CompressionResult[] = [];

            for (let i = 0; i < noteFiles.length; i++) {
                const file = noteFiles[i];
                if (file.type === 'application/pdf') {
                    setUploadProgress(`Compressing PDF ${i + 1} of ${noteFiles.length}...`);
                    try {
                        const result = await compressPdf(file);
                        processedFiles.push(result.compressedFile);
                        compressionResultsList.push(result);
                    } catch {
                        processedFiles.push(file);
                    }
                } else {
                    processedFiles.push(file);
                }
            }
            setCompressionResults(compressionResultsList);

            // Upload files
            setUploadProgress(`Uploading ${processedFiles.length} file(s)...`);
            const fileUrls: string[] = [];
            for (let i = 0; i < processedFiles.length; i++) {
                setUploadProgress(`Uploading file ${i + 1} of ${processedFiles.length}...`);
                const url = await uploadNoteFile(processedFiles[i], `${tempId}_${i}`);
                fileUrls.push(url);
            }

            // Upload previews
            setUploadProgress('Uploading preview images...');
            const previewUrls: string[] = [];
            for (let i = 0; i < previewFiles.length; i++) {
                const url = await uploadNotePreview(previewFiles[i], tempId, i);
                previewUrls.push(url);
            }

            // Count pages (only for PDFs)
            setUploadProgress('Counting pages...');
            let totalPages = 0;
            for (const file of noteFiles) {
                if (file.type === 'application/pdf') {
                    const pageCount = await getPdfPageCount(file);
                    totalPages += pageCount;
                }
            }

            // Create note
            setUploadProgress('Creating note...');
            const noteId = await createNote({
                title,
                description,
                category: request.category,
                price: parseFloat(price),
                previewPages: previewUrls,
                thumbnailUrl: previewUrls[0] || '',
                pdfUrls: fileUrls,
                totalPages,
                uploaderId: user.uid,
                uploaderName: userProfile.name,
            });

            // Fulfill the request
            setUploadProgress('Marking request as fulfilled...');
            await fulfillNoteRequest(request.id, noteId, user.uid, userProfile.name);

            setUploadProgress('');
            onSuccess();
        } catch (err: any) {
            console.error('Error uploading:', err);
            setError(err.message || 'Failed to upload note. Please try again.');
            setUploadProgress('');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto my-4">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <div>
                        <h2 className="text-xl text-gray-900 dark:text-white font-semibold">Fulfill Request</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Upload notes for: <span className="text-purple-600 dark:text-purple-400">"{request.title}"</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        disabled={uploading}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Request Info */}
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                        <div className="text-sm text-purple-700 dark:text-purple-300">
                            <strong>Requested by:</strong> {request.userName}
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                            {request.description}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                            <FileText className="w-4 h-4" />
                            Note Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Complete Data Structures Notes"
                            required
                            disabled={uploading}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500 disabled:opacity-50"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                            <FileText className="w-4 h-4" />
                            Description *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what's included in your notes..."
                            required
                            disabled={uploading}
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-gray-900 dark:text-white placeholder-gray-500 disabled:opacity-50"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                            <IndianRupee className="w-4 h-4" />
                            Price (₹ INR) *
                        </label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="20"
                            step="0.01"
                            min="20"
                            required
                            disabled={uploading}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500 disabled:opacity-50"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum price: ₹20</p>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                            <File className="w-4 h-4" />
                            Files *
                        </label>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">Upload files (PDF, DOCX, PPT, etc.)</p>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 text-gray-900 dark:text-white disabled:opacity-50"
                        />
                        {noteFiles.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <div className="text-sm text-green-600 dark:text-green-400">
                                    {noteFiles.length} file(s) selected ({getTotalFileSize()} MB total)
                                </div>
                                {noteFiles.length > 1 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Drag files to reorder • First file is used for preview
                                    </p>
                                )}
                                <div className="space-y-2">
                                    {noteFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            draggable={!uploading}
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm transition-all ${draggedIndex === index ? 'opacity-50 scale-95' : ''
                                                } ${draggedIndex !== null && draggedIndex !== index ? 'border-2 border-dashed border-purple-400' : 'border-2 border-transparent'}`}
                                        >
                                            <GripVertical className="w-4 h-4 cursor-grab text-gray-400" />
                                            <div className="w-6 h-6 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                                                {index + 1}
                                            </div>
                                            <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{file.name}</span>
                                            <span className="text-xs text-gray-500 flex-shrink-0">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                disabled={uploading}
                                                className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {compressionResults.length > 0 && (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">📦 Compression Results</div>
                                        {compressionResults.map((result, index) => (
                                            <div key={index} className="text-xs text-blue-700 dark:text-blue-400">
                                                {noteFiles[index]?.name}: {formatFileSize(result.originalSize)} → {formatFileSize(result.compressedSize)}
                                                <span className="ml-2 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                                                    {result.compressionRatio > 0 ? `${result.compressionRatio.toFixed(0)}% smaller` : 'No reduction'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Preview Status */}
                    {extracting && (
                        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                            <span className="text-blue-700 dark:text-blue-300">Extracting preview pages...</span>
                        </div>
                    )}

                    {previewFiles.length > 0 && !extracting && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                            <div className="text-sm text-green-600 dark:text-green-400">
                                ✓ {previewFiles.length} preview page(s) extracted
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={uploading || extracting}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {uploadProgress || 'Uploading...'}
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Upload & Fulfill Request
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
