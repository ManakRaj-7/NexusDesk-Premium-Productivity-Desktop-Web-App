import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import {
  sendMessage,
  getConversation,
  getConversations,
  deleteConversation,
} from '../controllers/assistantController.js';

const router = Router();

router.post('/chat', verifyAuth, sendMessage);
router.get('/conversations', verifyAuth, getConversations);
router.get('/conversations/:id', verifyAuth, getConversation);
router.delete('/conversations/:id', verifyAuth, deleteConversation);

export default router;
