import React from 'react';
import { FaUser, FaCheck, FaTimes } from 'react-icons/fa';
import { respondToFollowRequest } from '../../api/social';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification, onMarkRead }) => {
    const { sender, type, message, createdAt, isRead, relatedId, _id } = notification;

    const handleAction = async (status) => {
        try {
            await respondToFollowRequest(relatedId, status);
            // After responding, mark as read to hide buttons (logic in render uses !isRead)
            onMarkRead(_id);
        } catch (err) {
            console.error("Failed to respond:", err);
            if (err.response && (err.response.status === 404 || err.response.status === 400)) {
                // Request no longer exists or already processed
                alert(err.response.data.message || "Request no longer valid");
                onMarkRead(_id); // Remove buttons
            } else {
                alert("Failed to process request. Please try again.");
            }
        }
    };

    return (
        <div
            className={`
                p-4 border-b border-slate-100 dark:border-slate-800 flex items-start space-x-4
                ${isRead ? 'bg-transparent' : 'bg-violet-50/50 dark:bg-violet-900/10'}
                cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors
            `}
            onClick={() => !isRead && onMarkRead(_id)}
        >
            {/* Avatar */}
            <div className="shrink-0">
                {sender?.profile?.image ? (
                    <img
                        src={sender.profile.image}
                        alt={sender.username}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                        <FaUser />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 dark:text-white font-medium">
                    {sender?.firstName || sender?.username}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {message}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </p>

                {/* Actions for Follow Request */}
                {type === 'follow_request' && !isRead && (
                    <div className="flex items-center space-x-3 mt-3" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => handleAction('accepted')}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 transition-colors"
                        >
                            <FaCheck /> <span>Accept</span>
                        </button>
                        <button
                            onClick={() => handleAction('rejected')}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            <FaTimes /> <span>Ignore</span>
                        </button>
                    </div>
                )}
            </div>

            {!isRead && (
                <div className="shrink-0 w-2 h-2 rounded-full bg-violet-600 mt-2"></div>
            )}
        </div>
    );
};

export default NotificationItem;
