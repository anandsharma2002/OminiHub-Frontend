import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getNotifications, markAsRead, markAllAsRead as apiMarkAllAsRead } from '../api/notification';
import chatApi from '../api/chat';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);
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

    const fetchChatUnreadCount = useCallback(async () => {
        try {
            const count = await chatApi.getUnreadCount();
            setChatUnreadCount(count);
        } catch (error) {
            console.error("Failed to fetch chat unread count", error);
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

    const markAllRead = async () => {
        try {
            await apiMarkAllAsRead(); // Renamed import needed? No, I will import it.
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    // Initial Fetch
    useEffect(() => {
        fetchNotifications();
        fetchChatUnreadCount();
    }, [fetchNotifications, fetchChatUnreadCount]);

    // Socket Listener
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (newNotification) => {
            console.log('[NotificationContext] Received new_notification:', newNotification);
            // Add new notification to top of list
            setNotifications(prev => [newNotification, ...prev]);
            // Increment unread count
            setUnreadCount(prev => prev + 1);
        };

        const handleNotificationUpdate = (data) => {
            console.log('[NotificationContext] Received notification_update:', data);
            if (data.type === 'chat') {
                fetchChatUnreadCount();
            }
        };

        console.log('[NotificationContext] Setting up socket listener for new_notification');
        socket.on('new_notification', handleNewNotification);
        socket.on('notification_update', handleNotificationUpdate);

        return () => {
            console.log('[NotificationContext] Cleaning up socket listener');
            socket.off('new_notification', handleNewNotification);
            socket.off('notification_update', handleNotificationUpdate);
        };
    }, [socket, fetchChatUnreadCount]);

    const value = {
        notifications,
        unreadCount,
        chatUnreadCount,
        loading,
        markRead,
        markAllRead,
        refreshNotifications: fetchNotifications,
        refreshChatCount: fetchChatUnreadCount
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
