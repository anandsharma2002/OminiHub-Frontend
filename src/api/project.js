import axios from '../api/axios';

const projectAPI = {
    // Projects
    getProjects: () => axios.get('/projects'),
    getProjectsProgress: () => axios.get('/projects/progress'),
    getProjectProgress: (id) => axios.get(`/projects/${id}/progress`),
    getProject: (id) => axios.get(`/projects/${id}`),
    createProject: (data) => axios.post('/projects', data),
    updateProject: (id, data) => axios.put(`/projects/${id}`, data),
    deleteProject: (id) => axios.delete(`/projects/${id}`),

    // Invitations
    inviteUser: (id, userId) => axios.post(`/projects/${id}/invite`, { userId }),
    getInvitations: () => axios.get('/projects/invitations'),
    respondToInvitation: (projectId, status) => axios.post('/projects/invitations/respond', { projectId, status }),
    removeContributor: (projectId, userId) => axios.delete('/projects/contributors', { data: { projectId, userId } }),
};

export default projectAPI;
