import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const result = await query(
      'SELECT id, email, first_name, last_name, role, organization, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Role-based access control middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: `Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Check if user has access to student
export const checkStudentAccess = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.body.studentId;
    const userId = req.user.id;

    // Admins have access to all students in their organization
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user created the student or is a team member
    const result = await query(
      `SELECT s.id
       FROM students s
       LEFT JOIN team_members tm ON s.id = tm.student_id AND tm.user_id = $1
       WHERE s.id = $2 AND (s.created_by = $1 OR tm.id IS NOT NULL)`,
      [userId, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this student' });
    }

    next();
  } catch (error) {
    console.error('Student access check error:', error);
    return res.status(500).json({ error: 'Access check failed' });
  }
};

// Check if user can edit (not just view)
export const checkEditPermission = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.body.studentId;
    const userId = req.user.id;

    // Admins and teachers can always edit
    if (['admin', 'teacher'].includes(req.user.role)) {
      return next();
    }

    // Check team member edit permission
    const result = await query(
      `SELECT can_edit FROM team_members WHERE student_id = $1 AND user_id = $2`,
      [studentId, userId]
    );

    if (result.rows.length === 0 || !result.rows[0].can_edit) {
      return res.status(403).json({ error: 'Edit permission denied' });
    }

    next();
  } catch (error) {
    console.error('Edit permission check error:', error);
    return res.status(500).json({ error: 'Permission check failed' });
  }
};
