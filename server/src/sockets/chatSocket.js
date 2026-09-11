import Message from '../models/Message.js';
import Notification from '../models/Notification.js';

export const setupChatSocket = (io, socket) => {
  // Join a specific chat room
  socket.on('joinChat', (chatId) => {
    if (!chatId) return;
    socket.join(chatId);
  });

  // Leave a specific chat room
  socket.on('leaveChat', (chatId) => {
    if (!chatId) return;
    socket.leave(chatId);
  });

  // New message sent
  socket.on('sendMessage', async (newMessage) => {
    if (!newMessage || !newMessage.chat) return;

    const chat = newMessage.chat;
    const chatId = chat._id ? chat._id.toString() : chat.toString();

    // Broadcast message to everyone in the chat room except sender
    socket.to(chatId).emit('receiveMessage', newMessage);

    // Also broadcast to each participant's personal room for sidebar updates & notifications
    if (chat.participants && Array.isArray(chat.participants)) {
      chat.participants.forEach(async (participant) => {
        const participantId = participant._id ? participant._id.toString() : participant.toString();

        if (participantId !== socket.userId) {
          io.to(`user_${participantId}`).emit('chatListUpdate', {
            chatId,
            latestMessage: newMessage,
          });

          // Create in-app notification if it's a new message
          try {
            const senderName = newMessage.sender?.name || 'Someone';
            const previewContent = newMessage.content || (newMessage.attachments?.length ? 'Shared an attachment' : 'Sent a message');

            const notification = await Notification.create({
              recipient: participantId,
              sender: socket.userId,
              chat: chatId,
              type: 'new_message',
              content: chat.isGroupChat
                ? `${senderName} in ${chat.groupName}: ${previewContent}`
                : `${senderName}: ${previewContent}`,
            });

            const populatedNotif = await Notification.findById(notification._id)
              .populate('sender', 'name username avatar')
              .populate('chat', 'groupName isGroupChat');

            io.to(`user_${participantId}`).emit('newNotification', populatedNotif);
          } catch (err) {
            console.error('[Socket Notification Error]', err);
          }
        }
      });
    }
  });

  // Message read receipts
  socket.on('messageRead', async ({ chatId, userId }) => {
    if (!chatId || !userId) return;

    // Broadcast to room that messages were read by user
    socket.to(chatId).emit('messageReadUpdate', { chatId, userId });
  });

  // Message delivered receipt
  socket.on('messageDelivered', async ({ messageId, chatId, userId }) => {
    if (!messageId || !chatId || !userId) return;

    socket.to(chatId).emit('messageDeliveredUpdate', { messageId, chatId, userId });
  });

  // Message edited
  socket.on('messageEdited', (updatedMessage) => {
    if (!updatedMessage || !updatedMessage.chat) return;
    const chatId = updatedMessage.chat._id || updatedMessage.chat;
    io.to(chatId).emit('messageEditedUpdate', updatedMessage);
  });

  // Message deleted
  socket.on('messageDeleted', ({ messageId, chatId }) => {
    if (!messageId || !chatId) return;
    io.to(chatId).emit('messageDeletedUpdate', { messageId, chatId });
  });

  // Message reaction
  socket.on('messageReaction', (updatedMessage) => {
    if (!updatedMessage || !updatedMessage.chat) return;
    const chatId = updatedMessage.chat._id || updatedMessage.chat;
    io.to(chatId).emit('messageReactionUpdate', updatedMessage);
  });

  // Group events
  socket.on('groupCreated', (group) => {
    if (!group || !group.participants) return;
    group.participants.forEach((p) => {
      const pId = p._id || p;
      io.to(`user_${pId}`).emit('groupCreatedUpdate', group);
    });
  });

  socket.on('groupUpdated', (group) => {
    if (!group) return;
    io.to(group._id).emit('groupUpdatedUpdate', group);
  });
};
