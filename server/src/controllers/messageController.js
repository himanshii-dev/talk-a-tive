import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

// @desc    Get all messages for a chat with pagination
// @route   GET /api/messages/:chatId
// @access  Private
export const allMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 30;
    const before = req.query.before; // ISO timestamp or message ID for infinite scroll cursor

    // Verify user is in chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $elemMatch: { $eq: req.user._id } },
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages in this chat',
      });
    }

    const query = { chat: chatId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const totalCount = await Message.countDocuments({ chat: chatId });

    // Sort descending to get latest, then reverse so frontend receives chronological order
    const messages = await Message.find(query)
      .populate('sender', 'name username avatar email')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'name username avatar',
        },
      })
      .populate('reactions.user', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(limit);

    const reversedMessages = messages.reverse();

    res.status(200).json({
      success: true,
      data: reversedMessages,
      totalCount,
      hasMore: totalCount > limit + (before ? await Message.countDocuments({ chat: chatId, createdAt: { $gte: new Date(before) } }) : 0),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { content, chatId, messageType = 'text', attachments = [], replyTo } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'ChatId is required',
      });
    }

    if (!content && attachments.length === 0 && messageType !== 'system') {
      return res.status(400).json({
        success: false,
        message: 'Message content or attachment is required',
      });
    }

    // Verify user is participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $elemMatch: { $eq: req.user._id } },
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation',
      });
    }

    const newMessageData = {
      sender: req.user._id,
      chat: chatId,
      content: content || '',
      messageType,
      attachments,
      replyTo: replyTo || null,
      deliveredTo: [req.user._id],
      readBy: [req.user._id],
    };

    let message = await Message.create(newMessageData);

    message = await message.populate('sender', 'name username avatar email');
    message = await message.populate('chat');
    message = await message.populate({
      path: 'replyTo',
      populate: {
        path: 'sender',
        select: 'name username avatar',
      },
    });

    // Update latestMessage in Chat
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id,
      updatedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages in a chat as read
// @route   PUT /api/messages/:chatId/read
// @access  Private
export const markMessagesAsRead = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.user._id },
        readBy: { $nin: [req.user._id] },
      },
      {
        $addToSet: { readBy: req.user._id, deliveredTo: req.user._id },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit a message
// @route   PUT /api/messages/:id
// @access  Private
export const editMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty',
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages',
      });
    }

    if (message.deleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a deleted message',
      });
    }

    message.content = content.trim();
    message.edited = true;
    await message.save();

    const updated = await Message.findById(id)
      .populate('sender', 'name username avatar email')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name username avatar' },
      })
      .populate('reactions.user', 'name username avatar');

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a message (soft delete)
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id).populate('chat');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user is the sender or a group admin
    const isSender = message.sender.toString() === req.user._id.toString();
    const isGroupAdmin =
      message.chat.isGroupChat &&
      message.chat.admins &&
      message.chat.admins.some((adminId) => adminId.toString() === req.user._id.toString());

    if (!isSender && !isGroupAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message',
      });
    }

    message.content = 'This message was deleted';
    message.deleted = true;
    message.attachments = [];
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted',
      data: {
        _id: message._id,
        chat: message.chat._id,
        content: message.content,
        deleted: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    React or toggle reaction on a message
// @route   POST /api/messages/:id/react
// @access  Private
export const reactToMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required',
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingReactionIndex > -1) {
      // User already reacted with this emoji -> remove it (toggle off)
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Remove any existing different reaction from same user if we want single-reaction,
      // or allow multiple. Typically modern chat allows one reaction per user per message or toggles.
      // Let's replace any existing reaction by this user:
      const userOtherReactionIndex = message.reactions.findIndex(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (userOtherReactionIndex > -1) {
        message.reactions[userOtherReactionIndex].emoji = emoji;
      } else {
        message.reactions.push({ emoji, user: req.user._id });
      }
    }

    await message.save();

    const updatedMessage = await Message.findById(id)
      .populate('sender', 'name username avatar email')
      .populate('reactions.user', 'name username avatar');

    res.status(200).json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search messages in a chat
// @route   GET /api/messages/:chatId/search
// @access  Private
export const searchMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json({ success: true, data: [] });
    }

    const results = await Message.find({
      chat: chatId,
      deleted: false,
      content: { $regex: q.trim(), $options: 'i' },
    })
      .populate('sender', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
