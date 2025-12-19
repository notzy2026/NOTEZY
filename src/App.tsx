import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { TopBar } from './components/TopBar';
import { HomePage } from './components/HomePage';
import { DownloadsPage } from './components/DownloadsPage';
import { BookmarksPage } from './components/BookmarksPage';
import { EarningsPage } from './components/EarningsPage';
import { ProfilePage } from './components/ProfilePage';
import { UploadNotesPage } from './components/UploadNotesPage';
import { NotePreviewModal } from './components/NotePreviewModal';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { SettingsPage } from './components/SettingsPage';
import { TermsPage } from './components/TermsPage';
import { AboutPage } from './components/AboutPage';
import { PrivacyPage } from './components/PrivacyPage';
import { RefundPage } from './components/RefundPage';
import { ShippingPage } from './components/ShippingPage';
import { NotesViewer } from './components/NotesViewer';
import { CustomerSupportPage } from './components/CustomerSupportPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminEarningsPage } from './components/AdminEarningsPage';
import { AdminNotesPage } from './components/AdminNotesPage';
import { AdminChatPage } from './components/AdminChatPage';
import { AdminUsersPage } from './components/AdminUsersPage';
import { Note, UserProfile } from './types';
import {
  getNotes,
  getUserPurchases,
  getUserBookmarks,
  getUserBookmarkIds,
  getUserPurchaseIds,
  addPurchase,
  addBookmark,
  removeBookmark,
  getNoteById,
} from './lib/firestore';

function AppContent() {
  const { isAuthenticated, isLoading, user, userProfile, logout } = useAuth();
  const [authPage, setAuthPage] = useState<'landing' | 'login' | 'signup'>('landing');
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [viewerNote, setViewerNote] = useState<Note | null>(null);

  // Redirect admin users to admin page by default
  useEffect(() => {
    if (userProfile?.isAdmin && currentPage === 'home') {
      setCurrentPage('admin');
    }
  }, [userProfile?.isAdmin]);

  // Check if user is blocked
  const isBlocked = userProfile?.isBlocked || false;

  // Data from Firestore
  const [notes, setNotes] = useState<Note[]>([]);
  const [purchasedNotes, setPurchasedNotes] = useState<Note[]>([]);
  const [bookmarkedNotes, setBookmarkedNotes] = useState<Note[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch notes from Firestore on mount
  useEffect(() => {
    async function fetchNotes() {
      try {
        const allNotes = await getNotes();
        setNotes(allNotes);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    }
    fetchNotes();
  }, []);

  // Fetch user-specific data when authenticated
  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        setPurchasedNotes([]);
        setBookmarkedNotes([]);
        setBookmarkedIds([]);
        setPurchasedIds([]);
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        const [purchases, bookmarks, bookmarkIds, purchaseIds] = await Promise.all([
          getUserPurchases(user.uid),
          getUserBookmarks(user.uid),
          getUserBookmarkIds(user.uid),
          getUserPurchaseIds(user.uid),
        ]);
        setPurchasedNotes(purchases);
        setBookmarkedNotes(bookmarks);
        setBookmarkedIds(bookmarkIds);
        setPurchasedIds(purchaseIds);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setDataLoading(false);
      }
    }
    fetchUserData();
  }, [user]);

  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login/signup if not authenticated
  if (!isAuthenticated) {
    if (authPage === 'login') {
      return (
        <LoginPage
          onNavigateToSignup={() => setAuthPage('signup')}
          onNavigateToLanding={() => setAuthPage('landing')}
        />
      );
    } else if (authPage === 'signup') {
      return (
        <SignupPage
          onNavigateToLogin={() => setAuthPage('login')}
          onNavigateToLanding={() => setAuthPage('landing')}
        />
      );
    } else {
      return (
        <LandingPage
          onNavigateToLogin={() => setAuthPage('login')}
          onNavigateToSignup={() => setAuthPage('signup')}
        />
      );
    }
  }

  const handlePurchase = async (noteId: string) => {
    if (!user) return;

    const note = notes.find(n => n.id === noteId);
    if (note && !purchasedIds.includes(noteId)) {
      try {
        await addPurchase(user.uid, noteId);
        setPurchasedNotes([...purchasedNotes, note]);
        setPurchasedIds([...purchasedIds, noteId]);
        // In production, integrate payment processing here
        alert(`Successfully purchased "${note.title}" for $${note.price}`);
      } catch (error) {
        console.error('Error purchasing note:', error);
        alert('Failed to purchase note. Please try again.');
      }
    }
  };

  const handleBookmark = async (noteId: string) => {
    if (!user) return;

    const note = notes.find(n => n.id === noteId);
    if (note) {
      const isBookmarked = bookmarkedIds.includes(noteId);
      try {
        if (isBookmarked) {
          await removeBookmark(user.uid, noteId);
          setBookmarkedNotes(bookmarkedNotes.filter(n => n.id !== noteId));
          setBookmarkedIds(bookmarkedIds.filter(id => id !== noteId));
        } else {
          await addBookmark(user.uid, noteId);
          setBookmarkedNotes([...bookmarkedNotes, note]);
          setBookmarkedIds([...bookmarkedIds, noteId]);
        }
      } catch (error) {
        console.error('Error updating bookmark:', error);
      }
    }
  };

  const handleViewNotes = async (noteId: string) => {
    const note = [...purchasedNotes, ...notes].find(n => n.id === noteId);
    if (note) {
      setViewerNote(note);
    }
  };

  // Create user profile object for components that need it
  const currentUserProfile: UserProfile = userProfile || {
    id: user?.uid || '',
    name: user?.displayName || 'User',
    email: user?.email || '',
    avatarUrl: '',
    totalEarnings: 0,
    uploadedNotes: [],
  };

  const showSearch = currentPage === 'home';

  // Show blocked user screen with two options
  if (isBlocked) {
    // If on support page, show support chat fullscreen
    if (currentPage === 'support') {
      return (
        <div className="min-h-screen bg-slate-950">
          <CustomerSupportPage onBack={() => setCurrentPage('home')} />
        </div>
      );
    }

    // Show blocked user message with options
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dc2626' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl text-white mb-2">Account Blocked</h1>
          <p className="text-slate-400 mb-8">
            Your account has been blocked. If you believe this is a mistake or need help, please contact our support team.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setCurrentPage('support')}
              className="w-full py-3 px-6 rounded-xl text-white font-medium transition-colors"
              style={{ backgroundColor: '#2563eb' }}
            >
              💬 Chat with Customer Care
            </button>
            <button
              onClick={() => logout()}
              className="w-full py-3 px-6 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Only show TopBar on desktop, hide on mobile */}
      <div className="hidden lg:block">
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearch={showSearch}
        />
      </div>

      {currentPage === 'home' && (
        <HomePage
          notes={notes}
          onPreview={setPreviewNote}
          onBookmark={handleBookmark}
          onPurchase={handlePurchase}
          onViewNotes={handleViewNotes}
          bookmarkedIds={bookmarkedIds}
          purchasedIds={purchasedIds}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {currentPage === 'downloads' && (
        <DownloadsPage
          purchasedNotes={purchasedNotes}
          onPreview={setPreviewNote}
          onViewNotes={handleViewNotes}
        />
      )}

      {currentPage === 'bookmarks' && (
        <BookmarksPage
          bookmarkedNotes={bookmarkedNotes}
          onPreview={setPreviewNote}
          onBookmark={handleBookmark}
          onPurchase={handlePurchase}
          onViewNotes={handleViewNotes}
          purchasedIds={purchasedIds}
        />
      )}

      {currentPage === 'earnings' && (
        <EarningsPage
          totalEarnings={currentUserProfile.totalEarnings}
          uploadedNotes={currentUserProfile.uploadedNotes}
        />
      )}

      {currentPage === 'profile' && (
        <ProfilePage
          user={currentUserProfile}
          onPreview={setPreviewNote}
        />
      )}

      {currentPage === 'upload' && <UploadNotesPage />}

      {currentPage === 'settings' && (
        <SettingsPage
          onNavigateToTerms={() => setCurrentPage('terms')}
          onNavigateToAbout={() => setCurrentPage('about')}
          onNavigateToPrivacy={() => setCurrentPage('privacy')}
          onNavigateToRefund={() => setCurrentPage('refund')}
          onNavigateToShipping={() => setCurrentPage('shipping')}
        />
      )}

      {currentPage === 'terms' && (
        <TermsPage onBack={() => setCurrentPage('settings')} />
      )}

      {currentPage === 'about' && (
        <AboutPage onBack={() => setCurrentPage('settings')} />
      )}

      {currentPage === 'privacy' && (
        <PrivacyPage onBack={() => setCurrentPage('settings')} />
      )}

      {currentPage === 'refund' && (
        <RefundPage onBack={() => setCurrentPage('settings')} />
      )}

      {currentPage === 'shipping' && (
        <ShippingPage onBack={() => setCurrentPage('settings')} />
      )}

      {currentPage === 'support' && <CustomerSupportPage onBack={() => setCurrentPage('home')} />}

      {currentPage === 'admin' && (
        <AdminDashboard onNavigate={setCurrentPage} />
      )}

      {currentPage === 'admin-earnings' && (
        <AdminEarningsPage onBack={() => setCurrentPage('admin')} />
      )}

      {currentPage === 'admin-notes' && (
        <AdminNotesPage onBack={() => setCurrentPage('admin')} />
      )}

      {currentPage === 'admin-chats' && (
        <AdminChatPage onBack={() => setCurrentPage('admin')} />
      )}

      {currentPage === 'admin-users' && (
        <AdminUsersPage />
      )}

      {previewNote && (
        <NotePreviewModal
          note={previewNote}
          onClose={() => setPreviewNote(null)}
        />
      )}

      {viewerNote && (
        <NotesViewer
          note={viewerNote}
          onClose={() => setViewerNote(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}