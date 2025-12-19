import { Home, Download, Bookmark, IndianRupee, User, Upload, Menu, X, Moon, Sun, Settings, MessageSquare, Shield, Users, FileText, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { userProfile, logout } = useAuth();

  const isAdmin = userProfile?.isAdmin || false;

  // Regular user menu items
  const userMenuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'earnings', label: 'Earnings', icon: IndianRupee },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'upload', label: 'Upload Notes', icon: Upload },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Admin-only menu items
  const adminMenuItems = [
    { id: 'admin', label: 'Dashboard', icon: Shield },
    { id: 'admin-users', label: 'Manage Users', icon: Users },
    { id: 'admin-earnings', label: 'User Earnings', icon: IndianRupee },
    { id: 'admin-notes', label: 'Manage Notes', icon: FileText },
    { id: 'admin-chats', label: 'Support Chats', icon: MessageSquare },
  ];

  // Which menu items to show based on user type
  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  // Mobile bottom navbar items - different for admin
  const mobileBottomItems = isAdmin
    ? [
      { id: 'admin', label: 'Dashboard', icon: Shield },
      { id: 'admin-users', label: 'Users', icon: Users },
      { id: 'admin-notes', label: 'Notes', icon: FileText },
      { id: 'admin-chats', label: 'Chats', icon: MessageSquare },
    ]
    : [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'downloads', label: 'Downloads', icon: Download },
      { id: 'upload', label: 'Upload', icon: Upload },
      { id: 'earnings', label: 'Earnings', icon: IndianRupee },
      { id: 'profile', label: 'Profile', icon: User },
    ];

  // Mobile hamburger menu items (not in bottom navbar)
  const mobileMenuItems = isAdmin
    ? [] // Admin has all items in bottom navbar
    : [
      { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
      { id: 'support', label: 'Support', icon: MessageSquare },
      { id: 'settings', label: 'Settings', icon: Settings },
    ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 isolate" style={{ backgroundColor: 'var(--sidebar-bg, #ffffff)' }}>
        <style>{`.dark aside { --sidebar-bg: #0f172a !important; }`}</style>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${isAdmin ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'} rounded-xl flex items-center justify-center shadow-lg`}>
              {isAdmin ? <Shield className="w-6 h-6 text-white" /> : <Upload className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white">{isAdmin ? 'Admin Panel' : 'Notezy'}</h1>
              <p className="text-xs text-gray-500 dark:text-slate-400">{isAdmin ? 'Management Console' : 'Knowledge Marketplace'}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'text-white shadow-lg'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                style={isActive ? { backgroundColor: isAdmin ? '#db2777' : '#2563eb' } : {}}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section - Theme Toggle & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? (
              <>
                <Sun className="w-5 h-5" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          {isAdmin && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${isAdmin ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'} rounded-lg flex items-center justify-center`}>
              {isAdmin ? <Shield className="w-5 h-5 text-white" /> : <Upload className="w-5 h-5 text-white" />}
            </div>
            <span className="text-gray-900 dark:text-white font-semibold">{isAdmin ? 'Admin' : 'Notezy'}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-slate-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-slate-300" />
              )}
            </button>
            {/* Logout for Admin */}
            {isAdmin && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              </button>
            )}
            {/* Hamburger Menu - only for non-admin */}
            {!isAdmin && mobileMenuItems.length > 0 && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700 dark:text-slate-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700 dark:text-slate-300" />
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Hamburger Menu Dropdown - only for non-admin */}
      {mobileMenuOpen && !isAdmin && (
        <div className="lg:hidden fixed top-14 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-lg">
          <nav className="p-2">
            {mobileMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
        <div className="flex justify-around items-center h-16">
          {mobileBottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive
                  ? isAdmin
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-slate-400'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}