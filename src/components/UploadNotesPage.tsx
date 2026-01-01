import { Upload, Image, FileText, IndianRupee, Tag, File, Loader2, BookOpen, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NoteCategory, Course } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { createNote, getCourses, addCourse } from '../lib/firestore';
import { uploadNotePreview, uploadNoteFile } from '../lib/storage';
import { extractPdfPreviews } from '../lib/pdfUtils';
import { compressPdf, formatFileSize, CompressionResult } from '../lib/compressPdf';
import { getFunctions, httpsCallable } from 'firebase/functions';

export function UploadNotesPage() {
  const { user, userProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<NoteCategory>('assignment');
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [compressionResults, setCompressionResults] = useState<CompressionResult[]>([]);

  // PYQ specific state
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseCode, setSelectedCourseCode] = useState('');
  const [selectedCourseName, setSelectedCourseName] = useState('');
  const [isAddingNewCourse, setIsAddingNewCourse] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Load courses when PYQ is selected
  useEffect(() => {
    if (category === 'pyq') {
      loadCourses();
    }
  }, [category]);

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const coursesData = await getCourses();
      setCourses(coursesData);
    } catch (err) {
      console.error('Error loading courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCourseCodeChange = (code: string) => {
    if (code === '__new__') {
      setIsAddingNewCourse(true);
      setSelectedCourseCode('');
      setSelectedCourseName('');
    } else {
      setIsAddingNewCourse(false);
      setSelectedCourseCode(code);
      // Auto-fill course name
      const course = courses.find(c => c.courseCode === code);
      if (course) {
        setSelectedCourseName(course.courseName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !userProfile) {
      setError('You must be logged in to upload notes');
      return;
    }

    if (pdfFiles.length === 0) {
      setError('Please upload at least one PDF file');
      return;
    }

    // PYQ validation
    if (category === 'pyq') {
      const courseCode = isAddingNewCourse ? newCourseCode : selectedCourseCode;
      const courseName = isAddingNewCourse ? newCourseName : selectedCourseName;

      if (!courseCode || !courseName) {
        setError('Please select or enter course code and name');
        return;
      }
    }

    // If preview extraction failed, create a placeholder preview from the first PDF
    let finalPreviewFiles = previewFiles;
    if (previewFiles.length === 0) {
      console.warn('No preview files - proceeding with empty previews');
      // We'll allow upload without previews but show a warning
    }

    setError('');
    setUploading(true);

    try {
      // Generate a temporary ID for organizing uploads
      const tempId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Handle PYQ uploads differently
      if (category === 'pyq') {
        const courseCode = isAddingNewCourse ? newCourseCode : selectedCourseCode;
        const courseName = isAddingNewCourse ? newCourseName : selectedCourseName;

        // Add new course if needed
        if (isAddingNewCourse) {
          setUploadProgress('Adding new course...');
          await addCourse(courseCode, courseName);
        }

        // Upload PDF to Firebase Storage (temporary)
        setUploadProgress('Uploading PDF to temporary storage...');
        const pyqNoteId = `pyq_temp/${tempId}`;
        await uploadNoteFile(pdfFiles[0], pyqNoteId);

        // Call Cloud Function to transfer to Google Drive
        setUploadProgress('Transferring to Google Drive...');
        const functions = getFunctions();
        const uploadPYQToDrive = httpsCallable(functions, 'uploadPYQToDrive');

        const result = await uploadPYQToDrive({
          storagePath: `notes/${pyqNoteId}/document.pdf`,
          courseCode,
          courseName,
          fileName: pdfFiles[0].name,
        });

        console.log('PYQ uploaded to Drive:', result.data);

        setSubmitted(true);
        setUploadProgress('');
        setTimeout(() => {
          setSubmitted(false);
          setCategory('assignment');
          setPdfFiles([]);
          setSelectedCourseCode('');
          setSelectedCourseName('');
          setNewCourseCode('');
          setNewCourseName('');
          setIsAddingNewCourse(false);
        }, 3000);
      } else {
        // Regular note upload flow
        // Compress all PDF files before uploading
        setUploadProgress(`Compressing ${pdfFiles.length} PDF file(s)...`);
        const compressedFiles: File[] = [];
        const compressionResultsList: CompressionResult[] = [];

        for (let i = 0; i < pdfFiles.length; i++) {
          setUploadProgress(`Compressing PDF ${i + 1} of ${pdfFiles.length}...`);
          try {
            const result = await compressPdf(pdfFiles[i]);
            compressedFiles.push(result.compressedFile);
            compressionResultsList.push(result);
          } catch (compressError) {
            console.error(`Error compressing PDF ${i + 1}:`, compressError);
            // If compression fails, use original file
            compressedFiles.push(pdfFiles[i]);
          }
        }
        setCompressionResults(compressionResultsList);

        // Upload all compressed PDF files to Firebase Storage
        setUploadProgress(`Uploading ${compressedFiles.length} PDF file(s)...`);
        const pdfUrls: string[] = [];
        for (let i = 0; i < compressedFiles.length; i++) {
          setUploadProgress(`Uploading PDF ${i + 1} of ${compressedFiles.length}...`);
          const url = await uploadNoteFile(compressedFiles[i], `${tempId}_${i}`);
          pdfUrls.push(url);
        }

        // Upload preview images to Firebase Storage
        setUploadProgress('Uploading preview images...');
        const previewUrls: string[] = [];
        for (let i = 0; i < previewFiles.length; i++) {
          const url = await uploadNotePreview(previewFiles[i], tempId, i);
          previewUrls.push(url);
        }

        // Create note document in Firestore
        setUploadProgress('Creating note...');
        await createNote({
          title,
          description,
          category,
          price: parseFloat(price),
          previewPages: previewUrls,
          thumbnailUrl: previewUrls[0] || '',
          pdfUrls,
          uploaderId: user.uid,
          uploaderName: userProfile.name,
        });

        setSubmitted(true);
        setUploadProgress('');
        setTimeout(() => {
          setSubmitted(false);
          setTitle('');
          setDescription('');
          setPrice('');
          setCategory('assignment');
          setPreviewFiles([]);
          setPdfFiles([]);
          setCompressionResults([]);
        }, 3000);
      }
    } catch (err) {
      console.error('Error uploading:', err);
      setError(category === 'pyq' ? 'Failed to upload PYQ. Please try again.' : 'Failed to upload note. Please try again.');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  const handlePreviewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPreviewFiles(Array.from(e.target.files));
    }
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      // Validate that all files are PDFs
      const nonPdfFiles = files.filter(file => file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'));
      if (nonPdfFiles.length > 0) {
        setError('Only PDF files are supported. Please upload PDF files only.');
        e.target.value = ''; // Clear the input
        return;
      }

      setPdfFiles(files);
      setPreviewFiles([]);

      // Auto-extract previews from the first PDF
      setExtracting(true);
      setError('');
      try {
        const previews = await extractPdfPreviews(files[0], 4);
        setPreviewFiles(previews);
      } catch (err) {
        console.error('Error extracting previews:', err);
        setError('Could not extract previews. Please try a different PDF file.');
      } finally {
        setExtracting(false);
      }
    }
  };

  const getTotalPdfSize = () => {
    const totalBytes = pdfFiles.reduce((sum, file) => sum + file.size, 0);
    return (totalBytes / 1024 / 1024).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 lg:pb-8 lg:ml-64 mobile-page-content">
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white">Upload</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Share your knowledge and earn</p>
          </div>
        </div>

        {submitted ? (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white mb-2">Notes Uploaded Successfully!</h3>
            <p className="text-white text-opacity-90">Your notes are now live and available for purchase.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-6 shadow-lg">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4" />
                <span>Category *</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="assignment">Assignment</option>
                <option value="lecture-notes">Lecture Notes</option>
              </select>
            </div>

            {/* Conditional Fields based on Category */}
            {category === 'pyq' ? (
              <>
                {/* PYQ Info Banner */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    PYQ papers are shared for free with the community and stored securely on Google Drive.
                  </p>
                </div>

                {/* Course Code */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Course Code *</span>
                  </label>
                  {loadingCourses ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading courses...
                    </div>
                  ) : (
                    <select
                      value={isAddingNewCourse ? '__new__' : selectedCourseCode}
                      onChange={(e) => handleCourseCodeChange(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                    >
                      <option value="">Select course code...</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.courseCode}>
                          {course.courseCode} - {course.courseName}
                        </option>
                      ))}
                      <option value="__new__">+ Add New Course</option>
                    </select>
                  )}
                </div>

                {/* New Course Fields (if adding new) */}
                {isAddingNewCourse && (
                  <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm font-medium">
                      <Plus className="w-4 h-4" />
                      Add New Course
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm">New Course Code *</label>
                      <input
                        type="text"
                        value={newCourseCode}
                        onChange={(e) => setNewCourseCode(e.target.value.toUpperCase())}
                        placeholder="e.g., CS101"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1 text-sm">New Course Name *</label>
                      <input
                        type="text"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        placeholder="e.g., Introduction to Computer Science"
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Course Name (read-only if selected from dropdown) */}
                {!isAddingNewCourse && selectedCourseCode && (
                  <div>
                    <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                      <FileText className="w-4 h-4" />
                      <span>Course Name</span>
                    </label>
                    <input
                      type="text"
                      value={selectedCourseName}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300"
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Regular Note Fields */}
                {/* Title */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="w-4 h-4" />
                    <span>Note Title *</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Advanced Mathematics Assignment Solutions"
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="w-4 h-4" />
                    <span>Description *</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what's included in your notes..."
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                    <IndianRupee className="w-4 h-4" />
                    <span>Price (₹ INR) *</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="9.99"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </>
            )}

            {/* PDF Files Upload */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                <File className="w-4 h-4" />
                <span>PDF Files *</span>
              </label>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                Upload one or more PDF files (these are the files buyers will download)
              </p>
              <input
                type="file"
                accept=".pdf,application/pdf"
                multiple
                onChange={handlePdfFileChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 text-gray-900 dark:text-white"
              />
              {pdfFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm text-green-600 dark:text-green-400">
                    {pdfFiles.length} PDF file(s) selected ({getTotalPdfSize()} MB total)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pdfFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                        <File className="w-3 h-3" />
                        <span className="max-w-[150px] truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                  {/* Compression Results Display */}
                  {compressionResults.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                        📦 Compression Results
                      </div>
                      {compressionResults.map((result, index) => (
                        <div key={index} className="text-xs text-blue-700 dark:text-blue-400 mb-1">
                          {pdfFiles[index]?.name}: {formatFileSize(result.originalSize)} → {formatFileSize(result.compressedSize)}
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

            {/* Preview Pages - Auto-generated (only for non-PYQ) */}
            {category !== 'pyq' && (
              <div>
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                  <Image className="w-4 h-4" />
                  <span>Preview Images (Auto-generated)</span>
                </label>
                {extracting ? (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-blue-700 dark:text-blue-300">Extracting preview pages from PDF...</span>
                  </div>
                ) : previewFiles.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-sm text-green-600 dark:text-green-400">
                      ✓ {previewFiles.length} preview page(s) extracted from PDF
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {previewFiles.map((file, index) => (
                        <div key={index} className="aspect-[8.5/11] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Upload a PDF above - the first 4 pages will be automatically extracted as previews
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {uploadProgress || 'Uploading...'}
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Notes
                </>
              )}
            </button>
          </form>
        )}

        {/* Guidelines */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <h3 className="text-blue-900 dark:text-blue-200 mb-3">Upload Guidelines</h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-300 text-sm">
            <li>• Only PDF files are supported</li>
            <li>• Preview images are automatically extracted from your PDF (first 4 pages)</li>
            <li>• Ensure your notes are original or you have permission to sell them</li>
            <li>• Write an accurate description of what's included</li>
            <li>• Price your notes fairly based on content quality and length</li>
          </ul>
        </div>
      </div>
    </div >
  );
}