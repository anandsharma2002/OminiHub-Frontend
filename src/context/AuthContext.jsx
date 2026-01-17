import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await authAPI.getMe();
                    if (res.status === 'success') {
                        setUser(res.data.user);
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    console.error("Failed to load user", error);
                    localStorage.removeItem('token');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    // Login Action
    const login = async (credentials) => {
        setLoading(true);
        try {
            const data = await authAPI.login(credentials);
            localStorage.setItem('token', data.token);
            setIsAuthenticated(true);
            setUser(data.data.user); // data.data.user because of API response structure
            return data;
        } catch (error) {
            console.error('Login error:', error.response?.data?.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Signup Action
    const signup = async (username, email, password, firstName, lastName) => {
        try {
            const res = await authAPI.signup({ username, email, password, firstName, lastName });
            // Signup now sends email, does not login immediately
            return { success: true, message: res.message };
        } catch (error) {
            throw error; // Let component handle error
        }
    };

    // Verify Email Action
    const verifyEmail = async (email, code) => {
        try {
            const res = await authAPI.verifyEmail({ email, code });
            if (res.token) {
                localStorage.setItem('token', res.token);
                setUser(res.data.user);
                setIsAuthenticated(true);
                return { success: true };
            }
        } catch (error) {
            throw error;
        }
    };

    // Logout Action
    const logout = () => {
        authAPI.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated,
            login,
            signup,
            verifyEmail,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
