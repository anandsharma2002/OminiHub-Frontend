import React, { useState, useEffect, useCallback } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import chatApi from '../api/chat';
import { useSocket } from '../context/SocketContext';
import { useNotificationContext } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

import { useLocation } from 'react-router-dom';

const ChatPage = () => {
    const { user: currentUser } = useAuth();
    const { socket } = useSocket();
    const { refreshChatCount } = useNotificationContext();
    const location = useLocation();

    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [loading, setLoading] = useState(true);

    // Handle initial chat selection from navigation (e.g. Profile -> Message)
    useEffect(() => {
        if (!loading && location.state?.initiateChat) {
            const recipient = location.state.initiateChat;
            // Check if chat exists
            const existing = conversations.find(c =>
                c.participants.some(p => p._id === recipient._id)
            );

            if (existing) {
                setActiveChat(existing);
            } else {
                // Create temp conversation
                // Make sure participants structure matches what ChatSidebar expects (populated objects)
                // We assume 'recipient' (from UserProfile) is a user object.
                // We assume 'currentUser' is a user object.
                setActiveChat({
                    _id: null,
                    participants: [currentUser, recipient],
                    lastMessage: null,
                    unreadCounts: {}
                });
            }
            // Clear state to prevent looping? No, useEffect dep handling should be fine if we check !loading
            // Ideally clear state:
            window.history.replaceState({}, document.title)
        }
    }, [loading, location.state, conversations, currentUser]);

    // Fetch Conversations

    // Fetch Conversations
    const fetchConversations = useCallback(async () => {
        try {
            const res = await chatApi.getConversations();
            setConversations(res.data.conversations);
        } catch (err) {
            console.error("Failed to fetch chats", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Socket: Handle incoming messages to update LIST order and preview
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data) => {
            const { message, conversationId, senderId } = data;

            setConversations(prev => {
                // Check if conversation exists
                const existingIndex = prev.findIndex(c => c._id === conversationId);

                let updatedConvs = [...prev];

                if (existingIndex > -1) {
                    // Update existing
                    const conv = { ...updatedConvs[existingIndex] };
                    conv.lastMessage = {
                        text: message.text,
                        sender: senderId,
                        createdAt: message.createdAt,
                        seenBy: [senderId]
                    };

                    // Increment unread count if NOT active or if on mobile and list view
                    // Logic: If I am currently viewing this chat, don't increment unread.
                    // But ChatWindow will also mark it seen immediately.
                    // For safety, let's increment if it's NOT the active chat.

                    if (!activeChat || activeChat._id !== conversationId) {
                        // unreadCounts is an object/map
                        const myId = currentUser._id;
                        const currentCount = conv.unreadCounts[myId] || 0;
                        conv.unreadCounts = { ...conv.unreadCounts, [myId]: currentCount + 1 };

                        // Also trigger global update
                        refreshChatCount();
                    }

                    updatedConvs.splice(existingIndex, 1);
                    updatedConvs.unshift(conv); // Move to top
                } else {
                    // New conversation? If backend sent it via new_message? 
                    // Usually we should refetch or add it if we have payload.
                    // For now, let's just refetch to be safe if we don't have it.
                    fetchConversations();
                    return prev;
                }
                return updatedConvs;
            });
        };

        const handleMessageSeen = (data) => {
            // If I marked it seen (via another tab) or someone else.
            // If *I* marked it, update unread count locally
            if (data.seenByUserId === currentUser._id) {
                setConversations(prev => prev.map(c => {
                    if (c._id === data.conversationId) {
                        const myId = currentUser._id;
                        return {
                            ...c,
                            unreadCounts: { ...c.unreadCounts, [myId]: 0 }
                        };
                    }
                    return c;
                }));
                refreshChatCount();
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('message_seen', handleMessageSeen);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('message_seen', handleMessageSeen);
        };
    }, [socket, activeChat, currentUser._id, fetchConversations, refreshChatCount]);

    // Handle Chat Selection
    const handleSelectChat = (chat) => {
        setActiveChat(chat);
        // Optimistically clear unread count for this chat in the List
        setConversations(prev => prev.map(c => {
            if (c._id === chat._id) {
                return {
                    ...c,
                    unreadCounts: { ...c.unreadCounts, [currentUser._id]: 0 }
                };
            }
            return c;
        }));
        // Global refresh will happen when ChatWindow calls markSeen API, but local update feels faster
        setTimeout(refreshChatCount, 500);
    };

    // Handle message sent from ChatWindow (especially for new chats)
    const handleMessageSent = (conversation) => {
        if (!activeChat._id || activeChat._id !== conversation._id) {
            // It was a new chat (phantom)
            setConversations(prev => {
                // Remove duplicates just in case socket added it
                const filtered = prev.filter(c => c._id !== conversation._id);
                return [conversation, ...filtered];
            });
            setActiveChat(conversation);
        }
    };

    return (
        <div className="h-[calc(100vh-var(--nav-height))] md:h-[calc(100vh-var(--nav-height)-2rem)] md:py-4 md:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden flex flex-col md:flex-row md:gap-4 md:mt-4">
            {/* Mobile: Show List if no active chat, else hidden */}
            <div className={`
                md:w-[350px] w-full flex flex-col bg-white dark:bg-slate-900 md:rounded-l-2xl border-r border-slate-200 dark:border-slate-800 h-full
                ${activeChat ? 'hidden md:flex' : 'flex'}
            `}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="font-bold text-xl text-slate-800 dark:text-white">Messages</h2>
                </div>

                <ChatSidebar
                    conversations={conversations}
                    activeChatId={activeChat?._id}
                    onSelectChat={handleSelectChat}
                    loading={loading}
                />
            </div>

            {/* Chat Window */}
            <div className={`
                flex-1 bg-white dark:bg-slate-900 md:rounded-r-2xl h-full flex flex-col
                ${activeChat ? 'flex' : 'hidden md:flex'}
            `}>
                {activeChat ? (
                    <ChatWindow
                        chat={activeChat}
                        onBack={() => setActiveChat(null)}
                        onMessageSent={handleMessageSent}
                    />
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-slate-400">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        </div>
                        <p className="text-lg font-medium">Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
