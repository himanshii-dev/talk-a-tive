import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Create or access a 1-on-1 chat
// @route   POST /api/chats
// @access  Private
export const accessChat = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'UserId param not sent with request',
      });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create a chat with yourself',
      });
    }

    // Check if either user is blocked
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found',
      });
    }

    if (
      currentUser.blockedUsers.includes(userId) ||
      targetUser.blockedUsers.includes(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unable to start chat. Communication is blocked between these users.',
      });
    }

    // Check if chat already exists
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { participants: { $elemMatch: { $eq: req.user._id } } },
        { participants: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate('participants', '-password')
      .populate('latestMessage');

    isChat = await User.populate(isChat, {
      path: 'latestMessage.sender',
      select: 'name username avatar email',
    });

    if (isChat.length > 0) {
      res.status(200).json({
        success: true,
        data: isChat[0],
      });
    } else {
      const chatData = {
        groupName: 'sender',
        isGroupChat: false,
        participants: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findById(createdChat._id).populate(
        'participants',
        '-password'
      );

      res.status(201).json({
        success: true,
        data: fullChat,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch all chats for the logged in user with unread counts
// @route   GET /api/chats
// @access  Private
export const fetchChats = async (req, res, next) => {
  try {
    let chats = await Chat.find({
      participants: { $elemMatch: { $eq: req.user._id } },
    })
      .populate('participants', '-password')
      .populate('admins', '-password')
      .populate({
        path: 'latestMessage',
        populate: {
          path: 'sender',
          select: 'name username avatar email',
        },
      })
      .sort({ updatedAt: -1 });

    // Calculate unread counts for each chat
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chat: chat._id,
          sender: { $ne: req.user._id },
          readBy: { $nin: [req.user._id] },
        });

        const chatObj = chat.toObject();
        chatObj.unreadCount = unreadCount;
        return chatObj;
      })
    );

    res.status(200).json({
      success: true,
      data: chatsWithUnread,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
export const getChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: { $elemMatch: { $eq: req.user._id } },
    })
      .populate('participants', '-password')
      .populate('admins', '-password')
      .populate({
        path: 'latestMessage',
        populate: {
          path: 'sender',
          select: 'name username avatar email',
        },
      });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or you are not authorized to view it',
      });
    }

    res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
};
