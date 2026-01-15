import api from './axios';

export const authAPI = {
    signup: async (userData) => {
        const response = await api.post('/auth/signup', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    verifyEmail: async (data) => {
        const response = await api.post('/auth/verify-email', data);
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgotpassword', { email });
        return response.data;
    },

    resetPassword: async (data) => {
        const response = await api.put('/auth/resetpassword', data);
        return response.data;
    },

    changePassword: async (data) => {
        const response = await api.put('/auth/changepassword', data);
        return response.data;
    },

    logout: () => {
        // Client-side logout only (since we use JWT in cookie/localstorage)
        localStorage.removeItem('token');
    }
};
