import api from './api';

export const groupService = {
  createGroup: async (groupData) => {
    const response = await api.post('/groups', groupData);
    return response.data;
  },

  updateGroup: async (id, data) => {
    const response = await api.put(`/groups/${id}`, data);
    return response.data;
  },

  addMembers: async (id, userIds) => {
    const response = await api.post(`/groups/${id}/members`, { userIds });
    return response.data;
  },

  removeMember: async (id, userId) => {
    const response = await api.delete(`/groups/${id}/members/${userId}`);
    return response.data;
  },

  promoteAdmin: async (id, userId) => {
    const response = await api.put(`/groups/${id}/admins/${userId}`);
    return response.data;
  },

  demoteAdmin: async (id, userId) => {
    const response = await api.delete(`/groups/${id}/admins/${userId}`);
    return response.data;
  },

  generateInviteLink: async (id) => {
    const response = await api.post(`/groups/${id}/invite-link`);
    return response.data;
  },

  revokeInviteLink: async (id) => {
    const response = await api.delete(`/groups/${id}/invite-link`);
    return response.data;
  },

  getGroupByInvite: async (token) => {
    const response = await api.get(`/groups/invite/${token}`);
    return response.data;
  },

  joinGroupByInvite: async (token) => {
    const response = await api.post(`/groups/invite/${token}/join`);
    return response.data;
  },
};
