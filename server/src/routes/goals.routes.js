import express from 'express';
import { getGoalsByStudent, getGoalById, createGoal, generateAIGoal, updateGoal, deleteGoal, getProgressPrediction } from '../controllers/goals.controller.js';
import { authenticate, checkStudentAccess, checkEditPermission } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// AI goal generation (Cornerstone Feature!)
router.post('/generate-ai', generateAIGoal);

router.get('/student/:studentId', checkStudentAccess, getGoalsByStudent);
router.post('/', createGoal);
router.get('/:goalId', getGoalById);
router.put('/:goalId', updateGoal);
router.delete('/:goalId', deleteGoal);

// AI progress prediction
router.get('/:goalId/predict', getProgressPrediction);

export default router;
