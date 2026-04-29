import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  searchNotes,
} from '../controllers/notesController.js';

const router = Router();

router.post('/', verifyAuth, createNote);
router.get('/', verifyAuth, getNotes);
router.get('/search', verifyAuth, searchNotes);
router.get('/:id', verifyAuth, getNoteById);
router.put('/:id', verifyAuth, updateNote);
router.delete('/:id', verifyAuth, deleteNote);

export default router;
