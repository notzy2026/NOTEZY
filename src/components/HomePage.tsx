import { Search, FileText, BookOpen, Library, ExternalLink, FileQuestion, Share2 } from 'lucide-react';
import { Note, FreePYQ } from '../types';
import { NoteCard } from './NoteCard';
import { useState, useCallback } from 'react';
import { LinkCopiedToast } from './LinkCopiedToast';

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
  paymentLoading?: boolean;
  purchasingNoteId?: string | null;
  isGuest?: boolean;
  onKnowMore?: () => void;
  openPYQOnLoad?: boolean;
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
  onRequestNotes,
  paymentLoading = false,
  purchasingNoteId = null,
  isGuest = false,
  onKnowMore,
  openPYQOnLoad = false
}: HomePageProps) {

  const [selectedCategory, setSelectedCategory] = useState<string | null>(openPYQOnLoad ? 'pyq' : null);
  const [showShareToast, setShowShareToast] = useState(false);

  const handleSharePYQ = useCallback(async (e: React.MouseEvent, pyqId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const shareLink = `${window.location.origin}/?pyq=${pyqId}`;
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = shareLink;
      ta.style.position = 'fixed';
      ta.style.left = '-999999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setShowShareToast(true);
  }, []);

  const categories = [
    { id: 'assignment', label: 'Assignments', icon: FileText, color: 'from-blue-600 to-cyan-500' },
    { id: 'pyq', label: 'PYQ Papers', icon: BookOpen, color: 'from-emerald-500 to-teal-500' },
    { id: 'lecture-notes', label: 'Lecture Notes', icon: Library, color: 'from-violet-600 to-purple-500' }
  ];

  // Filter notes based on search and category
  // When searching, search across ALL note categories (not gated by selectedCategory)
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'pyq' || note.category === selectedCategory;
    // While searching: ignore category filter so results are global
    return searchQuery.trim() ? matchesSearch : (matchesSearch && matchesCategory);
  });

  // Filter PYQs based on search
  const filteredPYQs = freePYQs.filter(pyq =>
    pyq.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pyq.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Top purchased notes: Admin-marked "Top Selling" first, then by sales count
  const topNotes = [...notes]
    .sort((a, b) => {
      // Top Selling notes (marked by admin) come first
      if (a.isTopSelling && !b.isTopSelling) return -1;
      if (!a.isTopSelling && b.isTopSelling) return 1;
      // Then sort by sales count
      return b.salesCount - a.salesCount;
    })
    .slice(0, 8);

  // Determine if we're actively searching
  const isSearching = searchQuery.trim().length > 0;

  // Notes to display: filtered if searching or category selected, otherwise top notes
  const displayNotes = (isSearching || selectedCategory) ? filteredNotes : topNotes;

  const showPYQs = selectedCategory === 'pyq';
  // Show PYQs inline in search results when searching and PYQs match
  const showSearchPYQs = isSearching && filteredPYQs.length > 0 && !showPYQs;

  return (
    <div className="min-h-screen bg-transparent pb-24 lg:pb-8 lg:ml-64 mobile-page-content">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {/* Mobile Search & Guest Banner */}
        {onSearchChange && (
          <div className="lg:hidden mb-6 flex flex-col gap-4">
            {/* Mobile Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 glass border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
            
            {/* Mobile Guest Banner */}
            {isGuest && onKnowMore && (
              <div className="flex flex-col gap-3 glass border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4">
                <p className="text-gray-700 dark:text-slate-300 text-sm font-medium leading-relaxed">
                  Buy notes, assignments, and get free pyqs or upload your own study materials to start earning today.
                </p>
                <button
                  onClick={onKnowMore}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  Know More
                </button>
              </div>
            )}
          </div>
        )}

        {/* Desktop Guest Banner */}
        {isGuest && onKnowMore && (
          <div className="hidden lg:flex flex-col items-start gap-4 mb-8">
            <p className="text-base text-gray-700 dark:text-slate-300 font-medium whitespace-nowrap leading-relaxed">
              Buy notes, assignments, and get free pyqs or upload your own study materials to start earning today.
            </p>
            <button
              onClick={onKnowMore}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5"
            >
              Know More
            </button>
          </div>
        )}

        {/* Category Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
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
                  } text-white p-5 md:p-6 rounded-2xl transition-all duration-300 flex items-center gap-3 md:gap-4 shadow-lg group relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="bg-white/20 p-3 md:p-4 rounded-xl backdrop-blur-md shadow-inner">
                  <Icon className="w-6 h-6 md:w-8 md:h-8 drop-shadow-md" />
                </div>
                <div className="text-left relative z-10">
                  <div className="text-white font-bold text-base md:text-lg tracking-wide">{category.label}</div>
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
            {isSearching
              ? `Search Results for "${searchQuery}"`
              : selectedCategory
                ? `${categories.find(c => c.id === selectedCategory)?.label}${showPYQs ? ' (Free)' : ''}`
                : 'Top Purchased Notes'}
          </h2>

          {showPYQs ? (
            // ── PYQ category selected ──────────────────────────────────
            filteredPYQs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPYQs.map((pyq) => (
                  <div
                    key={pyq.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-xl hover:border-green-300 dark:hover:border-green-700 transition-all group flex flex-col"
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
                      {pyq.courseName}
                    </p>
                    <div className="flex items-center gap-2 mt-auto">
                      <a
                        href={pyq.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 px-3 py-2 rounded-xl transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Drive
                      </a>
                      <button
                        onClick={(e) => handleSharePYQ(e, pyq.id)}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Copy share link"
                        aria-label="Share PYQ"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-slate-700" />
                <p className="text-gray-500 dark:text-slate-400">No PYQ papers available yet</p>
              </div>
            )
          ) : (
            // ── Notes (+ PYQs inline when searching) ──────────────────
            <>
              {/* Regular notes grid */}
              {displayNotes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onPreview={onPreview}
                      onBookmark={onBookmark}
                      onPurchase={onPurchase}
                      onViewNotes={onViewNotes}
                      isBookmarked={bookmarkedIds.includes(note.id)}
                      isPurchased={purchasedIds.includes(note.id)}
                      paymentLoading={paymentLoading}
                      purchasingNoteId={purchasingNoteId}
                    />
                  ))}
                </div>
              ) : (
                isSearching ? (
                  // No notes found – only show empty state if PYQs also have no results
                  !showSearchPYQs && (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800">
                      <Search className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-slate-700" />
                      <p className="text-gray-500 dark:text-slate-400 mb-4">No results found for "{searchQuery}"</p>
                      {onRequestNotes && (
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
                ) : null
              )}

              {/* ── Free PYQ Papers section inside search results ───── */}
              {showSearchPYQs && (
                <div className="mt-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-gray-900 dark:text-white font-semibold text-lg">
                      Free PYQ Papers
                    </h3>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                      {filteredPYQs.length} found
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPYQs.map((pyq) => (
                      <div
                        key={pyq.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-xl hover:border-green-300 dark:hover:border-green-700 transition-all group flex flex-col"
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
                          {pyq.courseName}
                        </p>
                        <div className="flex items-center gap-2 mt-auto">
                          <a
                            href={pyq.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 px-3 py-2 rounded-xl transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open Drive
                          </a>
                          <button
                            onClick={(e) => handleSharePYQ(e, pyq.id)}
                            className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Copy share link"
                            aria-label="Share PYQ"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Request button when nothing at all is found */}
              {isSearching && displayNotes.length === 0 && !showSearchPYQs && onRequestNotes && (
                <div className="text-center mt-4">
                  <button
                    onClick={onRequestNotes}
                    className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl hover:opacity-90 transition-colors"
                    style={{ backgroundColor: '#8b5cf6' }}
                  >
                    <FileQuestion className="w-5 h-5" />
                    Request "{searchQuery}"
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <LinkCopiedToast isVisible={showShareToast} onHide={() => setShowShareToast(false)} />
    </div>
  );
}