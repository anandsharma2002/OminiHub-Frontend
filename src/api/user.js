import axios from './axios';

const userAPI = {
    searchUsers: async (query) => {
        const response = await axios.get(`/users/search?query=${query}`);
        return response.data;
    },
    getUserProfile: async (id) => {
        const response = await axios.get(`/users/${id}/profile`);
        return response.data;
    }
};

export default userAPI;
