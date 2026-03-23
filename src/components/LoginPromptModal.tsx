import { X, LogIn, UserPlus } from 'lucide-react';

interface LoginPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
    onSignup: () => void;
    message?: string;
}

export function LoginPromptModal({ isOpen, onClose, onLogin, onSignup, message }: LoginPromptModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Login Required</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 dark:text-slate-400 mb-6 text-center text-sm leading-relaxed">
                        {message || 'Please login or create an account to access this feature and unlock all features.'}
                    </p>

                    {/* Social Proof Block */}
                    <div className="bg-blue-50/50 dark:bg-slate-800/40 rounded-2xl p-4 mb-6 border border-blue-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 flex justify-center items-center text-xs text-white font-medium">S</div>
                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-pink-500 flex justify-center items-center text-xs text-white font-medium">R</div>
                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-500 flex justify-center items-center text-xs text-white font-medium">A</div>
                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-r from-blue-600 to-purple-600 flex justify-center items-center text-[10px] text-white font-bold">+2k</div>
                            </div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                2,000+ Students
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                            Join our growing community to buy, sell, and share premium study materials instantly.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onLogin}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-5 h-5" />
                            Sign In
                        </button>
                        <button
                            onClick={onSignup}
                            className="w-full py-3.5 px-4 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <UserPlus className="w-5 h-5" />
                            Create Free Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
