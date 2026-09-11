import express from 'express';
import {
  accessChat,
  fetchChats,
  getChatById,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(accessChat)
  .get(fetchChats);

router.get('/:id', getChatById);

export default router;
