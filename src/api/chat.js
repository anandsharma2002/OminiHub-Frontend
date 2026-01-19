import axios from './axios';

const getConversations = async () => {
    try {
        const response = await axios.get('/chat/conversations');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch conversations';
    }
};

const getMessages = async (conversationId) => {
    try {
        const response = await axios.get(`/chat/${conversationId}/messages`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch messages';
    }
};

const sendMessage = async (data) => {
    try {
        const response = await axios.post('/chat/message', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to send message';
    }
};

const markSeen = async (conversationId) => {
    try {
        const response = await axios.put(`/chat/${conversationId}/seen`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to mark seen';
    }
};

const getUnreadCount = async () => {
    try {
        const response = await axios.get('/chat/unread-count');
        return response.data.data.count;
    } catch (error) {
        // Fail silently
        return 0;
    }
};

export default {
    getConversations,
    getMessages,
    sendMessage,
    markSeen,
    getUnreadCount
};
