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

    logout: () => {
        // Client-side logout only (since we use JWT in cookie/localstorage)
        localStorage.removeItem('token');
    }
};
