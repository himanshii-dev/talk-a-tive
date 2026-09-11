import express from 'express';
import {
  createGroup,
  updateGroup,
  addMembers,
  removeMember,
  promoteAdmin,
  demoteAdmin,
  generateInviteLink,
  revokeInviteLink,
  getGroupByInviteToken,
  joinGroupByInvite,
} from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / link preview route
router.get('/invite/:token', getGroupByInviteToken);

// Protected routes
router.use(protect);

router.post('/', createGroup);
router.put('/:id', updateGroup);
router.post('/:id/members', addMembers);
router.delete('/:id/members/:userId', removeMember);
router.put('/:id/admins/:userId', promoteAdmin);
router.delete('/:id/admins/:userId', demoteAdmin);
router.post('/:id/invite-link', generateInviteLink);
router.delete('/:id/invite-link', revokeInviteLink);
router.post('/invite/:token/join', joinGroupByInvite);

export default router;
