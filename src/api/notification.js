import api from './axios';

export const getNotifications = async () => {
    return await api.get('/notifications');
};

export const markAsRead = async (id) => {
    return await api.put(`/notifications/${id}/read`);
};

export const markAllAsRead = async () => {
    return await api.put('/notifications/read-all');
};

export default {
    getNotifications,
    markAsRead,
    markAllAsRead
};
