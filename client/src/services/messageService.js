import api from './api';

export const messageService = {
  getMessages: async (chatId, before = null, limit = 30) => {
    const params = { limit };
    if (before) params.before = before;
    const response = await api.get(`/messages/${chatId}`, { params });
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  markAsRead: async (chatId) => {
    const response = await api.put(`/messages/${chatId}/read`);
    return response.data;
  },

  editMessage: async (id, content) => {
    const response = await api.put(`/messages/${id}`, { content });
    return response.data;
  },

  deleteMessage: async (id) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },

  reactToMessage: async (id, emoji) => {
    const response = await api.post(`/messages/${id}/react`, { emoji });
    return response.data;
  },

  searchMessages: async (chatId, query) => {
    const response = await api.get(`/messages/${chatId}/search`, { params: { q: query } });
    return response.data;
  },
};
