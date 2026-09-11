import api from './api';

export const userService = {
  searchUsers: async (query) => {
    const response = await api.get('/users/search', { params: { q: query } });
    return response.data;
  },

  getUserProfile: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  blockUser: async (id) => {
    const response = await api.post(`/users/block/${id}`);
    return response.data;
  },

  unblockUser: async (id) => {
    const response = await api.post(`/users/unblock/${id}`);
    return response.data;
  },

  getBlockedUsers: async () => {
    const response = await api.get('/users/blocked');
    return response.data;
  },
};
