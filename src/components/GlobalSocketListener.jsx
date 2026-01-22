import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';

const GlobalSocketListener = () => {
    const { socket } = useSocket();
    const { updateUser, user } = useAuth();

    const [toast, setToast] = React.useState(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    useEffect(() => {
        if (!socket || !user) return;

        const handleUserUpdate = async () => {
            console.log("[GlobalSocketListener] Refreshing user data...");
            try {
                const res = await authAPI.getMe();
                if (res.status === 'success') {
                    updateUser(res.data.user);
                }
            } catch (err) {
                console.error("Failed to refresh user data", err);
            }
        };

        const handleNewNotification = (notification) => {
            console.log("[GlobalSocketListener] New Notification:", notification);
            // Show Toast
            setToast({
                message: notification.message || "New Notification",
                type: notification.type
            });
            // Update User Data (e.g. unread counts if we had them, or just to be safe)
            handleUserUpdate();
        };

        // Listen for events that change user state (followers, following, etc.)
        socket.on('follow_update', handleUserUpdate);

        // Listen for generic user_updated event
        socket.on('user_updated', handleUserUpdate);

        // Listen for GitHub setting updates
        socket.on('github_update', handleUserUpdate);

        // Listen for New Notifications
        socket.on('new_notification', handleNewNotification);

        return () => {
            socket.off('follow_update', handleUserUpdate);
            socket.off('user_updated', handleUserUpdate);
            socket.off('github_update', handleUserUpdate);
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket, user, updateUser]);

    if (!toast) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-bounce-in-up">
            <div className="bg-white dark:bg-slate-800 border-l-4 border-violet-500 shadow-xl rounded-r-lg p-4 flex items-center pr-8 max-w-sm">
                <div className="mr-3 text-violet-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                </div>
                <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Notification</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{toast.message}</p>
                </div>
                <button
                    onClick={() => setToast(null)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>
    );
};

export default GlobalSocketListener;
