import axios from '../api/axios';

const taskAPI = {
    getProjectTasks: (projectId) => axios.get(`/tasks/project/${projectId}`),
    createTask: (data) => axios.post('/tasks', data),
    updateTask: (id, data) => axios.patch(`/tasks/${id}`, data),
    deleteTask: (id) => axios.delete(`/tasks/${id}`),
};

export default taskAPI;
