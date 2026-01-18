import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import useAuth from '../hooks/useAuth';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user, token } = useAuth(); // Assuming useAuth exposes the token
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (token) {
            // Determine backend URL from env, removing '/api' suffix if present because Socket.io connects to the root
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const backendUrl = apiUrl.replace('/api', '');

            const newSocket = io(backendUrl, {
                auth: { token },
                // query: { token }, // Fallback
                reconnection: true,
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            // If no token (logged out), allow socket to be null or disconnect existing
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
