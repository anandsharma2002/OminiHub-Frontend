import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getNotifications, markAsRead } from '../api/notification';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await getNotifications();
            if (res.data.status === 'success') {
                setNotifications(res.data.data); // data is the list itself
                setUnreadCount(res.data.unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const markRead = async (id) => {
        try {
            await markAsRead(id);
            // Update local state
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    // Initial Fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Socket Listener
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (newNotification) => {
            // Add new notification to top of list
            setNotifications(prev => [newNotification, ...prev]);
            // Increment unread count
            setUnreadCount(prev => prev + 1);
        };

        socket.on('new_notification', handleNewNotification);

        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket]);

    const value = {
        notifications,
        unreadCount,
        loading,
        markRead,
        refreshNotifications: fetchNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    return useContext(NotificationContext);
};
