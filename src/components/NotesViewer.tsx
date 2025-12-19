import { useState } from 'react';
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from './ui/button';
import { Note } from '../types';

interface NotesViewerProps {
  note: Note;
  onClose: () => void;
}

export function NotesViewer({ note, onClose }: NotesViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  
  // Mock PDF pages - in a real app, this would be actual PDF rendering
  const totalPages = note.previewPages.length;

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(200, prev + 25));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(50, prev - 25));
  };

  const handleDownload = () => {
    // Mock download - in real app, this would download the actual PDF
    alert(`Downloading ${note.title}...`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 py-3">
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
            <div>
              <h2 className="text-white">{note.title}</h2>
              <p className="text-sm text-slate-400">by {note.uploaderName}</p>
            </div>
          </div>

          <Button
            onClick={handleDownload}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg">
              <span className="text-white">{currentPage}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{totalPages}</span>
            </div>

            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleZoomOut}
              disabled={zoom === 50}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white disabled:opacity-50"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            
            <div className="px-4 py-2 bg-slate-800/50 rounded-lg">
              <span className="text-white">{zoom}%</span>
            </div>

            <Button
              onClick={handleZoomIn}
              disabled={zoom === 200}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white disabled:opacity-50"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Viewer Area */}
      <div className="flex-1 overflow-auto bg-slate-900 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div 
            className="bg-white rounded-lg shadow-2xl overflow-hidden transition-transform"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {/* Mock PDF Page - in real app, this would be actual PDF rendering */}
            <div className="aspect-[8.5/11] relative">
              <img
                src={note.previewPages[currentPage - 1]}
                alt={`Page ${currentPage}`}
                className="w-full h-full object-contain"
              />
              
              {/* Watermark for preview */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="transform -rotate-45 text-6xl font-bold text-black/5 select-none">
                  PREVIEW
                </div>
              </div>
            </div>
          </div>

          {/* Page Info */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Page Navigation */}
      <div className="lg:hidden bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            variant="ghost"
            className="text-slate-400 hover:text-white disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </Button>

          <span className="text-white">
            {currentPage} / {totalPages}
          </span>

          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            variant="ghost"
            className="text-slate-400 hover:text-white disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
