import api from './api';

export const chatService = {
  fetchChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },

  accessChat: async (userId) => {
    const response = await api.post('/chats', { userId });
    return response.data;
  },

  getChatById: async (chatId) => {
    const response = await api.get(`/chats/${chatId}`);
    return response.data;
  },
};
