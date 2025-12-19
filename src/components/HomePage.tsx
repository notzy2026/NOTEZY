import { Search, FileText, BookOpen, Library } from 'lucide-react';
import { Note } from '../types';
import { NoteCard } from './NoteCard';
import { useState } from 'react';

interface HomePageProps {
  notes: Note[];
  onPreview: (note: Note) => void;
  onBookmark: (noteId: string) => void;
  onPurchase: (noteId: string) => void;
  onViewNotes: (noteId: string) => void;
  bookmarkedIds: string[];
  purchasedIds: string[];
  searchQuery: string;
  onSearchChange?: (query: string) => void;
}

export function HomePage({
  notes,
  onPreview,
  onBookmark,
  onPurchase,
  onViewNotes,
  bookmarkedIds,
  purchasedIds,
  searchQuery,
  onSearchChange
}: HomePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'assignment', label: 'Assignments', icon: FileText, color: 'from-blue-500 to-blue-600' },
    { id: 'pyq', label: 'PYQ Papers', icon: BookOpen, color: 'from-green-500 to-green-600' },
    { id: 'lecture-notes', label: 'Lecture Notes', icon: Library, color: 'from-purple-500 to-purple-600' }
  ];

  // Filter notes based on search and category
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Top purchased notes (sorted by sales count)
  const topNotes = [...notes].sort((a, b) => b.salesCount - a.salesCount).slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 lg:pb-8 lg:ml-64 mobile-page-content">
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
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500"
              />
            </div>
          </div>
        )}

        {/* Category Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                className={`bg-gradient-to-br ${category.color} ${isSelected ? 'ring-4 ring-offset-2 dark:ring-offset-gray-950 ring-gray-400 dark:ring-gray-600' : ''
                  } text-white p-6 rounded-2xl hover:shadow-2xl transition-all flex items-center gap-4 shadow-lg`}
              >
                <div className="bg-white bg-opacity-20 p-4 rounded-xl backdrop-blur-sm">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <div className="text-white">{category.label}</div>
                  <div className="text-white text-opacity-90 text-sm">
                    {notes.filter(n => n.category === category.id).length} items
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Top Purchased Notes */}
        <div>
          <h2 className="text-gray-900 dark:text-white mb-6">
            {selectedCategory
              ? `${categories.find(c => c.id === selectedCategory)?.label}`
              : 'Top Purchased Notes'}
          </h2>

          {filteredNotes.length > 0 ? (
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
              <p className="text-gray-500 dark:text-slate-400">No notes found matching your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}