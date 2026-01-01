import { Note } from '../types';
import { Star, ShoppingCart, Bookmark, Eye, FileText, TrendingUp, ShieldCheck } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onPreview: (note: Note) => void;
  onBookmark?: (noteId: string) => void;
  onPurchase?: (noteId: string) => void;
  onViewNotes?: (noteId: string) => void;
  isBookmarked?: boolean;
  isPurchased?: boolean;
}

export function NoteCard({
  note,
  onPreview,
  onBookmark,
  onPurchase,
  onViewNotes,
  isBookmarked = false,
  isPurchased = false
}: NoteCardProps) {
  return (
    <div className="glass rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 dark:border-slate-800 group">
      <div
        className="relative h-48 bg-gray-200 dark:bg-slate-800 cursor-pointer overflow-hidden"
        onClick={() => onPreview(note)}
      >
        <img
          src={note.thumbnailUrl}
          alt={note.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
          <Eye className="w-12 h-12 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform" />
        </div>

        {/* Status badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {note.isTopSelling && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg shadow-lg" style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}>
              <TrendingUp className="w-3 h-3" />
              Top Selling
            </span>
          )}
          {note.isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg shadow-lg" style={{ backgroundColor: '#16a34a', color: '#ffffff' }}>
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          {onBookmark && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(note.id);
              }}
              className={`p-2.5 rounded-xl ${isBookmarked
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-white/90 dark:bg-slate-900/90 text-gray-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-sm'
                } transition-all`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-gray-900 dark:text-white line-clamp-2 flex-1">{note.title}</h3>
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent whitespace-nowrap">₹{note.price}</span>
        </div>

        <p className="text-gray-600 dark:text-slate-400 text-sm line-clamp-2 mb-4">{note.description}</p>

        <div className="flex items-center gap-3 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="text-gray-900 dark:text-white">{note.rating}</span>
          </div>
          <span className="text-gray-500 dark:text-slate-400">({note.reviewCount})</span>
          <span className="text-gray-400 dark:text-slate-600">•</span>
          <span className="text-gray-600 dark:text-slate-400">{note.salesCount} sales</span>
        </div>

        <div className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          by {note.uploaderName}
        </div>

        {!isPurchased && onPurchase && (
          <button
            onClick={() => onPurchase(note.id)}
            className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-2.5 px-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Purchase Now
          </button>
        )}

        {isPurchased && (
          <button
            onClick={() => onViewNotes ? onViewNotes(note.id) : onPreview(note)}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-2.5 px-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            View Notes
          </button>
        )}
      </div>
    </div>
  );
}