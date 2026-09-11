import express from 'express';
import {
  allMessages,
  sendMessage,
  markMessagesAsRead,
  editMessage,
  deleteMessage,
  reactToMessage,
  searchMessages,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(sendMessage);

router.get('/:chatId', allMessages);
router.put('/:chatId/read', markMessagesAsRead);
router.get('/:chatId/search', searchMessages);
router.put('/:id', editMessage);
router.delete('/:id', deleteMessage);
router.post('/:id/react', reactToMessage);

export default router;
