import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '../services/chatService';
import { messageService } from '../services/messageService';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { soundManager } from '../utils/sound';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const [typingUsers, setTypingUsers] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSearchingChat, setIsSearchingChat] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const typingTimeoutRef = useRef(null);
  const selectedChatRef = useRef(selectedChat);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Fetch all chats
  const fetchChats = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingChats(true);
      const res = await chatService.fetchChats();
      if (res.success) {
        setChats(res.data);
      }
    } catch (err) {
      console.error('[Chat Fetch Error]', err);
    } finally {
      setLoadingChats(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Select active chat and load initial messages
  const selectChat = async (chat) => {
    if (!chat) {
      setSelectedChat(null);
      setMessages([]);
      return;
    }

    if (selectedChat && selectedChat._id === chat._id) {
      return;
    }

    // Leave previous chat room if any
    if (selectedChat && socket) {
      socket.emit('leaveChat', selectedChat._id);
    }

    setSelectedChat(chat);
    setReplyingTo(null);
    setEditingMessage(null);
    setIsSearchingChat(false);
    setSearchResults([]);

    // Join new chat room
    if (socket) {
      socket.emit('joinChat', chat._id);
      socket.emit('messageRead', { chatId: chat._id, userId: user._id });
    }

    // Mark as read in backend
    try {
      await messageService.markAsRead(chat._id);
      // Reset unread count locally
      setChats((prev) =>
        prev.map((c) => (c._id === chat._id ? { ...c, unreadCount: 0 } : c))
      );
    } catch (e) {
      console.error(e);
    }

    // Fetch latest messages
    try {
      setLoadingMessages(true);
      const res = await messageService.getMessages(chat._id, null, 30);
      if (res.success) {
        setMessages(res.data);
        setHasMore(res.hasMore);
      }
    } catch (err) {
      console.error('[Messages Fetch Error]', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Load older messages for pagination (infinite scroll upward)
  const loadOlderMessages = async () => {
    if (!selectedChat || loadingOlder || !hasMore || messages.length === 0) return;

    try {
      setLoadingOlder(true);
      const oldestTimestamp = messages[0].createdAt;
      const res = await messageService.getMessages(selectedChat._id, oldestTimestamp, 30);

      if (res.success && res.data.length > 0) {
        setMessages((prev) => [...res.data, ...prev]);
        setHasMore(res.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('[Older Messages Error]', err);
    } finally {
      setLoadingOlder(false);
    }
  };

  // Send message
  const sendNewMessage = async ({ content, attachments = [], messageType = 'text' }) => {
    if (!selectedChat) return;

    const payload = {
      chatId: selectedChat._id,
      content,
      attachments,
      messageType,
      replyTo: replyingTo ? replyingTo._id : undefined,
    };

    try {
      const res = await messageService.sendMessage(payload);
      if (res.success && res.data) {
        const newMsg = res.data;
        setMessages((prev) => [...prev, newMsg]);
        setReplyingTo(null);

        // Update chats list latestMessage
        setChats((prev) =>
          prev.map((c) =>
            c._id === selectedChat._id ? { ...c, latestMessage: newMsg, updatedAt: new Date().toISOString() } : c
          ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );

        // Emit over socket
        if (socket) {
          socket.emit('sendMessage', newMsg);
          socket.emit('stopTyping', { chatId: selectedChat._id, userId: user._id });
        }

        soundManager.playSentChime();
        return newMsg;
      }
    } catch (err) {
      console.error('[Send Message Error]', err);
      throw err;
    }
  };

  // Edit message
  const editMessage = async (messageId, newContent) => {
    try {
      const res = await messageService.editMessage(messageId, newContent);
      if (res.success && res.data) {
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? res.data : m))
        );
        setEditingMessage(null);
        if (socket) {
          socket.emit('messageEdited', res.data);
        }
      }
    } catch (err) {
      console.error('[Edit Message Error]', err);
      throw err;
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    try {
      const res = await messageService.deleteMessage(messageId);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, content: 'This message was deleted', deleted: true, attachments: [] }
              : m
          )
        );
        if (socket && selectedChat) {
          socket.emit('messageDeleted', { messageId, chatId: selectedChat._id });
        }
      }
    } catch (err) {
      console.error('[Delete Message Error]', err);
      throw err;
    }
  };

  // React to message
  const toggleReaction = async (messageId, emoji) => {
    try {
      const res = await messageService.reactToMessage(messageId, emoji);
      if (res.success && res.data) {
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? res.data : m))
        );
        if (socket) {
          socket.emit('messageReaction', res.data);
        }
      }
    } catch (err) {
      console.error('[Reaction Error]', err);
    }
  };

  // Typing indicators
  const emitTyping = () => {
    if (!socket || !selectedChat) return;

    socket.emit('typing', {
      chatId: selectedChat._id,
      userId: user._id,
      userName: user.name,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', {
        chatId: selectedChat._id,
        userId: user._id,
      });
    }, 2500);
  };

  const emitStopTyping = () => {
    if (!socket || !selectedChat) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('stopTyping', {
      chatId: selectedChat._id,
      userId: user._id,
    });
  };

  // Search messages within current conversation
  const searchConversation = async (query) => {
    if (!selectedChat || !query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await messageService.searchMessages(selectedChat._id, query);
      if (res.success) {
        setSearchResults(res.data);
      }
    } catch (err) {
      console.error('[Search Messages Error]', err);
    }
  };

  // Socket event listeners for chats and messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMsg) => {
      const currentActive = selectedChatRef.current;
      const msgChatId = newMsg.chat?._id || newMsg.chat;

      if (currentActive && currentActive._id === msgChatId) {
        setMessages((prev) => [...prev, newMsg]);
        // Automatically mark as read if active
        socket.emit('messageRead', { chatId: msgChatId, userId: user._id });
        messageService.markAsRead(msgChatId).catch(console.error);
      } else {
        // Increment unread count on chat item
        setChats((prev) =>
          prev.map((c) =>
            c._id === msgChatId
              ? {
                  ...c,
                  unreadCount: (c.unreadCount || 0) + 1,
                  latestMessage: newMsg,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
      }
    };

    const handleMessageReadUpdate = ({ chatId, userId }) => {
      if (selectedChatRef.current?._id === chatId) {
        setMessages((prev) =>
          prev.map((m) => {
            if (!m.readBy?.includes(userId)) {
              return { ...m, readBy: [...(m.readBy || []), userId] };
            }
            return m;
          })
        );
      }
    };

    const handleMessageDeliveredUpdate = ({ messageId, userId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId && !m.deliveredTo?.includes(userId)
            ? { ...m, deliveredTo: [...(m.deliveredTo || []), userId] }
            : m
        )
      );
    };

    const handleMessageEditedUpdate = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    };

    const handleMessageDeletedUpdate = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, content: 'This message was deleted', deleted: true, attachments: [] }
            : m
        )
      );
    };

    const handleMessageReactionUpdate = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    };

    const handleUserTyping = ({ chatId, userId, userName }) => {
      setTypingUsers((prev) => {
        const currentList = prev[chatId] || [];
        if (!currentList.some((u) => u.userId === userId)) {
          return {
            ...prev,
            [chatId]: [...currentList, { userId, userName }],
          };
        }
        return prev;
      });
    };

    const handleUserStoppedTyping = ({ chatId, userId }) => {
      setTypingUsers((prev) => {
        const currentList = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: currentList.filter((u) => u.userId !== userId),
        };
      });
    };

    const handleChatListUpdate = ({ chatId, latestMessage }) => {
      setChats((prev) => {
        const chatExists = prev.some((c) => c._id === chatId);
        if (!chatExists) {
          fetchChats();
          return prev;
        }
        return prev.map((c) =>
          c._id === chatId
            ? {
                ...c,
                latestMessage,
                updatedAt: new Date().toISOString(),
              }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    };

    const handleGroupCreatedUpdate = (newGroup) => {
      setChats((prev) => [newGroup, ...prev]);
    };

    const handleGroupUpdatedUpdate = (updatedGroup) => {
      setChats((prev) =>
        prev.map((c) => (c._id === updatedGroup._id ? { ...c, ...updatedGroup } : c))
      );
      if (selectedChatRef.current?._id === updatedGroup._id) {
        setSelectedChat((prev) => ({ ...prev, ...updatedGroup }));
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageReadUpdate', handleMessageReadUpdate);
    socket.on('messageDeliveredUpdate', handleMessageDeliveredUpdate);
    socket.on('messageEditedUpdate', handleMessageEditedUpdate);
    socket.on('messageDeletedUpdate', handleMessageDeletedUpdate);
    socket.on('messageReactionUpdate', handleMessageReactionUpdate);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);
    socket.on('chatListUpdate', handleChatListUpdate);
    socket.on('groupCreatedUpdate', handleGroupCreatedUpdate);
    socket.on('groupUpdatedUpdate', handleGroupUpdatedUpdate);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messageReadUpdate', handleMessageReadUpdate);
      socket.off('messageDeliveredUpdate', handleMessageDeliveredUpdate);
      socket.off('messageEditedUpdate', handleMessageEditedUpdate);
      socket.off('messageDeletedUpdate', handleMessageDeletedUpdate);
      socket.off('messageReactionUpdate', handleMessageReactionUpdate);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);
      socket.off('chatListUpdate', handleChatListUpdate);
      socket.off('groupCreatedUpdate', handleGroupCreatedUpdate);
      socket.off('groupUpdatedUpdate', handleGroupUpdatedUpdate);
    };
  }, [socket, fetchChats, user?._id]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        selectedChat,
        messages,
        loadingChats,
        loadingMessages,
        loadingOlder,
        hasMore,
        typingUsers: selectedChat ? typingUsers[selectedChat._id] || [] : [],
        replyingTo,
        setReplyingTo,
        editingMessage,
        setEditingMessage,
        isDetailsOpen,
        setIsDetailsOpen,
        isSearchingChat,
        setIsSearchingChat,
        searchResults,
        selectChat,
        fetchChats,
        loadOlderMessages,
        sendNewMessage,
        editMessage,
        deleteMessage,
        toggleReaction,
        emitTyping,
        emitStopTyping,
        searchConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
