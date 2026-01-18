import axios from './axios';

const userAPI = {
    searchUsers: async (query) => {
        const response = await axios.get(`/users/search?query=${query}`);
        return response.data;
    },
    getUserProfile: async (id) => {
        const response = await axios.get(`/users/${id}/profile`);
        return response.data;
    },
    updateProfile: async (formData) => {
        const response = await axios.put('/users/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};

export default userAPI;
