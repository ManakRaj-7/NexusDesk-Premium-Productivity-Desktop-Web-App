import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import {
  getUserSettings,
  updateSettings,
} from '../controllers/settingsController.js';

const router = Router();

router.get('/', verifyAuth, getUserSettings);
router.put('/', verifyAuth, updateSettings);

export default router;
