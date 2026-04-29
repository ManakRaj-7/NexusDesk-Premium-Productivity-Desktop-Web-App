import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import {
  createFolder,
  getFolders,
  getFolderTree,
  updateFolder,
  deleteFolder,
} from '../controllers/folderController.js';

const router = Router();

router.post('/', verifyAuth, createFolder);
router.get('/', verifyAuth, getFolders);
router.get('/tree/hierarchy', verifyAuth, getFolderTree);
router.put('/:id', verifyAuth, updateFolder);
router.delete('/:id', verifyAuth, deleteFolder);

export default router;
