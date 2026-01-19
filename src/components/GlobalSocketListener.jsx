import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';

const GlobalSocketListener = () => {
    const { socket } = useSocket();
    const { updateUser, user } = useAuth();

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

        // Listen for events that change user state (followers, following, etc.)
        socket.on('follow_update', handleUserUpdate);

        // Also listen for generic user_updated event if we implement it later
        socket.on('user_updated', handleUserUpdate);

        // Listen for GitHub setting updates
        socket.on('github_update', handleUserUpdate);

        return () => {
            socket.off('follow_update', handleUserUpdate);
            socket.off('user_updated', handleUserUpdate);
            socket.off('github_update', handleUserUpdate);
        };
    }, [socket, user, updateUser]);

    return null; // Render nothing
};

export default GlobalSocketListener;
