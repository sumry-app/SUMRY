import { query } from '../config/database.js';
import { logAudit } from '../utils/audit.js';

/**
 * Get progress logs for a goal
 */
export async function getProgressByGoal(req, res) {
  try {
    const { goalId } = req.params;
    const { limit = 100 } = req.query;

    const result = await query(
      `SELECT pl.*,
              u.first_name || ' ' || u.last_name as logged_by_name
       FROM progress_logs pl
       LEFT JOIN users u ON pl.logged_by = u.id
       WHERE pl.goal_id = $1
       ORDER BY pl.log_date DESC
       LIMIT $2`,
      [goalId, limit]
    );

    res.json({
      progressLogs: result.rows
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress logs' });
  }
}

/**
 * Create progress log
 */
export async function createProgressLog(req, res) {
  try {
    const {
      goalId,
      logDate,
      score,
      notes,
      accommodationIds = []
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!goalId || !logDate || score === undefined || score === null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create progress log
    const result = await query(
      `INSERT INTO progress_logs (goal_id, log_date, score, notes, logged_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [goalId, logDate, score, notes, userId]
    );

    const progressLog = result.rows[0];

    // Add accommodations if provided
    if (accommodationIds.length > 0) {
      for (const accommodationId of accommodationIds) {
        await query(
          `INSERT INTO progress_log_accommodations (progress_log_id, accommodation_id)
           VALUES ($1, $2)`,
          [progressLog.id, accommodationId]
        );
      }
    }

    // Log creation
    await logAudit({
      userId,
      action: 'create',
      entityType: 'progress_log',
      entityId: progressLog.id,
      newValues: progressLog,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    console.log(`✅ Progress log created for goal: ${goalId}`);

    res.status(201).json({
      message: 'Progress log created successfully',
      progressLog
    });

  } catch (error) {
    console.error('Create progress log error:', error);
    res.status(500).json({ error: 'Failed to create progress log' });
  }
}

/**
 * Update progress log
 */
export async function updateProgressLog(req, res) {
  try {
    const { logId } = req.params;
    const userId = req.user.id;

    // Get old values for audit
    const oldResult = await query('SELECT * FROM progress_logs WHERE id = $1', [logId]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Progress log not found' });
    }

    const {
      logDate,
      score,
      notes
    } = req.body;

    const result = await query(
      `UPDATE progress_logs SET
        log_date = COALESCE($1, log_date),
        score = COALESCE($2, score),
        notes = COALESCE($3, notes)
       WHERE id = $4
       RETURNING *`,
      [logDate, score, notes, logId]
    );

    const progressLog = result.rows[0];

    // Log update
    await logAudit({
      userId,
      action: 'update',
      entityType: 'progress_log',
      entityId: logId,
      oldValues: oldResult.rows[0],
      newValues: progressLog,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      message: 'Progress log updated successfully',
      progressLog
    });

  } catch (error) {
    console.error('Update progress log error:', error);
    res.status(500).json({ error: 'Failed to update progress log' });
  }
}

/**
 * Delete progress log
 */
export async function deleteProgressLog(req, res) {
  try {
    const { logId } = req.params;
    const userId = req.user.id;

    // Get log for audit
    const logResult = await query('SELECT * FROM progress_logs WHERE id = $1', [logId]);
    if (logResult.rows.length === 0) {
      return res.status(404).json({ error: 'Progress log not found' });
    }

    // Delete log
    await query('DELETE FROM progress_logs WHERE id = $1', [logId]);

    // Log deletion
    await logAudit({
      userId,
      action: 'delete',
      entityType: 'progress_log',
      entityId: logId,
      oldValues: logResult.rows[0],
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'Progress log deleted successfully' });

  } catch (error) {
    console.error('Delete progress log error:', error);
    res.status(500).json({ error: 'Failed to delete progress log' });
  }
}

/**
 * Get analytics for student
 */
export async function getStudentAnalytics(req, res) {
  try {
    const { studentId } = req.params;

    // Get goal statistics
    const goalsStats = await query(
      `SELECT
         COUNT(*) as total_goals,
         COUNT(*) FILTER (WHERE status = 'active') as active_goals,
         COUNT(*) FILTER (WHERE status = 'completed') as completed_goals,
         COUNT(*) FILTER (WHERE ai_generated = true) as ai_generated_goals
       FROM goals WHERE student_id = $1`,
      [studentId]
    );

    // Get progress logs count
    const logsStats = await query(
      `SELECT COUNT(*) as total_logs
       FROM progress_logs pl
       JOIN goals g ON pl.goal_id = g.id
       WHERE g.student_id = $1`,
      [studentId]
    );

    // Get recent activity
    const recentLogs = await query(
      `SELECT pl.*, g.description as goal_description, g.area as goal_area
       FROM progress_logs pl
       JOIN goals g ON pl.goal_id = g.id
       WHERE g.student_id = $1
       ORDER BY pl.log_date DESC
       LIMIT 10`,
      [studentId]
    );

    // Get goal progress summary
    const goalProgress = await query(
      `SELECT
         g.id,
         g.area,
         g.description,
         g.baseline_value,
         g.target_value,
         g.metric_unit,
         COUNT(pl.id) as log_count,
         AVG(pl.score) as avg_score,
         MAX(pl.score) as max_score,
         MIN(pl.score) as min_score
       FROM goals g
       LEFT JOIN progress_logs pl ON g.id = pl.goal_id
       WHERE g.student_id = $1 AND g.status = 'active'
       GROUP BY g.id
       ORDER BY g.created_at DESC`,
      [studentId]
    );

    res.json({
      analytics: {
        goals: goalsStats.rows[0],
        logs: logsStats.rows[0],
        recentActivity: recentLogs.rows,
        goalProgress: goalProgress.rows
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
}

export default {
  getProgressByGoal,
  createProgressLog,
  updateProgressLog,
  deleteProgressLog,
  getStudentAnalytics
};
