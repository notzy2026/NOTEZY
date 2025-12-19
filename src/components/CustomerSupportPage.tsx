import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { getUserChats, getChatMessages, sendChatMessage, createSupportChat } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';

interface CustomerSupportPageProps {
    onBack: () => void;
}

export function CustomerSupportPage({ onBack }: CustomerSupportPageProps) {
    const { user, userProfile } = useAuth();
    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            initializeChat();
        }
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Poll for new messages every 3 seconds
    useEffect(() => {
        if (!chatId) return;

        const interval = setInterval(() => {
            loadMessages(chatId);
        }, 3000);

        return () => clearInterval(interval);
    }, [chatId]);

    async function initializeChat() {
        if (!user) return;
        try {
            const chats = await getUserChats(user.uid);
            if (chats.length > 0) {
                setChatId(chats[0].id);
                await loadMessages(chats[0].id);
            }
        } catch (error) {
            console.error('Error initializing chat:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadMessages(id: string) {
        try {
            const messagesData = await getChatMessages(id);
            setMessages(messagesData);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim() || !user || !userProfile) return;

        setSending(true);
        try {
            if (chatId) {
                await sendChatMessage(chatId, user.uid, userProfile.name, false, newMessage);
                setNewMessage('');
                await loadMessages(chatId);
            } else {
                const newChatId = await createSupportChat(user.uid, userProfile.name, userProfile.email, newMessage);
                setChatId(newChatId);
                setNewMessage('');
                await loadMessages(newChatId);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-gray-50 dark:bg-gray-950 lg:left-64 flex items-center justify-center z-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-950 lg:left-64 flex flex-col z-50">
            {/* Header with Back Button */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Support</h1>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        We typically reply within minutes
                    </p>
                </div>
            </div>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-xl text-gray-900 dark:text-white mb-2">Welcome to Notezy Support!</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md">
                            Have a question or need help? Send us a message and our team will get back to you as soon as possible.
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => {
                            // User messages (isAdmin === false) should be on the RIGHT
                            // Admin messages (isAdmin === true) should be on the LEFT
                            const isFromUser = message.isAdmin === false;

                            return (
                                <div
                                    key={message.id}
                                    style={{ display: 'flex', justifyContent: isFromUser ? 'flex-end' : 'flex-start' }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        gap: '8px',
                                        maxWidth: '75%',
                                        flexDirection: isFromUser ? 'row-reverse' : 'row'
                                    }}>
                                        {!isFromUser && (
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <MessageSquare className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                        <div
                                            style={{
                                                borderRadius: '16px',
                                                borderBottomRightRadius: isFromUser ? '4px' : '16px',
                                                borderBottomLeftRadius: isFromUser ? '16px' : '4px',
                                                padding: '12px 16px',
                                                background: isFromUser ? 'linear-gradient(to right, #2563eb, #9333ea)' : undefined,
                                                backgroundColor: isFromUser ? undefined : 'white',
                                                color: isFromUser ? 'white' : '#111827',
                                                border: isFromUser ? 'none' : '1px solid #e5e7eb',
                                            }}
                                            className={!isFromUser ? 'dark:bg-gray-800 dark:text-white dark:border-gray-700' : ''}
                                        >
                                            {!isFromUser && (
                                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium block mb-1">Support Team</span>
                                            )}
                                            <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{message.text}</p>
                                            <span style={{
                                                fontSize: '11px',
                                                marginTop: '4px',
                                                display: 'block',
                                                opacity: isFromUser ? 0.7 : 0.5,
                                                textAlign: isFromUser ? 'right' : 'left'
                                            }}>
                                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 safe-area-inset-bottom">
                <form onSubmit={handleSendMessage}>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500"
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            {sending ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Send className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
