import { Search, Bell, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showSearch?: boolean;
}

export function TopBar({ searchQuery, onSearchChange, showSearch = true }: TopBarProps) {
  const { userProfile: user } = useAuth();

  return (
    <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 lg:ml-64">
      <div className="flex items-center gap-4 px-4 lg:px-8 py-4">
        {showSearch && (
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search for notes, assignments, PYQs..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        )}

        <div className="hidden lg:flex items-center gap-3 ml-auto">
          <button className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
            <div className="text-right">
              <div className="text-sm text-gray-900 dark:text-white">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {user?.uploadedNotes && user.uploadedNotes.length > 0 ? 'Seller' : 'Member'}
              </div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
