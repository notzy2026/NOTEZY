import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
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
import { AdminPayoutsPage } from './components/AdminPayoutsPage';
import { AdminRequestsPage } from './components/AdminRequestsPage';
import { AdminFreePYQPage } from './components/AdminFreePYQPage';
import { MyRequestsPage } from './components/MyRequestsPage';
import { NoteDeepLink } from './components/NoteDeepLink';

import { LoginPromptModal } from './components/LoginPromptModal';
import { OnboardingModal } from './components/OnboardingModal';
import { GuestUploadPage } from './components/GuestUploadPage';
import { GuestLockedPage } from './components/GuestLockedPage';
import { Download, Bookmark, FileQuestion, IndianRupee, User, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import {
  PublicTermsPage,

  PublicPrivacyPage,
  PublicRefundPage,
  PublicShippingPage,
  ContactUsPage
} from './components/pages';
import { Note, UserProfile, FreePYQ } from './types';
import {
  getNotes,
  getUserPurchases,
  getUserBookmarks,
  getUserBookmarkIds,
  getUserPurchaseIds,
  addBookmark,
  removeBookmark,
  getNoteById,
  getFreePYQs,
} from './lib/firestore';
import { useRazorpay } from './hooks/useRazorpay';

function AppContent() {
  const { isAuthenticated, isLoading, user, userProfile, logout, isGuest, exitGuestMode, isNewUser, setIsNewUser, returnUrl, setReturnUrl } = useAuth();
  const { initiatePayment, loading: paymentLoading } = useRazorpay();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const [authPage, setAuthPage] = useState<'landing' | 'login' | 'signup'>('landing');
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [openPYQOnLoad, setOpenPYQOnLoad] = useState(() => searchParams.has('pyq'));
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [viewerNote, setViewerNote] = useState<Note | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState('');
  const [purchasingNoteId, setPurchasingNoteId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding for guests (first visit) or new users
  useEffect(() => {
    if (isGuest || isNewUser) {
      // Small delay to ensure smooth entrance animation after page load
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isGuest, isNewUser]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    if (isNewUser) {
      setIsNewUser(false);
    }
  };

  const handleKnowMore = () => {
    exitGuestMode();
    setAuthPage('landing');
  };


  // Redirect admin users to admin page by default
  useEffect(() => {
    if (userProfile?.isAdmin && currentPage === 'home') {
      setCurrentPage('admin');
    }
  }, [userProfile?.isAdmin]);

  // Handle ?pyq= deep link: open home page in PYQ section
  useEffect(() => {
    if (searchParams.has('pyq')) {
      setCurrentPage('home');
      setOpenPYQOnLoad(true);
      // Clean the param from the URL without reloading
      const next = new URLSearchParams(searchParams);
      next.delete('pyq');
      setSearchParams(next, { replace: true });
    }
  }, []);

  // Handle redirect back to note page after login
  useEffect(() => {
    if (isAuthenticated && !isGuest && returnUrl) {
      const url = returnUrl;
      setReturnUrl(null); // Clear the return URL
      navigate(url);
    }
  }, [isAuthenticated, isGuest, returnUrl, navigate, setReturnUrl]);

  // Check if user is blocked
  const isBlocked = userProfile?.isBlocked || false;

  // Data from Firestore
  const [notes, setNotes] = useState<Note[]>([]);
  const [freePYQs, setFreePYQs] = useState<FreePYQ[]>([]);
  const [purchasedNotes, setPurchasedNotes] = useState<Note[]>([]);
  const [bookmarkedNotes, setBookmarkedNotes] = useState<Note[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch notes and free PYQs from Firestore on mount
  useEffect(() => {
    async function fetchNotes() {
      try {
        const [allNotes, allPYQs] = await Promise.all([
          getNotes(),
          getFreePYQs()
        ]);
        setNotes(allNotes);
        setFreePYQs(allPYQs);
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

  // Show login/signup if not authenticated and not guest
  if (!isAuthenticated && !isGuest) {
    // If there's a return URL, show login page directly (user came from shared link)
    const pageToShow = returnUrl ? 'login' : authPage;
    if (pageToShow === 'login') {
      return (
        <LoginPage
          onNavigateToSignup={() => setAuthPage('signup')}
          onNavigateToLanding={() => setAuthPage('landing')}
        />
      );
    } else if (pageToShow === 'signup') {
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

  // Helper to prompt login for guests
  const requireAuth = (message: string): boolean => {
    if (isGuest) {
      setLoginPromptMessage(message);
      setShowLoginPrompt(true);
      return false;
    }
    return true;
  };

  const handleGuestLoginRedirect = () => {
    setShowLoginPrompt(false);
    exitGuestMode();
    setAuthPage('login');
  };

  const handleGuestSignupRedirect = () => {
    setShowLoginPrompt(false);
    exitGuestMode();
    setAuthPage('signup');
  };

  const handlePurchase = async (noteId: string) => {
    if (!requireAuth('Please login to purchase notes.')) return;
    if (!user) return;

    const note = notes.find(n => n.id === noteId);
    if (note && !purchasedIds.includes(noteId)) {
      try {
        setPurchasingNoteId(noteId);
        // Initiate Razorpay payment
        const result = await initiatePayment(noteId, note.price, note.title);

        if (result.success) {
          // Payment successful - fetch fresh note data from Firestore to ensure we have pdfUrls
          const freshNote = await getNoteById(noteId);
          if (freshNote) {
            setPurchasedNotes([...purchasedNotes, freshNote]);
          } else {
            setPurchasedNotes([...purchasedNotes, note]);
          }
          setPurchasedIds([...purchasedIds, noteId]);
          // Redirect user to Downloads section
          setCurrentPage('downloads');
        } else if (result.error && result.error !== 'Payment cancelled') {
          alert(`Payment failed: ${result.error}`);
        }
      } catch (error) {
        console.error('Error purchasing note:', error);
        alert('Failed to initiate payment. Please try again.');
      } finally {
        setPurchasingNoteId(null);
      }
    }
  };

  const handleBookmark = async (noteId: string) => {
    if (!requireAuth('Please login to bookmark notes.')) return;
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
    if (!requireAuth('Please login to view full notes.')) return;
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
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLoginRequest={handleGuestLoginRedirect}
      />

      {/* Only show TopBar on desktop, hide on mobile */}
      <div className="hidden lg:block">
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearch={showSearch}
          onNavigate={setCurrentPage}
          onLoginRequest={handleGuestLoginRedirect}
        />
      </div>

      {currentPage === 'home' && (
        <HomePage
          notes={notes}
          freePYQs={freePYQs}
          onPreview={setPreviewNote}
          onBookmark={handleBookmark}
          onPurchase={handlePurchase}
          onViewNotes={handleViewNotes}
          bookmarkedIds={bookmarkedIds}
          purchasedIds={purchasedIds}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRequestNotes={() => setCurrentPage('my-requests')}
          paymentLoading={paymentLoading}
          purchasingNoteId={purchasingNoteId}
          isGuest={isGuest}
          onKnowMore={handleKnowMore}
          openPYQOnLoad={openPYQOnLoad}
        />

      )}

      {currentPage === 'downloads' && (
        isGuest ? (
          <GuestLockedPage
            icon={Download}
            title="Your downloads will appear here"
            subtitle="Purchase notes and access them anytime, even offline."
            ctaLabel="Sign in to see your downloads"
            cards={[
              { icon: Download, iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400', borderColor: '#60a5fa', title: 'Instant Access', description: 'Get PDF access immediately after purchase.' },
              { icon: Bookmark, iconBg: 'bg-purple-50 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400', borderColor: '#c084fc', title: 'Save & Revisit', description: 'All your bought materials in one place, always.' },
            ]}
            onLoginRequest={handleGuestLoginRedirect}
          />
        ) : (
          <DownloadsPage
            purchasedNotes={purchasedNotes}
            onPreview={setPreviewNote}
            onViewNotes={handleViewNotes}
          />
        )
      )}

      {currentPage === 'bookmarks' && (
        isGuest ? (
          <GuestLockedPage
            icon={Bookmark}
            title="Bookmark notes to revisit later"
            subtitle="Save any note with one tap and come back to it whenever you want."
            ctaLabel="Sign in to see your bookmarks"
            cards={[
              { icon: Bookmark, iconBg: 'bg-pink-50 dark:bg-pink-900/30', iconColor: 'text-pink-600 dark:text-pink-400', borderColor: '#f472b6', title: 'Save Instantly', description: 'Bookmark any note in one tap while browsing.' },
              { icon: FileQuestion, iconBg: 'bg-amber-50 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400', borderColor: '#fbbf24', title: 'Never Lose Track', description: 'All your saved notes organised in one list.' },
            ]}
            onLoginRequest={handleGuestLoginRedirect}
          />
        ) : (
          <BookmarksPage
            bookmarkedNotes={bookmarkedNotes}
            onPreview={setPreviewNote}
            onBookmark={handleBookmark}
            onPurchase={handlePurchase}
            onViewNotes={handleViewNotes}
            purchasedIds={purchasedIds}
            paymentLoading={paymentLoading}
            purchasingNoteId={purchasingNoteId}
          />
        )
      )}

      {currentPage === 'earnings' && (
        isGuest ? (
          <GuestLockedPage
            icon={IndianRupee}
            title="Track your earnings here"
            subtitle="Upload your notes and watch your money grow with every sale."
            ctaLabel="Sign in to view earnings"
            cards={[
              { icon: IndianRupee, iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400', borderColor: '#34d399', title: '70% Revenue Share', description: 'You keep 70% of every sale. 30% goes to the platform.' },
              { icon: Download, iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400', borderColor: '#60a5fa', title: 'Weekly Payouts', description: 'Earnings sent directly to your account every week.' },
            ]}
            onLoginRequest={handleGuestLoginRedirect}
          />
        ) : (
          <EarningsPage
            totalEarnings={currentUserProfile.totalEarnings}
            uploadedNotes={currentUserProfile.uploadedNotes}
          />
        )
      )}

      {currentPage === 'profile' && (
        isGuest ? (
          <GuestLockedPage
            icon={User}
            title="Your profile lives here"
            subtitle="See your uploaded notes, earnings history, and manage your account."
            ctaLabel="Sign in to view profile"
            cards={[
              { icon: User, iconBg: 'bg-violet-50 dark:bg-violet-900/30', iconColor: 'text-violet-600 dark:text-violet-400', borderColor: '#a78bfa', title: 'Personal Dashboard', description: 'Track your notes, sales, and account details.' },
              { icon: SettingsIcon, iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-600 dark:text-slate-400', borderColor: '#94a3b8', title: 'Full Control', description: 'Update your name, avatar, and payment info anytime.' },
            ]}
            onLoginRequest={handleGuestLoginRedirect}
          />
        ) : (
          <ProfilePage
            user={currentUserProfile}
            onPreview={setPreviewNote}
          />
        )
      )}

      {currentPage === 'upload' && (
        isGuest ? (
          <GuestUploadPage onLoginRequest={handleGuestLoginRedirect} />
        ) : (
          <UploadNotesPage />
        )
      )}

      {currentPage === 'settings' && (
        isGuest ? (
          <GuestLockedPage
            icon={SettingsIcon}
            title="Settings & preferences"
            subtitle="Sign in to manage your account, notifications, and privacy settings."
            ctaLabel="Sign in to access settings"
            cards={[]}
            onLoginRequest={handleGuestLoginRedirect}
          />
        ) : (
          <SettingsPage
            onNavigateToTerms={() => setCurrentPage('terms')}
            onNavigateToAbout={() => setCurrentPage('about')}
            onNavigateToPrivacy={() => setCurrentPage('privacy')}
            onNavigateToRefund={() => setCurrentPage('refund')}
            onNavigateToShipping={() => setCurrentPage('shipping')}
          />
        )
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

      {currentPage === 'support' && (
        isGuest ? (
          <GuestLockedPage
            icon={MessageSquare}
            title="We're here to help"
            subtitle="Create an account to chat with our support team or report any issue."
            ctaLabel="Sign in to contact support"
            cards={[
              { icon: MessageSquare, iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400', borderColor: '#60a5fa', title: 'Live Chat', description: 'Get help from our support team in real time.' },
              { icon: User, iconBg: 'bg-violet-50 dark:bg-violet-900/30', iconColor: 'text-violet-600 dark:text-violet-400', borderColor: '#a78bfa', title: 'Account Help', description: 'Resolve payment issues, disputes, and more.' },
            ]}
            onLoginRequest={handleGuestLoginRedirect}
          />
        ) : (
          <CustomerSupportPage onBack={() => setCurrentPage('home')} />
        )
      )}

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

      {currentPage === 'admin-payouts' && (
        <AdminPayoutsPage onBack={() => setCurrentPage('admin')} />
      )}

      {currentPage === 'admin-requests' && (
        <AdminRequestsPage onBack={() => setCurrentPage('admin')} />
      )}

      {currentPage === 'admin-pyqs' && (
        <AdminFreePYQPage onBack={() => setCurrentPage('admin')} />
      )}

      {currentPage === 'my-requests' && (
        isGuest ? (
          <GuestLockedPage
            icon={FileQuestion}
            title="Request the notes you need"
            subtitle="Can't find what you're looking for? Request it and sellers will upload it for you."
            ctaLabel="Sign in to make a request"
            cards={[
              { icon: FileQuestion, iconBg: 'bg-amber-50 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400', borderColor: '#fbbf24', title: 'Ask for Anything', description: 'Request notes for any subject, chapter, or exam.' },
              { icon: MessageSquare, iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400', borderColor: '#60a5fa', title: 'Sellers Respond', description: 'Active sellers get notified and upload what you need.' },
            ]}
            onLoginRequest={handleGuestLoginRedirect}
          />
        ) : (
          <MyRequestsPage />
        )
      )}

      {previewNote && (
        <NotePreviewModal
          note={previewNote}
          onClose={() => setPreviewNote(null)}
          onPurchase={handlePurchase}
          paymentLoading={paymentLoading}
          purchasingNoteId={purchasingNoteId}
        />
      )}

      {viewerNote && (
        <NotesViewer
          note={viewerNote}
          onClose={() => setViewerNote(null)}
        />
      )}

      {/* Login Prompt Modal for Guests */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onLogin={handleGuestLoginRedirect}
        onSignup={handleGuestSignupRedirect}
        message={loginPromptMessage}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        isGuest={isGuest}
        onSignupRequest={handleGuestSignupRedirect}
      />
    </div>
  );
}


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public policy pages - accessible without login */}
          <Route path="/terms" element={<PublicTermsPage />} />
          <Route path="/privacy" element={<PublicPrivacyPage />} />
          <Route path="/refund" element={<PublicRefundPage />} />
          <Route path="/shipping" element={<PublicShippingPage />} />
          <Route path="/contact" element={<ContactUsPage />} />

          {/* Deep link for shared notes */}
          <Route path="/note/:noteId" element={<NoteDeepLink />} />

          {/* Main app route */}
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}