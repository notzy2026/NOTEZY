import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, FileText, Shield, User, FileCheck, Truck, Info, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';

interface SettingsPageProps {
  onNavigateToTerms: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToRefund?: () => void;
  onNavigateToShipping?: () => void;
}

export function SettingsPage({ onNavigateToTerms, onNavigateToAbout, onNavigateToPrivacy, onNavigateToRefund, onNavigateToShipping }: SettingsPageProps) {
  const { userProfile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 lg:ml-64 pb-24 lg:pb-8 mobile-page-content">
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-slate-400">Manage your account preferences and security</p>
        </div>

        {/* Account Section */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl text-gray-900 dark:text-white">Account</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50">
              <div>
                <p className="text-gray-900 dark:text-white">{userProfile?.name || 'User'}</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">{userProfile?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              {isDark ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
            </div>
            <h2 className="text-xl text-gray-900 dark:text-white">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50">
              <div>
                <p className="text-gray-900 dark:text-white">Theme</p>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Current: {isDark ? 'Dark Mode' : 'Light Mode'}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4" />
                    Switch to Light
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    Switch to Dark
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Legal Section */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl text-gray-900 dark:text-white">Legal</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={onNavigateToTerms}
              className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                <span className="text-gray-900 dark:text-white">Terms & Conditions</span>
              </div>
              <span className="text-gray-500 dark:text-slate-400">→</span>
            </button>

            <button
              onClick={onNavigateToPrivacy}
              className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                <span className="text-gray-900 dark:text-white">Privacy Policy</span>
              </div>
              <span className="text-gray-500 dark:text-slate-400">→</span>
            </button>

            <button
              onClick={onNavigateToRefund}
              className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                <span className="text-gray-900 dark:text-white">Refund Policy</span>
              </div>
              <span className="text-gray-500 dark:text-slate-400">→</span>
            </button>

            <button
              onClick={onNavigateToShipping}
              className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                <span className="text-gray-900 dark:text-white">Shipping Policy</span>
              </div>
              <span className="text-gray-500 dark:text-slate-400">→</span>
            </button>

            <button
              onClick={onNavigateToAbout}
              className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                <span className="text-gray-900 dark:text-white">About Us</span>
              </div>
              <span className="text-gray-500 dark:text-slate-400">→</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-red-200 dark:border-red-900/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl text-gray-900 dark:text-white">Danger Zone</h2>
          </div>

          <Button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}