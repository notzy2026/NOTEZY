import { X, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    isGuest: boolean;
    onSignupRequest?: () => void;
}

export function OnboardingModal({ isOpen, onClose, isGuest, onSignupRequest }: OnboardingModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative w-full bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl transform transition-all duration-300 flex flex-col justify-center ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`} style={{ maxWidth: '400px', minHeight: '450px' }}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg transform -rotate-6">
                        <span className="text-3xl">👋</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        {isGuest ? 'Unlock Full Access' : 'Welcome to Notezy!'}
                    </h2>
                    
                    {isGuest ? (
                        <>
                            <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                                Join our student marketplace to get the most out of Notezy. Create a free account to:
                            </p>
                            
                            <ul className="text-left text-sm text-gray-700 dark:text-slate-300 space-y-3 mb-8 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 bg-green-100 dark:bg-green-900/30 p-0.5 rounded-full shrink-0">
                                        <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                    </div>
                                    Bookmark & save favorite notes
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 bg-green-100 dark:bg-green-900/30 p-0.5 rounded-full shrink-0">
                                        <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                    </div>
                                    Download secure verified PDFs
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 bg-green-100 dark:bg-green-900/30 p-0.5 rounded-full shrink-0">
                                        <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                                    </div>
                                    Upload materials to earn money
                                </li>
                            </ul>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        if (onSignupRequest) onSignupRequest();
                                        onClose();
                                    }}
                                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    Sign Up Free
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-semibold rounded-xl transition-all duration-200"
                                >
                                    Continue as Guest
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-8">
                                Notezy is a student marketplace to buy and sell quality notes, assignments, PYQs, and study materials. Get exam-ready content or earn by sharing your own notes—quick, secure, and student-friendly.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Get Started
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
