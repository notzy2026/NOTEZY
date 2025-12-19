import { MessageSquare, ArrowLeft, Send, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { SupportChat, ChatMessage } from '../types';
import { getAllChats, getChatMessages, sendChatMessage, updateChatStatus } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';

interface AdminChatPageProps {
    onBack: () => void;
}

export function AdminChatPage({ onBack }: AdminChatPageProps) {
    const { userProfile } = useAuth();
    const [chats, setChats] = useState<SupportChat[]>([]);
    const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadChats();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            loadMessages(selectedChat.id);
        }
    }, [selectedChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function loadChats() {
        try {
            const chatsData = await getAllChats();
            setChats(chatsData);
        } catch (error) {
            console.error('Error loading chats:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadMessages(chatId: string) {
        try {
            const messagesData = await getChatMessages(chatId);
            setMessages(messagesData);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || !userProfile) return;

        setSending(true);
        try {
            await sendChatMessage(selectedChat.id, userProfile.id, userProfile.name, true, newMessage);
            setNewMessage('');
            await loadMessages(selectedChat.id);
            await loadChats();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    }

    async function handleStatusChange(chatId: string, status: 'open' | 'closed') {
        try {
            await updateChatStatus(chatId, status);
            await loadChats();
            if (selectedChat?.id === chatId) {
                setSelectedChat({ ...selectedChat, status });
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    function handleMobileBack() {
        setSelectedChat(null);
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', marginLeft: '256px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="bg-gray-50 dark:bg-gray-950 lg:ml-64 ml-0">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // MOBILE: Fullscreen chat overlay when chat is selected
    if (selectedChat) {
        return (
            <>
                {/* Mobile fullscreen overlay */}
                <div className="lg:hidden fixed inset-0 z-50 bg-white dark:bg-gray-950 flex flex-col">
                    {/* Header */}
                    <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="dark:bg-gray-900 dark:border-gray-800">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onClick={handleMobileBack} style={{ padding: '8px', marginLeft: '-4px', borderRadius: '12px' }} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                <ArrowLeft style={{ width: '20px', height: '20px' }} className="text-gray-700 dark:text-gray-300" />
                            </button>
                            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #3b82f6, #9333ea)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '500', fontSize: '14px' }}>
                                {selectedChat.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: '500', fontSize: '14px' }} className="text-gray-900 dark:text-white">{selectedChat.userName}</div>
                                <div style={{ fontSize: '12px' }} className="text-gray-500 dark:text-gray-400">{selectedChat.userEmail}</div>
                            </div>
                        </div>
                        {selectedChat.status === 'open' ? (
                            <button onClick={() => handleStatusChange(selectedChat.id, 'closed')} style={{ padding: '8px', borderRadius: '8px' }} className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                <XCircle style={{ width: '16px', height: '16px' }} />
                            </button>
                        ) : (
                            <button onClick={() => handleStatusChange(selectedChat.id, 'open')} style={{ padding: '8px', borderRadius: '8px' }} className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                <CheckCircle style={{ width: '16px', height: '16px' }} />
                            </button>
                        )}
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '80px' }}>
                        {messages.map((message) => (
                            <div key={message.id} style={{ display: 'flex', justifyContent: message.isAdmin ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                                <div style={{ maxWidth: '80%', borderRadius: '16px', padding: '10px 16px', background: message.isAdmin ? 'linear-gradient(to right, #2563eb, #9333ea)' : '#e5e7eb', color: message.isAdmin ? 'white' : '#111827' }}>
                                    <p style={{ fontSize: '14px', margin: 0 }}>{message.text}</p>
                                    <span style={{ fontSize: '11px', marginTop: '2px', display: 'block', color: message.isAdmin ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>
                                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #e5e7eb', padding: '12px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }} className="dark:bg-gray-900 dark:border-gray-800">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your reply..."
                                style={{ flex: 1, padding: '10px 16px', borderRadius: '9999px', border: 'none', fontSize: '14px' }}
                                className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" disabled={sending || !newMessage.trim()} style={{ padding: '10px', borderRadius: '50%', background: 'linear-gradient(to right, #2563eb, #9333ea)', color: 'white', border: 'none', cursor: 'pointer', opacity: sending || !newMessage.trim() ? 0.5 : 1 }}>
                                {sending ? <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : <Send style={{ width: '20px', height: '20px' }} />}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Desktop layout */}
                <div className="hidden lg:block" style={{ marginLeft: '256px', height: '100vh', display: 'flex' }}>
                    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                        {/* Chat List Sidebar */}
                        <div style={{ width: '320px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0 }} className="bg-white dark:bg-gray-900 dark:border-gray-800">
                            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }} className="dark:border-gray-800">
                                <button onClick={onBack} style={{ padding: '8px', marginLeft: '-8px', borderRadius: '12px' }} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <ArrowLeft style={{ width: '20px', height: '20px' }} className="text-gray-700 dark:text-gray-300" />
                                </button>
                                <MessageSquare style={{ width: '20px', height: '20px' }} className="text-blue-600" />
                                <span style={{ fontWeight: '500' }} className="text-gray-900 dark:text-white">Chats</span>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {chats.map((chat) => (
                                    <button
                                        key={chat.id}
                                        onClick={() => setSelectedChat(chat)}
                                        style={{ width: '100%', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', border: 'none', backgroundColor: selectedChat?.id === chat.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:border-gray-800"
                                    >
                                        <div style={{ width: '40px', height: '40px', minWidth: '40px', background: 'linear-gradient(135deg, #3b82f6, #9333ea)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '14px' }}>
                                            {chat.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                                                <span style={{ fontWeight: '500', fontSize: '14px' }} className="text-gray-900 dark:text-white">{chat.userName}</span>
                                                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: chat.status === 'open' ? 'rgba(34, 197, 94, 0.1)' : '#f3f4f6', color: chat.status === 'open' ? '#16a34a' : '#6b7280' }}>
                                                    {chat.status}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '13px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="text-gray-500 dark:text-gray-400">{chat.lastMessage}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }} className="bg-gray-50 dark:bg-gray-950">
                            {/* Header */}
                            <div style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="bg-white dark:bg-gray-900 dark:border-gray-800">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #3b82f6, #9333ea)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '500' }}>
                                        {selectedChat.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '500' }} className="text-gray-900 dark:text-white">{selectedChat.userName}</div>
                                        <div style={{ fontSize: '14px' }} className="text-gray-500 dark:text-gray-400">{selectedChat.userEmail}</div>
                                    </div>
                                </div>
                                {selectedChat.status === 'open' ? (
                                    <button onClick={() => handleStatusChange(selectedChat.id, 'closed')} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', fontSize: '14px', border: 'none', cursor: 'pointer' }} className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200">
                                        <XCircle style={{ width: '16px', height: '16px' }} /> Close
                                    </button>
                                ) : (
                                    <button onClick={() => handleStatusChange(selectedChat.id, 'open')} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', fontSize: '14px', border: 'none', cursor: 'pointer' }} className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200">
                                        <CheckCircle style={{ width: '16px', height: '16px' }} /> Reopen
                                    </button>
                                )}
                            </div>

                            {/* Messages */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                                {messages.map((message) => (
                                    <div key={message.id} style={{ display: 'flex', justifyContent: message.isAdmin ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                                        <div style={{ maxWidth: '70%', borderRadius: '16px', padding: '12px 16px', background: message.isAdmin ? 'linear-gradient(to right, #2563eb, #9333ea)' : '#e5e7eb', color: message.isAdmin ? 'white' : '#111827' }}>
                                            <p style={{ margin: 0 }}>{message.text}</p>
                                            <span style={{ fontSize: '12px', marginTop: '4px', display: 'block', color: message.isAdmin ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>
                                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSendMessage} style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }} className="bg-white dark:bg-gray-900 dark:border-gray-800">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your reply..."
                                        style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: 'none', fontSize: '14px' }}
                                        className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button type="submit" disabled={sending || !newMessage.trim()} style={{ padding: '12px', borderRadius: '12px', background: 'linear-gradient(to right, #2563eb, #9333ea)', color: 'white', border: 'none', cursor: 'pointer', opacity: sending || !newMessage.trim() ? 0.5 : 1 }}>
                                        {sending ? <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : <Send style={{ width: '20px', height: '20px' }} />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // No chat selected - show chat list
    return (
        <div className="bg-gray-50 dark:bg-gray-950" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            <div className="lg:ml-64" style={{ padding: '16px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <button onClick={onBack} style={{ padding: '8px', borderRadius: '12px' }} className="hover:bg-gray-200 dark:hover:bg-gray-800">
                        <ArrowLeft style={{ width: '24px', height: '24px' }} className="text-gray-700 dark:text-gray-300" />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquare style={{ width: '20px', height: '20px', color: 'white' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }} className="text-gray-900 dark:text-white">Support Chats</h1>
                            <p style={{ fontSize: '12px', margin: 0 }} className="text-gray-500 dark:text-gray-400">{chats.length} conversations</p>
                        </div>
                    </div>
                </div>

                {/* Chat List */}
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb' }} className="bg-white dark:bg-gray-900 dark:border-gray-800">
                    {chats.length > 0 ? (
                        chats.map((chat, index) => (
                            <button
                                key={chat.id}
                                onClick={() => setSelectedChat(chat)}
                                style={{ width: '100%', padding: '16px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', border: 'none', borderBottom: index < chats.length - 1 ? '1px solid #e5e7eb' : 'none', backgroundColor: 'transparent' }}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 dark:border-gray-800"
                            >
                                <div style={{ width: '48px', height: '48px', minWidth: '48px', background: 'linear-gradient(135deg, #3b82f6, #9333ea)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '18px' }}>
                                    {chat.userName.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '500' }} className="text-gray-900 dark:text-white">{chat.userName}</span>
                                        <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: chat.status === 'open' ? 'rgba(34, 197, 94, 0.1)' : '#f3f4f6', color: chat.status === 'open' ? '#16a34a' : '#6b7280' }}>
                                            {chat.status}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '14px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="text-gray-500 dark:text-gray-400">{chat.lastMessage}</p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div style={{ padding: '48px', textAlign: 'center' }} className="text-gray-500 dark:text-gray-400">
                            <MessageSquare style={{ width: '64px', height: '64px', margin: '0 auto 16px', opacity: 0.3 }} />
                            <p>No support chats yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
