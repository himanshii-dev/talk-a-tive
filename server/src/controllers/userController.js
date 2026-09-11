import User from '../models/User.js';

// @desc    Search users by username, name, or email
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req, res, next) => {
  try {
    const keyword = req.query.q ? req.query.q.trim() : '';

    if (!keyword) {
      return res.status(200).json({ success: true, data: [] });
    }

    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);
    const blockedList = currentUser.blockedUsers || [];

    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: blockedList } },
        { blockedUsers: { $ne: currentUserId } },
        {
          $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { username: { $regex: keyword, $options: 'i' } },
            { email: { $regex: keyword, $options: 'i' } },
          ],
        },
      ],
    })
      .select('name username email avatar bio status isOnline lastSeen')
      .limit(20);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name username email avatar bio status isOnline lastSeen createdAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user's profile and preferences
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { name, bio, status, avatar, settings } = req.body;

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (status) user.status = status;
    if (avatar) user.avatar = avatar;

    if (settings && typeof settings === 'object') {
      user.settings = {
        ...user.settings.toObject(),
        ...settings,
      };
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        status: updatedUser.status,
        isOnline: updatedUser.isOnline,
        settings: updatedUser.settings,
        blockedUsers: updatedUser.blockedUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block a user
// @route   POST /api/users/block/:id
// @access  Private
export const blockUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block yourself',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user.blockedUsers.includes(targetUserId)) {
      user.blockedUsers.push(targetUserId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'User blocked successfully',
      data: user.blockedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock a user
// @route   POST /api/users/unblock/:id
// @access  Private
export const unblockUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    const user = await User.findById(req.user._id);
    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== targetUserId
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully',
      data: user.blockedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get blocked users list
// @route   GET /api/users/blocked
// @access  Private
export const getBlockedUsers = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'blockedUsers',
      'name username avatar bio'
    );

    res.status(200).json({
      success: true,
      data: user.blockedUsers,
    });
  } catch (error) {
    next(error);
  }
};
