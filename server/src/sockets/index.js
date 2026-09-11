import { Server } from 'socket.io';
import { setupPresenceSocket } from './presenceSocket.js';
import { setupTypingSocket } from './typingSocket.js';
import { setupChatSocket } from './chatSocket.js';

export const initializeSocket = (httpServer, clientUrl) => {
  const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
      origin: [clientUrl || 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Setup modular socket event listeners
    setupPresenceSocket(io, socket);
    setupTypingSocket(io, socket);
    setupChatSocket(io, socket);
  });

  return io;
};
