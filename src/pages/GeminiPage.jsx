import React, { useState, useEffect } from 'react';
import GeminiSidebar from '../components/gemini/GeminiSidebar';
import GeminiChatWindow from '../components/gemini/GeminiChatWindow';
import geminiApi from '../api/gemini';
import { toast } from 'react-hot-toast';

const GeminiPage = () => {
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [loadingResponse, setLoadingResponse] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Initial load
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoadingHistory(true);
            const res = await geminiApi.getHistory();
            setChats(res.data);

            // If we have chats, select the most recent one
            if (res.data.length > 0 && !activeChat) {
                // setActiveChat(res.data[0]); // Optional: Determine if we want to auto-open
            }
        } catch (error) {
            console.error("History Error", error);
            toast.error("Failed to load history");
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleNewChat = () => {
        setActiveChat(null); // Null active chat implies "New Chat" state visually, or we create one immediately
        // Actually, user wants to see a fresh window. 
        // We can create a temporary chat object
        const tempChat = {
            _id: null, // No ID yet
            history: [],
            title: 'New Conversation'
        };
        setActiveChat(tempChat);
    };

    const handleSelectChat = (chat) => {
        setActiveChat(chat);
    };

    const handleDeleteChat = async (chatId) => {
        if (!window.confirm("Delete this chat?")) return;
        try {
            await geminiApi.deleteChat(chatId);
            setChats(prev => prev.filter(c => c._id !== chatId));
            if (activeChat?._id === chatId) {
                setActiveChat(null);
            }
            toast.success("Chat deleted");
        } catch (error) {
            toast.error("Failed to delete chat");
        }
    };

    const handleSendMessage = async (text) => {
        setLoadingResponse(true);

        // Optimistic Update
        const newMessage = { role: 'user', parts: [{ text }] };
        const tempChatState = activeChat
            ? { ...activeChat, history: [...activeChat.history, newMessage] }
            : { _id: null, history: [newMessage], title: 'New Chat' };

        setActiveChat(tempChatState);

        try {
            const chatId = activeChat?._id;
            const res = await geminiApi.sendMessage(text, chatId); // returns { response, chatId, history }

            // Backend returns full history, so we update with that
            const updatedChat = {
                _id: res.data.chatId,
                history: res.data.history,
                title: activeChat?.title === 'New Conversation' ? text.substring(0, 20) : activeChat?.title
            };

            setActiveChat(updatedChat);

            // Update list state
            setChats(prev => {
                const existing = prev.find(c => c._id === res.data.chatId);
                if (existing) {
                    // Update and move to top
                    const others = prev.filter(c => c._id !== res.data.chatId);
                    return [updatedChat, ...others];
                } else {
                    // Add new
                    return [updatedChat, ...prev];
                }
            });

        } catch (error) {
            console.error("Send Error", error);
            toast.error(error.response?.data?.message || "Failed to send message");
            // Revert optimistic update? Or just show error
        } finally {
            setLoadingResponse(false);
        }
    };

    return (
        <div className="h-[calc(100vh-var(--nav-height))] flex overflow-hidden">
            <div className="hidden md:block h-full">
                <GeminiSidebar
                    chats={chats}
                    activeChatId={activeChat?._id}
                    onSelectChat={handleSelectChat}
                    onNewChat={handleNewChat}
                    onDeleteChat={handleDeleteChat}
                />
            </div>

            {/* Mobile Drawer could go here, but for now simple layout */}

            <div className="flex-1 flex flex-col h-full w-full">
                <GeminiChatWindow
                    chat={activeChat}
                    onSendMessage={handleSendMessage}
                    loadingResponse={loadingResponse}
                />
            </div>
        </div>
    );
};

export default GeminiPage;
