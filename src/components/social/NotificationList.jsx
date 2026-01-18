import React, { useEffect } from 'react';
import NotificationItem from './NotificationItem';
import useNotifications from '../../hooks/useNotifications';
import { FaBell } from 'react-icons/fa';

const NotificationList = () => {
    const { notifications, loading, error, markRead, refreshNotifications } = useNotifications();

    if (loading && notifications.length === 0) {
        return <div className="p-4 text-center text-slate-500">Loading notifications...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">Failed to load notifications</div>;
    }

    if (notifications.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <FaBell className="text-xl" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">No notifications yet</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {notifications.map(notification => (
                <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkRead={markRead}
                />
            ))}
        </div>
    );
};

export default NotificationList;
