import { Search, FileText, BookOpen, Library, ExternalLink, FileQuestion } from 'lucide-react';
import { Note, FreePYQ } from '../types';
import { NoteCard } from './NoteCard';
import { useState } from 'react';

interface HomePageProps {
  notes: Note[];
  freePYQs: FreePYQ[];
  onPreview: (note: Note) => void;
  onBookmark: (noteId: string) => void;
  onPurchase: (noteId: string) => void;
  onViewNotes: (noteId: string) => void;
  bookmarkedIds: string[];
  purchasedIds: string[];
  searchQuery: string;
  onSearchChange?: (query: string) => void;
  onRequestNotes?: () => void;
}

export function HomePage({
  notes,
  freePYQs,
  onPreview,
  onBookmark,
  onPurchase,
  onViewNotes,
  bookmarkedIds,
  purchasedIds,
  searchQuery,
  onSearchChange,
  onRequestNotes
}: HomePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'assignment', label: 'Assignments', icon: FileText, color: 'from-blue-600 to-cyan-500' },
    { id: 'pyq', label: 'PYQ Papers', icon: BookOpen, color: 'from-emerald-500 to-teal-500' },
    { id: 'lecture-notes', label: 'Lecture Notes', icon: Library, color: 'from-violet-600 to-purple-500' }
  ];

  // Filter notes based on search and category
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'pyq' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter PYQs based on search
  const filteredPYQs = freePYQs.filter(pyq =>
    pyq.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pyq.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Top purchased notes (sorted by sales count)
  const topNotes = [...notes].sort((a, b) => b.salesCount - a.salesCount).slice(0, 8);

  const showPYQs = selectedCategory === 'pyq';

  return (
    <div className="min-h-screen bg-transparent pb-24 lg:pb-8 lg:ml-64 mobile-page-content">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {/* Mobile Search Bar */}
        {onSearchChange && (
          <div className="lg:hidden mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search for notes, assignments, PYQs..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 glass border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
              />
            </div>
          </div>
        )}

        {/* Category Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            const itemCount = category.id === 'pyq'
              ? freePYQs.length
              : notes.filter(n => n.category === category.id).length;

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                className={`bg-gradient-to-br ${category.color} ${isSelected ? 'ring-4 ring-offset-2 dark:ring-offset-gray-950 ring-gray-400 dark:ring-gray-600 scale-95' : 'hover:scale-105 hover:shadow-2xl'
                  } text-white p-6 rounded-2xl transition-all duration-300 flex items-center gap-4 shadow-lg group relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md shadow-inner">
                  <Icon className="w-8 h-8 drop-shadow-md" />
                </div>
                <div className="text-left relative z-10">
                  <div className="text-white font-bold text-lg tracking-wide">{category.label}</div>
                  <div className="text-white/90 text-sm font-medium">
                    {itemCount} {category.id === 'pyq' ? 'free papers' : 'items'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Section */}
        <div>
          <h2 className="text-gray-900 dark:text-white mb-6">
            {selectedCategory
              ? `${categories.find(c => c.id === selectedCategory)?.label}${showPYQs ? ' (Free)' : ''}`
              : 'Top Purchased Notes'}
          </h2>

          {showPYQs ? (
            // Show Free PYQ Cards
            filteredPYQs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPYQs.map((pyq) => (
                  <a
                    key={pyq.id}
                    href={pyq.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-xl hover:border-green-300 dark:hover:border-green-700 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-lg font-medium">
                        FREE
                      </span>
                    </div>
                    <h3 className="text-lg text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {pyq.courseCode}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {pyq.courseName}
                    </p>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                      <ExternalLink className="w-4 h-4" />
                      Open in Google Drive
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-slate-700" />
                <p className="text-gray-500 dark:text-slate-400">No PYQ papers available yet</p>
              </div>
            )
          ) : (
            // Show Regular Notes
            filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(selectedCategory ? filteredNotes : topNotes).map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPreview={onPreview}
                    onBookmark={onBookmark}
                    onPurchase={onPurchase}
                    onViewNotes={onViewNotes}
                    isBookmarked={bookmarkedIds.includes(note.id)}
                    isPurchased={purchasedIds.includes(note.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-slate-700" />
                <p className="text-gray-500 dark:text-slate-400 mb-4">No notes found matching your search</p>
                {onRequestNotes && searchQuery && (
                  <button
                    onClick={onRequestNotes}
                    className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl hover:opacity-90 transition-colors"
                    style={{ backgroundColor: '#8b5cf6' }}
                  >
                    <FileQuestion className="w-5 h-5" />
                    Request "{searchQuery}"
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}