import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import {
  createSession,
  getSessionStats,
  deleteSession,
} from '../controllers/sessionController.js';

const router = Router();

router.post('/', verifyAuth, createSession);
router.get('/stats', verifyAuth, getSessionStats);
router.delete('/:id', verifyAuth, deleteSession);

export default router;
