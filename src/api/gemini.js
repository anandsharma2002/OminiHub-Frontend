import axios from './axios'; // Using configured axios instance from project

const geminiApi = {
    // Send message and get AI response (plus function call handling done in backend)
    // Send message and get AI response (plus function call handling done in backend)
    sendMessage: async (message, chatId) => {
        return axios.post('/gemini/chat', { message, chatId });
    },

    // Get chat history
    getHistory: async () => {
        return axios.get('/gemini/history');
    },

    // Delete a chat
    deleteChat: async (chatId) => {
        return axios.delete(`/gemini/history/${chatId}`);
    }
};

export default geminiApi;
