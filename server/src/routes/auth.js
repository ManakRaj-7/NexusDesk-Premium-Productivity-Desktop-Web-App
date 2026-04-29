import { Router } from 'express';
import { verifyAuth, verifyRefreshToken } from '../middleware/auth.js';
import {
  signup,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
} from '../controllers/authController.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', verifyAuth, logout);
router.post('/refresh', verifyRefreshToken, refreshToken);
router.get('/profile', verifyAuth, getProfile);
router.put('/profile', verifyAuth, updateProfile);

export default router;
