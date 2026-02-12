import { useEffect, useState } from 'react';
import { Check, Link } from 'lucide-react';

interface LinkCopiedToastProps {
    isVisible: boolean;
    onHide: () => void;
    duration?: number;
}

export function LinkCopiedToast({ isVisible, onHide, duration = 2000 }: LinkCopiedToastProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true);
            const timer = setTimeout(() => {
                setIsAnimating(false);
                setTimeout(onHide, 300); // Wait for exit animation
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onHide]);

    if (!isVisible && !isAnimating) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
            <div
                className={`
          glass rounded-2xl px-6 py-4 shadow-2xl border border-white/20
          flex items-center gap-3
          transform transition-all duration-300 ease-out
          ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
                style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(16, 185, 129, 0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                </div>
                <div className="flex flex-col">
                    <span className="text-white font-semibold text-lg">Link Copied!</span>
                    <span className="text-white/80 text-sm flex items-center gap-1">
                        <Link className="w-3 h-3" />
                        Ready to share
                    </span>
                </div>
            </div>
        </div>
    );
}
