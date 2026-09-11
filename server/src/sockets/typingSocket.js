export const setupTypingSocket = (io, socket) => {
  // Client indicates they are typing in a chat
  socket.on('typing', ({ chatId, userId, userName }) => {
    if (!chatId || !userId) return;
    socket.to(chatId).emit('userTyping', { chatId, userId, userName });
  });

  // Client indicates they stopped typing
  socket.on('stopTyping', ({ chatId, userId }) => {
    if (!chatId || !userId) return;
    socket.to(chatId).emit('userStoppedTyping', { chatId, userId });
  });
};
