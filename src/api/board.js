import axios from '../api/axios';

const boardAPI = {
    getBoard: (projectId) => axios.get(`/board/${projectId}`),
    createColumn: (data) => axios.post('/board/column', data),
    createTicket: (data) => axios.post('/board/ticket', data),
    moveTicket: (data) => axios.patch('/board/ticket/move', data),
    moveColumn: (data) => axios.patch('/board/column/move', data),
    deleteTicket: (ticketId) => axios.delete(`/board/ticket/${ticketId}`),
    deleteColumn: (columnId) => axios.delete(`/board/column/${columnId}`),
};

export default boardAPI;
