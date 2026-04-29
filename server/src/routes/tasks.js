import { Router } from 'express';
import { verifyAuth } from '../middleware/auth.js';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  filterTasks,
} from '../controllers/tasksController.js';

const router = Router();

router.post('/', verifyAuth, createTask);
router.get('/', verifyAuth, getTasks);
router.get('/filter', verifyAuth, filterTasks);
router.get('/:id', verifyAuth, getTaskById);
router.put('/:id', verifyAuth, updateTask);
router.delete('/:id', verifyAuth, deleteTask);

export default router;
