import { Bookmark } from 'lucide-react';
import { Note } from '../types';
import { NoteCard } from './NoteCard';

interface BookmarksPageProps {
  bookmarkedNotes: Note[];
  onPreview: (note: Note) => void;
  onBookmark: (noteId: string) => void;
  onPurchase: (noteId: string) => void;
  onViewNotes: (noteId: string) => void;
  purchasedIds: string[];
}

export function BookmarksPage({ 
  bookmarkedNotes, 
  onPreview, 
  onBookmark, 
  onPurchase,
  onViewNotes,
  purchasedIds
}: BookmarksPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 lg:pb-8 lg:ml-64 mobile-page-content">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white">My Bookmarks</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Your saved notes collection</p>
          </div>
        </div>

        {bookmarkedNotes.length > 0 ? (
          <>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl p-4 mb-6">
              <p className="text-yellow-900 dark:text-yellow-200">
                You have {bookmarkedNotes.length} bookmarked notes
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bookmarkedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onPreview={onPreview}
                  onBookmark={onBookmark}
                  onPurchase={onPurchase}
                  onViewNotes={onViewNotes}
                  isBookmarked={true}
                  isPurchased={purchasedIds.includes(note.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
            <Bookmark className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-slate-700" />
            <h3 className="text-gray-900 dark:text-white mb-2">No Bookmarks Yet</h3>
            <p className="text-gray-600 dark:text-slate-400">
              Bookmark notes to save them for later
            </p>
          </div>
        )}
      </div>
    </div>
  );
}