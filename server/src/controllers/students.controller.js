import { query } from '../config/database.js';
import { logAudit } from '../utils/audit.js';

/**
 * Get all students for current user
 */
export async function getStudents(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const organization = req.user.organization;

    let queryText, params;

    if (role === 'admin') {
      // Admins see all students in their organization
      queryText = `
        SELECT s.*,
               u.first_name || ' ' || u.last_name as created_by_name,
               (SELECT COUNT(*) FROM goals WHERE student_id = s.id AND status = 'active') as active_goals_count
        FROM students s
        LEFT JOIN users u ON s.created_by = u.id
        WHERE s.organization = $1 AND s.is_active = true
        ORDER BY s.last_name, s.first_name
      `;
      params = [organization];
    } else {
      // Other users see students they created or are team members for
      queryText = `
        SELECT DISTINCT s.*,
               u.first_name || ' ' || u.last_name as created_by_name,
               (SELECT COUNT(*) FROM goals WHERE student_id = s.id AND status = 'active') as active_goals_count
        FROM students s
        LEFT JOIN users u ON s.created_by = u.id
        LEFT JOIN team_members tm ON s.id = tm.student_id
        WHERE (s.created_by = $1 OR tm.user_id = $1) AND s.is_active = true
        ORDER BY s.last_name, s.first_name
      `;
      params = [userId];
    }

    const result = await query(queryText, params);

    res.json({
      students: result.rows
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to get students' });
  }
}

/**
 * Get single student with details
 */
export async function getStudentById(req, res) {
  try {
    const { studentId } = req.params;

    const studentResult = await query(
      `SELECT s.*,
              u.first_name || ' ' || u.last_name as created_by_name
       FROM students s
       LEFT JOIN users u ON s.created_by = u.id
       WHERE s.id = $1`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = studentResult.rows[0];

    // Get team members
    const teamResult = await query(
      `SELECT tm.*,
              u.email, u.first_name || ' ' || u.last_name as name
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.student_id = $1`,
      [studentId]
    );

    student.team_members = teamResult.rows;

    // Get goals summary
    const goalsResult = await query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'active') as active_goals,
         COUNT(*) FILTER (WHERE status = 'completed') as completed_goals,
         COUNT(*) as total_goals
       FROM goals WHERE student_id = $1`,
      [studentId]
    );

    student.goals_summary = goalsResult.rows[0];

    res.json({ student });

  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to get student' });
  }
}

/**
 * Create new student
 */
export async function createStudent(req, res) {
  try {
    const {
      studentNumber,
      firstName,
      lastName,
      dateOfBirth,
      gradeLevel,
      disabilityClassification
    } = req.body;

    const userId = req.user.id;
    const organization = req.user.organization;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name required' });
    }

    const result = await query(
      `INSERT INTO students (
        student_number, first_name, last_name, date_of_birth,
        grade_level, disability_classification, created_by, organization
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [studentNumber, firstName, lastName, dateOfBirth, gradeLevel, disabilityClassification, userId, organization]
    );

    const student = result.rows[0];

    // Log creation
    await logAudit({
      userId,
      action: 'create',
      entityType: 'student',
      entityId: student.id,
      newValues: student,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    console.log(`✅ Student created: ${student.first_name} ${student.last_name}`);

    res.status(201).json({
      message: 'Student created successfully',
      student
    });

  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
}

/**
 * Update student
 */
export async function updateStudent(req, res) {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;

    // Get old values for audit
    const oldResult = await query('SELECT * FROM students WHERE id = $1', [studentId]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const {
      studentNumber,
      firstName,
      lastName,
      dateOfBirth,
      gradeLevel,
      disabilityClassification
    } = req.body;

    const result = await query(
      `UPDATE students SET
        student_number = COALESCE($1, student_number),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        date_of_birth = COALESCE($4, date_of_birth),
        grade_level = COALESCE($5, grade_level),
        disability_classification = COALESCE($6, disability_classification)
       WHERE id = $7
       RETURNING *`,
      [studentNumber, firstName, lastName, dateOfBirth, gradeLevel, disabilityClassification, studentId]
    );

    const student = result.rows[0];

    // Log update
    await logAudit({
      userId,
      action: 'update',
      entityType: 'student',
      entityId: studentId,
      oldValues: oldResult.rows[0],
      newValues: student,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      message: 'Student updated successfully',
      student
    });

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
}

/**
 * Delete student (soft delete)
 */
export async function deleteStudent(req, res) {
  try {
    const { studentId } = req.params;
    const userId = req.user.id;

    // Get student for audit
    const studentResult = await query('SELECT * FROM students WHERE id = $1', [studentId]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Soft delete
    await query('UPDATE students SET is_active = false WHERE id = $1', [studentId]);

    // Log deletion
    await logAudit({
      userId,
      action: 'delete',
      entityType: 'student',
      entityId: studentId,
      oldValues: studentResult.rows[0],
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'Student deleted successfully' });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
}

/**
 * Add team member to student
 */
export async function addTeamMember(req, res) {
  try {
    const { studentId } = req.params;
    const { userEmail, role, canEdit = false } = req.body;
    const userId = req.user.id;

    // Find user by email
    const userResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [userEmail.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const teamMemberId = userResult.rows[0].id;

    // Add team member
    const result = await query(
      `INSERT INTO team_members (student_id, user_id, role, can_edit, can_view, added_by)
       VALUES ($1, $2, $3, $4, true, $5)
       RETURNING *`,
      [studentId, teamMemberId, role, canEdit, userId]
    );

    const teamMember = result.rows[0];

    // Log addition
    await logAudit({
      userId,
      action: 'create',
      entityType: 'team_member',
      entityId: teamMember.id,
      newValues: teamMember,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      message: 'Team member added successfully',
      teamMember
    });

  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'User is already a team member' });
    }
    console.error('Add team member error:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
}

export default {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  addTeamMember
};
