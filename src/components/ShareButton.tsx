import { useState, useCallback } from 'react';
import { Share2 } from 'lucide-react';
import { LinkCopiedToast } from './LinkCopiedToast';

interface ShareButtonProps {
    noteId: string;
    noteTitle: string;
    variant?: 'default' | 'compact';
    className?: string;
}

export function ShareButton({ noteId, noteTitle, variant = 'default', className = '' }: ShareButtonProps) {
    const [showToast, setShowToast] = useState(false);

    const handleShare = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        // Generate the share link
        const baseUrl = window.location.origin;
        const noteLink = `${baseUrl}/note/${noteId}`;

        // Create personalized message
        const shareMessage = `Check out these notes: ${noteTitle}\n${noteLink}`;

        try {
            await navigator.clipboard.writeText(shareMessage);
            setShowToast(true);
        } catch (error) {
            console.error('Failed to copy link:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareMessage;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setShowToast(true);
            } catch (err) {
                console.error('Fallback copy failed:', err);
            }
            document.body.removeChild(textArea);
        }
    }, [noteId, noteTitle]);

    const hideToast = useCallback(() => {
        setShowToast(false);
    }, []);

    const buttonClasses = variant === 'compact'
        ? `p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 text-gray-700 dark:text-slate-300 
       hover:bg-white dark:hover:bg-slate-900 backdrop-blur-sm transition-all hover:scale-105 ${className}`
        : `p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 text-gray-700 dark:text-slate-300 
       hover:bg-white dark:hover:bg-slate-900 backdrop-blur-sm transition-all hover:scale-105 
       hover:shadow-lg ${className}`;

    return (
        <>
            <button
                onClick={handleShare}
                className={buttonClasses}
                title="Share this note"
                aria-label="Share note"
            >
                <Share2 className={variant === 'compact' ? 'w-4 h-4' : 'w-4 h-4'} />
            </button>
            <LinkCopiedToast isVisible={showToast} onHide={hideToast} />
        </>
    );
}
