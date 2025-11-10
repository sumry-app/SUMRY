import express from 'express';
import { getProgressByGoal, createProgressLog, updateProgressLog, deleteProgressLog, getStudentAnalytics } from '../controllers/progress.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/goal/:goalId', getProgressByGoal);
router.post('/', createProgressLog);
router.put('/:logId', updateProgressLog);
router.delete('/:logId', deleteProgressLog);

// Analytics
router.get('/analytics/:studentId', getStudentAnalytics);

export default router;
