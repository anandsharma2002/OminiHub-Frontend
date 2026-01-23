import React from 'react';

const AIChatButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-lg shadow-violet-500/40 text-white flex items-center justify-center border border-white/20 backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
            aria-label="Open AI Chat"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
            >
                <path d="M12 2a2 2 0 0 1 2 2c0 2.32 1.35 4.35 3.5 5.5a2 2 0 0 1 0 3.5c-2.15 1.15-3.5 3.18-3.5 5.5a2 2 0 0 1-4 0c0-2.32-1.35-4.35-3.5-5.5a2 2 0 0 1 0-3.5C8.65 6.35 10 4.32 10 4a2 2 0 0 1 2-2z" />
                <path d="M19 13v6" />
                <path d="M22 16h-6" />
            </svg>
        </button>
    );
};

export default AIChatButton;
