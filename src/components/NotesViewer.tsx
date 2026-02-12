import { useState, useRef, useEffect } from 'react';
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Note } from '../types';
import { ShareButton } from './ShareButton';

interface NotesViewerProps {
  note: Note;
  onClose: () => void;
}

export function NotesViewer({ note, onClose }: NotesViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Reset states when switching files
  useEffect(() => {
    setCurrentPage(1);
    setZoom(100);
    setLoadingPdf(true);
    // Mimic loading state for PDF switch
    const timer = setTimeout(() => setLoadingPdf(false), 1000);
    return () => clearTimeout(timer);
  }, [selectedFileIndex]);

  // Derived state
  const isFirstFile = selectedFileIndex === 0;
  const hasMultipleFiles = note.pdfUrls && note.pdfUrls.length > 1;
  const currentFileUrl = note.pdfUrls && note.pdfUrls[selectedFileIndex];

  // Pagination logic only applies to the first file which has preview images
  const totalPages = isFirstFile ? note.previewPages.length : 1;

  const handlePrevPage = () => {
    if (isFirstFile) {
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  };

  const handleNextPage = () => {
    if (isFirstFile) {
      setCurrentPage(prev => Math.min(totalPages, prev + 1));
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(200, prev + 25));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(50, prev - 25));
  };

  const handleDownload = () => {
    if (currentFileUrl) {
      window.open(currentFileUrl, '_blank');
    }
  };

  const handleDownloadAll = () => {
    if (note.pdfUrls && note.pdfUrls.length > 0) {
      note.pdfUrls.forEach((url, index) => {
        setTimeout(() => {
          window.open(url, '_blank');
        }, index * 500);
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h2 className="text-white truncate max-w-[200px] md:max-w-md">{note.title}</h2>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>by {note.uploaderName}</span>
                {hasMultipleFiles && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-blue-400">{note.pdfUrls.length} files</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShareButton noteId={note.id} noteTitle={note.title} className="bg-slate-800 hover:bg-slate-700" />
            {hasMultipleFiles ? (
              <Button
                onClick={handleDownloadAll}
                className="hidden sm:flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            ) : (
              <Button
                onClick={handleDownload}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area - Flex Row for Desktop */}
      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar for File Selection (Desktop) */}
        {hasMultipleFiles && (
          <div className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-800 flex-col overflow-y-auto shrink-0">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-white font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Files ({note.pdfUrls.length})
              </h3>
            </div>
            <div className="p-2 space-y-1">
              {note.pdfUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedFileIndex(index)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedFileIndex === index
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedFileIndex === index ? 'bg-blue-600 text-white' : 'bg-slate-800'
                    }`}>
                    <span className="text-xs font-bold">{index + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${selectedFileIndex === index ? 'text-blue-100' : ''}`}>
                      File {index + 1}
                    </p>
                    <p className="text-xs opacity-70 truncate">
                      {index === 0 ? 'Preview available' : 'PDF Viewer'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* File Switcher (Mobile) */}
        {hasMultipleFiles && (
          <div className="lg:hidden absolute top-[60px] left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 p-2 flex overflow-x-auto gap-2 no-scrollbar">
            {note.pdfUrls.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedFileIndex(index)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap text-sm border transition-colors ${selectedFileIndex === index
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
              >
                File {index + 1}
              </button>
            ))}
          </div>
        )}

        {/* Viewer Area */}
        <div className={`flex-1 flex flex-col relative bg-slate-950 ${hasMultipleFiles ? 'lg:w-[calc(100%-16rem)]' : 'w-full'} ${hasMultipleFiles ? 'mt-[50px] lg:mt-0' : ''}`}>

          {/* Toolbar (Only for first file with images) */}
          {isFirstFile && (
            <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 px-4 py-2 flex items-center justify-center gap-4 shrink-0">
              {/* Page Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <span className="text-sm font-medium text-white min-w-[3rem] text-center">
                  {currentPage} / {totalPages}
                </span>

                <Button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Divider */}
              <div className="h-4 w-px bg-slate-700" />

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>

                <span className="text-sm text-slate-400 w-12 text-center">{zoom}%</span>

                <Button
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/50">
            {isFirstFile ? (
              // Image Viewer for First File
              <div
                className="relative shadow-2xl transition-transform duration-200 ease-out origin-top"
                style={{
                  transform: `scale(${zoom / 100})`,
                  maxWidth: '100%',
                }}
              >
                <img
                  src={note.previewPages[currentPage - 1]}
                  alt={`Page ${currentPage}`}
                  className="max-w-full h-auto rounded-lg bg-white"
                  style={{ maxHeight: '80vh' }}
                />
              </div>
            ) : (
              // PDF Viewer for Other Files
              <div className="w-full h-full flex flex-col items-center justify-center max-w-5xl mx-auto bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative">
                {loadingPdf && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-slate-400">Loading PDF...</p>
                    </div>
                  </div>
                )}

                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(currentFileUrl)}&embedded=true`}
                  className="w-full h-full bg-white"
                  title={`PDF File ${selectedFileIndex + 1}`}
                />

                {/* Fallback/Action Bar for PDF */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-md rounded-xl p-2 flex gap-2 border border-slate-700 shadow-xl">
                  <Button
                    onClick={handleDownload}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => window.open(currentFileUrl, '_blank')}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-slate-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open New Tab
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
