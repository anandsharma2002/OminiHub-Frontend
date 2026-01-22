import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSmile, FaArrowLeft, FaEllipsisV, FaTrash } from 'react-icons/fa';
import chatApi from '../../api/chat';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import MessageBubble from './MessageBubble';
import EmojiPicker from 'emoji-picker-react';

const ChatWindow = ({ chat, onBack, onMessageSent, onDelete }) => {
    const { user: currentUser } = useAuth();
    const { socket } = useSocket();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const [showEmoji, setShowEmoji] = useState(false);

    const onEmojiClick = (emojiObject) => {
        setInput(prev => prev + emojiObject.emoji);
        setShowEmoji(false);
    };

    // Identify other participant
    const otherParticipant = chat.participants.find(p => p._id !== currentUser._id) || chat.participants[0];

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch Messages
    useEffect(() => {
        const fetchMessages = async () => {
            if (!chat._id) return;
            setLoading(true);
            try {
                const res = await chatApi.getMessages(chat._id);
                setMessages(res.data.messages);

                // Mark as seen immediately
                await chatApi.markSeen(chat._id);

            } catch (err) {
                console.error("Failed to load messages", err);
            } finally {
                setLoading(false);
                setTimeout(scrollToBottom, 100);
            }
        };

        fetchMessages();
        setInput('');
    }, [chat._id]);

    // Auto-scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Socket Listeners
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data) => {
            if (data.conversationId === chat._id) {
                setMessages(prev => [...prev, data.message]);

                // Mark seen if window is active
                chatApi.markSeen(chat._id);
            }
        };

        const handleTypingUpdate = (data) => {
            if (data.conversationId === chat._id && data.userId !== currentUser._id) {
                if (data.isTyping) {
                    setTypingUser(otherParticipant.firstName);
                } else {
                    setTypingUser(null);
                }
            }
        };

        const handleMessageSeen = (data) => {
            if (data.conversationId === chat._id) {
                // Update local messages seen status
                setMessages(prev => prev.map(msg => {
                    if (!msg.seenBy.includes(data.seenByUserId)) {
                        return { ...msg, seenBy: [...msg.seenBy, data.seenByUserId] };
                    }
                    return msg;
                }));
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('typing_update', handleTypingUpdate);
        socket.on('message_seen', handleMessageSeen);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('typing_update', handleTypingUpdate);
            socket.off('message_seen', handleMessageSeen);
        };
    }, [socket, chat._id, currentUser._id, otherParticipant]);

    // Typing Emitter
    const handleInputChange = (e) => {
        setInput(e.target.value);

        if (!socket) return;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing_start', { conversationId: chat._id, recipientId: otherParticipant._id });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Set new timeout to stop typing after 2s of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit('typing_stop', { conversationId: chat._id, recipientId: otherParticipant._id });
        }, 2000);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const text = input.trim();
        setInput('');

        // Stop typing immediately
        setIsTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket?.emit('typing_stop', { conversationId: chat._id, recipientId: otherParticipant._id });

        try {
            // Optimistic Update? No, let's wait for server response to be safe, 
            // or rely on socket 'new_message' to self?
            // Controller emits to sender too. So let's just wait.
            // Actually, for instant feel, we might want local append.
            // But controller emits 'new_message' to sender. So we will get it in handleNewMessage.
            // However, sending might take a ms.

            const res = await chatApi.sendMessage({
                conversationId: chat._id,
                text,
                recipientId: otherParticipant._id
            });

            onMessageSent && onMessageSent(res.data.conversation);

        } catch (err) {
            console.error("Failed to send", err);
            // Provide feedback
        }
    };

    // Calculate "Seen" for the VERY LAST message only
    // If the last message is mine, and seenBy includes otherParticipant
    const lastMessage = messages[messages.length - 1];
    const showSeen = lastMessage &&
        lastMessage.sender === currentUser._id &&
        lastMessage.seenBy.includes(otherParticipant._id);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 md:rounded-r-2xl relative">
            {/* Header */}
            <div className="h-[60px] border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between">
                <div className="flex items-center space-x-3">
                    <button onClick={onBack} className="md:hidden text-slate-500 mr-2">
                        <FaArrowLeft />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        {otherParticipant.profile?.image && otherParticipant.profile.image !== 'default.jpg' ? (
                            <img src={otherParticipant.profile.image} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                                {otherParticipant.username?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                            {otherParticipant.firstName} {otherParticipant.lastName}
                        </h3>
                        <p className="text-xs text-slate-500">
                            @{otherParticipant.username}
                        </p>
                    </div>
                </div>
                {/* Options */}
                {chat._id && (
                    <button
                        onClick={() => onDelete(chat._id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Chat"
                    >
                        <FaTrash />
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 dark:bg-slate-900/50">
                {loading ? (
                    <div className="flex justify-center mt-10">
                        <div className="loader">Loading...</div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <p>No messages yet.</p>
                        <p className="text-sm">Say hello!</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => (
                            <MessageBubble
                                key={msg._id}
                                message={msg}
                                isMine={msg.sender === currentUser._id}
                                isLast={idx === messages.length - 1}
                                seenText={idx === messages.length - 1 && showSeen ? "Seen" : null}
                            />
                        ))}
                        {typingUser && (
                            <div className="flex justify-start mb-2 animate-pulse">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none py-3 px-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-1">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900 relative">
                {showEmoji && (
                    <div className="absolute bottom-16 left-4 z-50 shadow-xl">
                        <EmojiPicker onEmojiClick={onEmojiClick} theme="auto" />
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setShowEmoji(!showEmoji)}
                    className="text-slate-400 hover:text-violet-500 p-2 transition-colors"
                >
                    <FaSmile className="text-xl" />
                </button>
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Message..."
                        className="w-full pl-4 pr-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-violet-500/50 dark:text-white placeholder-slate-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-3 rounded-full bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
