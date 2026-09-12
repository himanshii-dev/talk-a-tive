import { Server } from 'socket.io';
import { setupPresenceSocket } from './presenceSocket.js';
import { setupTypingSocket } from './typingSocket.js';
import { setupChatSocket } from './chatSocket.js';

export const initializeSocket = (httpServer, allowedOriginValidator) => {
  const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
      origin: (origin, callback) => {
        if (typeof allowedOriginValidator === 'function') {
          if (allowedOriginValidator(origin)) {
            return callback(null, true);
          }
          return callback(new Error('Socket CORS blocked'));
        }
        return callback(null, true);
      },
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
