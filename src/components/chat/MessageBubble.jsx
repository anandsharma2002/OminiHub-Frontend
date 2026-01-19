import React from 'react';
import { useAuth } from '../../context/AuthContext';

const MessageBubble = ({ message, isMine, isLast, seenText }) => {
    const { user } = useAuth();

    // Format Time
    const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-2 group`}>
            <div
                className={`
                    max-w-[70%] px-4 py-2 rounded-2xl text-sm break-words relative shadow-sm
                    ${isMine
                        ? 'bg-violet-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                    }
                `}
            >
                {message.text}

                {/* Time Tooltip on Hover */}
                <div className={`
                    opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 
                    ${isMine ? 'right-full mr-2' : 'left-full ml-2'}
                    text-[10px] text-slate-400 whitespace-nowrap bg-slate-900/80 px-2 py-1 rounded
                `}>
                    {time}
                </div>
            </div>

            {/* Seen Indicator (Only for my messages, if passed) */}
            {isMine && isLast && seenText && (
                <span className="text-[10px] text-slate-400 mt-1 font-medium">{seenText}</span>
            )}
        </div>
    );
};

export default MessageBubble;
