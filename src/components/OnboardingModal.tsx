import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    isGuest: boolean;
}

export function OnboardingModal({ isOpen, onClose, isGuest }: OnboardingModalProps) {
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

            <div className={`relative w-full bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl transform transition-all duration-300 flex flex-col justify-center ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`} style={{ maxWidth: '350px', minHeight: '450px' }}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform -rotate-6">
                        <span className="text-2xl">👋</span>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                        Welcome to Notezy!
                    </h2>
                    <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                        Notezy is a student marketplace to buy and sell quality notes, assignments, PYQs, and study materials. Get exam-ready content or earn by sharing your own notes—quick, secure, and student-friendly.
                    </p>


                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
}
