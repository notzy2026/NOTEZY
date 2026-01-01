import { Download, FileText, File } from 'lucide-react';
import { Note } from '../types';

interface DownloadsPageProps {
  purchasedNotes: Note[];
  onPreview: (note: Note) => void;
  onViewNotes: (noteId: string) => void;
}

export function DownloadsPage({ purchasedNotes }: DownloadsPageProps) {
  const handleDownload = (url: string, fileName: string) => {
    // Open PDF in new tab for download
    window.open(url, '_blank');
  };

  const handleDownloadAll = (note: Note) => {
    if (note.pdfUrls && note.pdfUrls.length > 0) {
      // Download all PDFs (opens each in a new tab)
      note.pdfUrls.forEach((url, index) => {
        setTimeout(() => {
          window.open(url, '_blank');
        }, index * 500); // Stagger downloads to avoid popup blocking
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 lg:pb-8 lg:ml-64 mobile-page-content">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white">My Downloads</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Download your purchased notes</p>
          </div>
        </div>

        {purchasedNotes.length > 0 ? (
          <>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 mb-6">
              <p className="text-blue-900 dark:text-blue-200">
                You have purchased {purchasedNotes.length} notes
              </p>
            </div>

            <div className="space-y-4">
              {purchasedNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-lg"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg text-gray-900 dark:text-white mb-1">{note.title}</h3>
                        <p className="text-gray-600 dark:text-slate-400 text-sm line-clamp-2">
                          {note.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-slate-500">
                          <span className="capitalize">{note.category}</span>
                          <span>•</span>
                          <span>By {note.uploaderName}</span>
                          {note.pdfUrls && note.pdfUrls.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{note.pdfUrls.length} PDF file(s)</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-green-500 text-white text-xs rounded-full flex-shrink-0">
                        Purchased
                      </div>
                    </div>

                    {/* Download Section */}
                    {note.pdfUrls && note.pdfUrls.length > 0 ? (
                      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-700 dark:text-slate-300">
                            {note.pdfUrls.length} PDF file(s) available
                          </span>
                          {note.pdfUrls.length > 1 && (
                            <button
                              onClick={() => handleDownloadAll(note)}
                              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:shadow-lg transition-all shadow-md"
                              style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)', color: '#ffffff' }}
                            >
                              <Download className="w-4 h-4" />
                              Download All
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {note.pdfUrls.map((url, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700"
                            >
                              <div className="flex items-center gap-3">
                                <File className="w-5 h-5 text-red-500" />
                                <span className="text-sm text-gray-700 dark:text-slate-300">
                                  {note.title} - File {index + 1}.pdf
                                </span>
                              </div>
                              <button
                                onClick={() => handleDownload(url, `${note.title}_${index + 1}.pdf`)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors shadow-md"
                                style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center">
                        <p className="text-gray-500 dark:text-slate-400 text-sm">
                          No PDF files available for this note
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
            <Download className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-slate-700" />
            <h3 className="text-gray-900 dark:text-white mb-2">No Downloads Yet</h3>
            <p className="text-gray-600 dark:text-slate-400">
              Purchase some notes to see them here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}