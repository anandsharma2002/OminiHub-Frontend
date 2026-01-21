import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaPaperPlane, FaRobot, FaUser, FaSpinner } from 'react-icons/fa';

const GeminiChatWindow = ({ chat, onSendMessage, loadingResponse }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat?.history, loadingResponse]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || loadingResponse) return;
        onSendMessage(input);
        setInput('');
    };

    if (!chat) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400">
                <div className="w-20 h-20 bg-violet-100 dark:bg-violet-900/20 rounded-full flex items-center justify-center mb-6">
                    <FaRobot className="text-violet-500 w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">OmniHub AI Assistant</h3>
                <p className="max-w-md text-center">
                    Select a conversation or start a new one to chat with Gemini.
                    I can help you manage projects, tasks, and more!
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#0f172a] relative">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
                {chat.history.map((msg, index) => {
                    const isModel = msg.role === 'model';
                    return (
                        <div key={index} className={`flex gap-4 ${isModel ? 'justify-start' : 'justify-end'}`}>
                            {isModel && (
                                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-1">
                                    <FaRobot className="text-white text-sm" />
                                </div>
                            )}

                            <div className={`
                                max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm
                                ${isModel
                                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                                    : 'bg-violet-600 text-white rounded-tr-none'
                                }
                            `}>
                                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                    {msg.parts.map((part, i) => (
                                        <ReactMarkdown key={i}>{part.text}</ReactMarkdown>
                                    ))}
                                </div>
                            </div>

                            {!isModel && (
                                <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                                    <FaUser className="text-slate-600 dark:text-slate-300 text-sm" />
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Loading Indicator */}
                {loadingResponse && (
                    <div className="flex gap-4 justify-start">
                        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-1">
                            <FaRobot className="text-white text-sm" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-5 py-4 border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-4xl mx-auto bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-violet-500 transition-all shadow-sm">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message Gemini..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white resize-none max-h-32 py-3 px-2 custom-scrollbar focus:outline-none"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loadingResponse}
                        className={`p-3 rounded-lg mb-0.5 transition-all flex-shrink-0 ${!input.trim() || loadingResponse
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-violet-600 hover:bg-violet-700 text-white shadow-md active:scale-95'
                            }`}
                    >
                        {loadingResponse ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                    </button>
                </form>
                <div className="text-center mt-2 text-xs text-slate-400">
                    Gemini can make mistakes. Consider checking important information.
                </div>
            </div>
        </div>
    );
};

export default GeminiChatWindow;
