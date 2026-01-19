import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ChatSidebar = ({ conversations, activeChatId, onSelectChat, loading }) => {
    const { user: currentUser } = useAuth();

    if (loading) {
        return (
            <div className="flex-1 p-4 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <p>No conversations yet.</p>
                <p className="text-sm mt-2">Visit a profile to start chatting!</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations.map(conv => {
                // Determine the "Other" participant
                const otherParticipant = conv.participants.find(p => p._id !== currentUser._id) || conv.participants[0];
                const isActive = activeChatId === conv._id;

                // Unread Count logic
                // conversation.unreadCounts is a Map/Object
                const unread = conv.unreadCounts ? (conv.unreadCounts[currentUser._id] || 0) : 0;

                // Last Message Preview
                const lastMsgText = conv.lastMessage?.text || 'No messages';
                const isLastMsgMine = conv.lastMessage?.sender === currentUser._id;
                const preview = isLastMsgMine ? `You: ${lastMsgText}` : lastMsgText;

                return (
                    <div
                        key={conv._id}
                        onClick={() => onSelectChat(conv)}
                        className={`
                            flex items-center space-x-3 p-4 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800
                            ${isActive
                                ? 'bg-violet-50 dark:bg-violet-900/20 border-r-4 border-r-violet-500'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                            }
                        `}
                    >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                                {otherParticipant.profile?.image && otherParticipant.profile.image !== 'default.jpg' ? (
                                    <img src={otherParticipant.profile.image} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-lg">
                                        {otherParticipant.username?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {/* Online Status (Mock for now, or use socket presence if available) */}
                            {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div> */}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className={`text-sm font-semibold truncate ${unread > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {otherParticipant.firstName} {otherParticipant.lastName}
                                </h3>
                                {conv.lastMessage?.createdAt && (
                                    <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <p className={`text-xs truncate max-w-[80%] ${unread > 0 ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                    {preview}
                                </p>
                                {unread > 0 && (
                                    <span className="bg-violet-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                        {unread}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatSidebar;
