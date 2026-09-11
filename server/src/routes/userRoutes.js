import express from 'express';
import {
  searchUsers,
  getUserProfile,
  updateProfile,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/search', searchUsers);
router.get('/blocked', getBlockedUsers);
router.get('/:id', getUserProfile);
router.put('/profile', updateProfile);
router.post('/block/:id', blockUser);
router.post('/unblock/:id', unblockUser);

export default router;
