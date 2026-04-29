import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import {
  getDashboardSummary,
  getActivityFeed,
  getPinnedItems,
} from '../controllers/dashboardController.js';

const router = Router();

router.get('/summary', verifyAuth, getDashboardSummary);
router.get('/activity', verifyAuth, getActivityFeed);
router.get('/pinned', verifyAuth, getPinnedItems);

export default router;
