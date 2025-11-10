import express from 'express';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent, addTeamMember } from '../controllers/students.controller.js';
import { authenticate, checkStudentAccess, checkEditPermission } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getStudents);
router.post('/', createStudent);
router.get('/:studentId', checkStudentAccess, getStudentById);
router.put('/:studentId', checkStudentAccess, checkEditPermission, updateStudent);
router.delete('/:studentId', checkStudentAccess, checkEditPermission, deleteStudent);

// Team member management
router.post('/:studentId/team', checkStudentAccess, checkEditPermission, addTeamMember);

export default router;
