import api from './axios';

export const sendFollowRequest = async (userId) => {
    return await api.post(`/social/follow/${userId}`);
};

export const respondToFollowRequest = async (requestId, status) => {
    return await api.post(`/social/request/${requestId}/respond`, { status });
};

export const getFollowers = async (userId) => {
    return await api.get(`/social/followers/${userId}`);
};

export const getFollowing = async (userId) => {
    return await api.get(`/social/following/${userId}`);
};

export const getFollowStatus = async (userId) => {
    return await api.get(`/social/status/${userId}`);
};

export const unfollowUser = async (userId) => {
    return await api.post(`/social/follow/${userId}/unfollow`);
};

export const removeFollower = async (userId) => {
    return await api.post(`/social/followers/${userId}/remove`);
};

export default {
    sendFollowRequest,
    respondToFollowRequest,
    getFollowers,
    getFollowing,
    getFollowStatus,
    unfollowUser,
    removeFollower
};
