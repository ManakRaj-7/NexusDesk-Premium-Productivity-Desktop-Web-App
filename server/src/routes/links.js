import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import {
  createLink,
  getLinks,
  getLinkById,
  updateLink,
  deleteLink,
} from '../controllers/linkController.js';

const router = Router();

router.post('/', verifyAuth, createLink);
router.get('/', verifyAuth, getLinks);
router.get('/:id', verifyAuth, getLinkById);
router.put('/:id', verifyAuth, updateLink);
router.delete('/:id', verifyAuth, deleteLink);

export default router;
