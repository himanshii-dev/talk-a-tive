import User from '../models/User.js';

// Map of userId -> Set of socketIds
export const onlineUsers = new Map();

export const setupPresenceSocket = (io, socket) => {
  // User setup after connection
  socket.on('setup', async (userData) => {
    if (!userData || !userData._id) return;
    const userId = userData._id.toString();

    socket.userId = userId;
    socket.join(`user_${userId}`);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    try {
      await User.findByIdAndUpdate(userId, { isOnline: true });
    } catch (err) {
      console.error('[Presence Error] Could not update isOnline to true:', err);
    }

    // Broadcast user online to everyone
    io.emit('userOnline', { userId });

    // Send the list of all currently online user IDs to the connected client
    const onlineIds = Array.from(onlineUsers.keys());
    socket.emit('onlineUsersList', onlineIds);
  });

  // Disconnect handler
  socket.on('disconnect', async () => {
    const userId = socket.userId;
    if (!userId) return;

    if (onlineUsers.has(userId)) {
      const userSockets = onlineUsers.get(userId);
      userSockets.delete(socket.id);

      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        const lastSeen = new Date();

        try {
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen,
          });
        } catch (err) {
          console.error('[Presence Error] Could not update isOnline to false:', err);
        }

        io.emit('userOffline', { userId, lastSeen });
      }
    }
  });
};
