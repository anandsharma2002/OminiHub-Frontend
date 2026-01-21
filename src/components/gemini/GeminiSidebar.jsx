import React from 'react';
import { FaTrash, FaPlus, FaCommentAlt } from 'react-icons/fa';

const GeminiSidebar = ({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat }) => {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-full md:w-80">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="text-violet-600">✨</span> Gemini AI
                </h2>
                <button
                    onClick={onNewChat}
                    className="p-2 bg-violet-50 text-violet-600 rounded-full hover:bg-violet-100 transition-colors"
                    title="New Chat"
                >
                    <FaPlus size={14} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {chats.length === 0 ? (
                    <div className="text-center text-slate-400 mt-10 text-sm">
                        No history yet.<br />Start a new chat!
                    </div>
                ) : (
                    chats.map(chat => (
                        <div
                            key={chat._id}
                            className={`
                                group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all
                                ${activeChatId === chat._id
                                    ? 'bg-violet-50 dark:bg-violet-900/20 border-l-4 border-violet-500'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-transparent'
                                }
                            `}
                            onClick={() => onSelectChat(chat)}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <FaCommentAlt className={`flex-shrink-0 ${activeChatId === chat._id ? 'text-violet-500' : 'text-slate-400'}`} size={14} />
                                <div className="flex flex-col overflow-hidden">
                                    <span className={`text-sm font-medium truncate ${activeChatId === chat._id ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {chat.title || 'New Conversation'}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {new Date(chat.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteChat(chat._id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all"
                                title="Delete Chat"
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GeminiSidebar;
