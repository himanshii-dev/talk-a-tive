import crypto from 'crypto';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Create a new group chat
// @route   POST /api/groups
// @access  Private
export const createGroup = async (req, res, next) => {
  try {
    let { groupName, users, groupAvatar, groupDescription } = req.body;

    if (!groupName || !users) {
      return res.status(400).json({
        success: false,
        message: 'Please provide group name and members',
      });
    }

    if (typeof users === 'string') {
      users = JSON.parse(users);
    }

    if (!Array.isArray(users) || users.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'A group requires at least 2 members total',
      });
    }

    // Include creator in participants and admins
    const participants = Array.from(new Set([...users, req.user._id.toString()]));

    // Generate unique invite token
    const inviteToken = crypto.randomBytes(8).toString('hex');

    // Default avatar if not provided
    const avatar =
      groupAvatar ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
        groupName
      )}`;

    const groupChat = await Chat.create({
      groupName: groupName.trim(),
      groupAvatar: avatar,
      groupDescription: groupDescription ? groupDescription.trim() : '',
      isGroupChat: true,
      participants,
      admins: [req.user._id],
      inviteToken,
    });

    // Create system message
    const systemMessage = await Message.create({
      chat: groupChat._id,
      sender: req.user._id,
      content: `${req.user.name} created the group "${groupName.trim()}"`,
      messageType: 'system',
    });

    groupChat.latestMessage = systemMessage._id;
    await groupChat.save();

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate('participants', '-password')
      .populate('admins', '-password')
      .populate('latestMessage');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: fullGroupChat,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update group information (name, avatar, description)
// @route   PUT /api/groups/:id
// @access  Private (Admins only)
export const updateGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { groupName, groupAvatar, groupDescription } = req.body;

    const chat = await Chat.findById(id);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({
        success: false,
        message: 'Group chat not found',
      });
    }

    // Check if user is admin
    const isAdmin = chat.admins.some(
      (adminId) => adminId.toString() === req.user._id.toString()
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only group administrators can update group details',
      });
    }

    if (groupName) chat.groupName = groupName.trim();
    if (groupAvatar !== undefined) chat.groupAvatar = groupAvatar;
    if (groupDescription !== undefined) chat.groupDescription = groupDescription.trim();

    await chat.save();

    // Create system message for rename
    if (groupName) {
      await Message.create({
        chat: chat._id,
        sender: req.user._id,
        content: `${req.user.name} changed group name to "${chat.groupName}"`,
        messageType: 'system',
      });
    }

    const updated = await Chat.findById(id)
      .populate('participants', '-password')
      .populate('admins', '-password');

    res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add members to group
// @route   POST /api/groups/:id/members
// @access  Private (Admins only)
export const addMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { userIds } = req.body;

    if (!userIds || (Array.isArray(userIds) && userIds.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user IDs to add',
      });
    }

    if (!Array.isArray(userIds)) {
      userIds = [userIds];
    }

    const chat = await Chat.findById(id);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({
        success: false,
        message: 'Group chat not found',
      });
    }

    // Check admin
    const isAdmin = chat.admins.some(
      (adminId) => adminId.toString() === req.user._id.toString()
    );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only group administrators can add members',
      });
    }

    // Filter users not already in group
    const newMembers = userIds.filter(
      (uId) => !chat.participants.some((pId) => pId.toString() === uId.toString())
    );

    if (newMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Selected users are already members of this group',
      });
    }

    chat.participants.push(...newMembers);
    await chat.save();

    // Create system message
    const addedUsers = await User.find({ _id: { $in: newMembers } }).select('name');
    const names = addedUsers.map((u) => u.name).join(', ');

    const sysMsg = await Message.create({
      chat: chat._id,
      sender: req.user._id,
      content: `${req.user.name} added ${names} to the group`,
      messageType: 'system',
    });

    chat.latestMessage = sysMsg._id;
    await chat.save();

    const updated = await Chat.findById(id)
      .populate('participants', '-password')
      .populate('admins', '-password')
      .populate('latestMessage');

    res.status(200).json({
      success: true,
      message: 'Members added successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member or leave group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private
export const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const isSelfLeaving = req.user._id.toString() === userId;

    const chat = await Chat.findById(id);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({
        success: false,
        message: 'Group chat not found',
      });
    }

    const isAdmin = chat.admins.some(
      (adminId) => adminId.toString() === req.user._id.toString()
    );

    if (!isSelfLeaving && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can remove other members',
      });
    }

    // Remove from participants and admins
    chat.participants = chat.participants.filter(
      (p) => p.toString() !== userId
    );
    chat.admins = chat.admins.filter((a) => a.toString() !== userId);

    // If no admins left and members remain, assign first member as admin
    if (chat.admins.length === 0 && chat.participants.length > 0) {
      chat.admins.push(chat.participants[0]);
    }

    await chat.save();

    const targetUser = await User.findById(userId).select('name');
    const actionText = isSelfLeaving
      ? `${req.user.name} left the group`
      : `${req.user.name} removed ${targetUser ? targetUser.name : 'a user'} from the group`;

    const sysMsg = await Message.create({
      chat: chat._id,
      sender: req.user._id,
      content: actionText,
      messageType: 'system',
    });

    chat.latestMessage = sysMsg._id;
    await chat.save();

    const updated = await Chat.findById(id)
      .populate('participants', '-password')
      .populate('admins', '-password')
      .populate('latestMessage');

    res.status(200).json({
      success: true,
      message: isSelfLeaving ? 'Left group successfully' : 'Member removed successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Promote member to admin
// @route   PUT /api/groups/:id/admins/:userId
// @access  Private (Admins only)
export const promoteAdmin = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const chat = await Chat.findById(id);

    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isAdmin = chat.admins.some((a) => a.toString() === req.user._id.toString());
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can promote members' });
    }

    if (!chat.admins.some((a) => a.toString() === userId)) {
      chat.admins.push(userId);
      await chat.save();
    }

    const promotedUser = await User.findById(userId).select('name');
    await Message.create({
      chat: chat._id,
      sender: req.user._id,
      content: `${promotedUser?.name || 'A user'} is now an admin`,
      messageType: 'system',
    });

    const updated = await Chat.findById(id)
      .populate('participants', '-password')
      .populate('admins', '-password');

    res.status(200).json({ success: true, message: 'Member promoted to admin', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Demote admin to member
// @route   DELETE /api/groups/:id/admins/:userId
// @access  Private (Admins only)
export const demoteAdmin = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const chat = await Chat.findById(id);
    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isAdmin = chat.admins.some((a) => a.toString() === req.user._id.toString());
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can demote other admins' });
    }

    if (chat.admins.length <= 1) {
      return res.status(400).json({ success: false, message: 'Cannot demote the only administrator' });
    }

    chat.admins = chat.admins.filter((a) => a.toString() !== userId);
    await chat.save();

    const updated = await Chat.findById(id)
      .populate('participants', '-password')
      .populate('admins', '-password');

    res.status(200).json({ success: true, message: 'Admin demoted successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate new invite link token
// @route   POST /api/groups/:id/invite-link
// @access  Private (Admins only)
export const generateInviteLink = async (req, res, next) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findById(id);
    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isAdmin = chat.admins.some((a) => a.toString() === req.user._id.toString());
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can generate invite links' });
    }

    chat.inviteToken = crypto.randomBytes(8).toString('hex');
    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Invite link generated',
      data: {
        inviteToken: chat.inviteToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke invite link
// @route   DELETE /api/groups/:id/invite-link
// @access  Private (Admins only)
export const revokeInviteLink = async (req, res, next) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findById(id);
    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isAdmin = chat.admins.some((a) => a.toString() === req.user._id.toString());
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can revoke invite links' });
    }

    chat.inviteToken = null;
    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Invite link revoked',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group details by invite token
// @route   GET /api/groups/invite/:token
// @access  Public / Private
export const getGroupByInviteToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const chat = await Chat.findOne({ inviteToken: token, isGroupChat: true })
      .populate('participants', 'name username avatar')
      .select('groupName groupAvatar groupDescription participants createdAt');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invite link',
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

// @desc    Join group using invite token
// @route   POST /api/groups/invite/:token/join
// @access  Private
export const joinGroupByInvite = async (req, res, next) => {
  try {
    const { token } = req.params;

    const chat = await Chat.findOne({ inviteToken: token, isGroupChat: true });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invite link',
      });
    }

    const alreadyMember = chat.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res.status(200).json({
        success: true,
        message: 'You are already a member of this group',
        data: chat,
      });
    }

    chat.participants.push(req.user._id);
    await chat.save();

    // Create system message
    const sysMsg = await Message.create({
      chat: chat._id,
      sender: req.user._id,
      content: `${req.user.name} joined via invite link`,
      messageType: 'system',
    });

    chat.latestMessage = sysMsg._id;
    await chat.save();

    const fullChat = await Chat.findById(chat._id)
      .populate('participants', '-password')
      .populate('admins', '-password')
      .populate('latestMessage');

    res.status(200).json({
      success: true,
      message: 'Joined group successfully',
      data: fullChat,
    });
  } catch (error) {
    next(error);
  }
};
