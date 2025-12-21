import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Upload, Eye, EyeOff, ArrowLeft, Sun, Moon, User } from 'lucide-react';

interface SignupPageProps {
  onNavigateToLogin: () => void;
  onNavigateToLanding?: () => void;
}

export function SignupPage({ onNavigateToLogin, onNavigateToLanding }: SignupPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, enterGuestMode } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await signup(name, email, password);
    if (!result.success) {
      setError(result.error || 'Failed to create account');
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-100 via-white to-gray-100'}`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 p-3 rounded-xl transition-colors z-50 ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 text-slate-300' : 'bg-white/80 hover:bg-white text-gray-700 shadow-lg'}`}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Back to Landing Button */}
      {onNavigateToLanding && (
        <button
          onClick={onNavigateToLanding}
          className={`fixed top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors z-50 ${isDark ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white' : 'bg-white/80 hover:bg-white shadow-lg text-gray-700 hover:text-gray-900'}`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Home</span>
        </button>
      )}

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Upload className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Account</h1>
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>Join the knowledge marketplace</p>
        </div>

        {/* Signup Form */}
        <div className={`backdrop-blur-xl rounded-2xl p-8 shadow-2xl ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/80 border border-gray-200'}`}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className={`block text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className={isDark ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20'}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className={`block text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={isDark ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20'}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className={`block text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className={`pr-10 ${isDark ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className={`block text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={isDark ? 'bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20'}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDark ? 'border-slate-700' : 'border-gray-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-white/80 text-gray-500'}`}>or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={enterGuestMode}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
            >
              <User className="w-5 h-5" />
              Continue as Guest
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
              Already have an account?{' '}
              <button
                onClick={onNavigateToLogin}
                className="text-purple-500 hover:text-purple-400 transition-colors font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        <p className={`text-center text-xs mt-6 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}