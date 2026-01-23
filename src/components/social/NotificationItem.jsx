import React, { useState } from 'react';
import { FaUser, FaCheck, FaTimes } from 'react-icons/fa';
import projectAPI from '../../api/project';
import { respondToFollowRequest } from '../../api/social';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '../../context/ToastContext';

const NotificationItem = ({ notification, onMarkRead }) => {
    const { sender, type, message, createdAt, isRead, relatedId, _id, metadata } = notification;

    const [processed, setProcessed] = useState(false);
    const { error: toastError } = useToast();

    const handleAction = async (status) => {
        try {
            if (type === 'follow_request') {
                await respondToFollowRequest(relatedId, status);
            } else if (type === 'project_invite') {
                const projectId = metadata?.projectId;
                if (!projectId) throw new Error("Invalid project invitation");
                // Status for project is 'Accepted' or 'Ignored' (Sentence Case usually, but checking backend)
                // Backend expects 'Accepted' or 'Ignored'. Frontend buttons usually say 'accept'/'reject'
                const apiStatus = status === 'accepted' ? 'Accepted' : 'Ignored';
                await projectAPI.respondToInvitation(projectId, apiStatus);
            }

            setProcessed(true); // Hide buttons locally
            if (!isRead) onMarkRead(_id); // Also mark read if not already
        } catch (err) {
            console.error("Failed to respond:", err);
            const msg = err.response?.data?.message || "Failed to process request";
            toastError(msg);

            // If already processed/invalid, hide buttons
            if (msg.includes("already") || msg.includes("not found")) {
                setProcessed(true);
                if (!isRead) onMarkRead(_id);
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

                {/* Actions for Follow Request OR Project Invite */}
                {(type === 'follow_request' || type === 'project_invite') && !processed && (
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
