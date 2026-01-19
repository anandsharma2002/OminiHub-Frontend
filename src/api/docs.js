import axios from './axios';

const uploadDocument = async (formData) => {
    try {
        const response = await axios.post('/docs', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Upload failed';
    }
};

const getDocuments = async (userId) => {
    try {
        const response = await axios.get('/docs', {
            params: {
                userId,
                t: Date.now() // Bypass cache
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch documents';
    }
};

const deleteDocument = async (id) => {
    try {
        await axios.delete(`/docs/${id}`);
    } catch (error) {
        throw error.response?.data?.message || 'Delete failed';
    }
};

const updateDocument = async (id, data) => {
    try {
        const response = await axios.put(`/docs/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Update failed';
    }
};

const downloadDocument = async (id) => {
    try {
        const response = await axios.get(`/docs/${id}/download`);
        // Return the signed URL
        return response.data.downloadUrl;
    } catch (error) {
        throw error.response?.data?.message || 'Download failed';
    }
};

export default {
    uploadDocument,
    getDocuments,
    deleteDocument,
    updateDocument,
    downloadDocument
};
