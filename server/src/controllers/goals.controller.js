import { query, transaction } from '../config/database.js';
import { logAudit } from '../utils/audit.js';
import { generateIEPGoal, generateProgressPrediction } from '../services/openai.service.js';

/**
 * Get all goals for a student
 */
export async function getGoalsByStudent(req, res) {
  try {
    const { studentId } = req.params;
    const { status, area } = req.query;

    let queryText = `
      SELECT g.*,
             s.first_name || ' ' || s.last_name as student_name,
             u.first_name || ' ' || u.last_name as created_by_name,
             (SELECT COUNT(*) FROM progress_logs pl WHERE pl.goal_id = g.id) as log_count
      FROM goals g
      LEFT JOIN students s ON g.student_id = s.id
      LEFT JOIN users u ON g.created_by = u.id
      WHERE g.student_id = $1
    `;

    const params = [studentId];
    let paramIndex = 2;

    if (status) {
      queryText += ` AND g.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (area) {
      queryText += ` AND g.area = $${paramIndex}`;
      params.push(area);
      paramIndex++;
    }

    queryText += ' ORDER BY g.created_at DESC';

    const result = await query(queryText, params);

    res.json({
      goals: result.rows
    });

  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to get goals' });
  }
}

/**
 * Get single goal with progress data
 */
export async function getGoalById(req, res) {
  try {
    const { goalId } = req.params;

    // Get goal details
    const goalResult = await query(
      `SELECT g.*,
              s.first_name || ' ' || s.last_name as student_name,
              s.grade_level,
              s.disability_classification,
              u.first_name || ' ' || u.last_name as created_by_name
       FROM goals g
       LEFT JOIN students s ON g.student_id = s.id
       LEFT JOIN users u ON g.created_by = u.id
       WHERE g.id = $1`,
      [goalId]
    );

    if (goalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const goal = goalResult.rows[0];

    // Get progress logs
    const logsResult = await query(
      `SELECT pl.*,
              u.first_name || ' ' || u.last_name as logged_by_name
       FROM progress_logs pl
       LEFT JOIN users u ON pl.logged_by = u.id
       WHERE pl.goal_id = $1
       ORDER BY pl.log_date ASC`,
      [goalId]
    );

    goal.progress_logs = logsResult.rows;

    res.json({ goal });

  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ error: 'Failed to get goal' });
  }
}

/**
 * Create new goal
 */
export async function createGoal(req, res) {
  try {
    const {
      studentId,
      area,
      description,
      baselineValue,
      baselineDescription,
      targetValue,
      targetDescription,
      metricUnit,
      startDate,
      endDate,
      status = 'active'
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!studentId || !area || !description || !targetValue) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await query(
      `INSERT INTO goals (
        student_id, area, description,
        baseline_value, baseline_description,
        target_value, target_description, metric_unit,
        status, start_date, end_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        studentId, area, description,
        baselineValue, baselineDescription,
        targetValue, targetDescription, metricUnit,
        status, startDate, endDate, userId
      ]
    );

    const goal = result.rows[0];

    // Log creation
    await logAudit({
      userId,
      action: 'create',
      entityType: 'goal',
      entityId: goal.id,
      newValues: goal,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    console.log(`✅ Goal created: ${goal.id}`);

    res.status(201).json({
      message: 'Goal created successfully',
      goal
    });

  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
}

/**
 * Generate goal using AI (Cornerstone Feature!)
 */
export async function generateAIGoal(req, res) {
  try {
    const {
      studentId,
      goalArea,
      currentLevel,
      additionalContext
    } = req.body;

    const userId = req.user.id;

    // Get student info
    const studentResult = await query(
      'SELECT first_name, last_name, grade_level, disability_classification FROM students WHERE id = $1',
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = studentResult.rows[0];

    console.log(`🤖 Generating AI goal for ${student.first_name} ${student.last_name}`);

    // Generate goal using OpenAI
    const aiResult = await generateIEPGoal({
      studentName: `${student.first_name} ${student.last_name}`,
      gradeLevel: student.grade_level,
      disability: student.disability_classification,
      goalArea,
      currentLevel,
      additionalContext,
      userId,
      studentId
    });

    if (!aiResult.success) {
      return res.status(500).json({ error: 'AI goal generation failed' });
    }

    // Create the goal in database
    const goalData = aiResult.goal;
    const result = await query(
      `INSERT INTO goals (
        student_id, area, description,
        baseline_value, baseline_description,
        target_value, target_description, metric_unit,
        ai_generated, ai_prompt, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10)
      RETURNING *`,
      [
        studentId,
        goalArea,
        goalData.goal_description,
        goalData.baseline_value,
        goalData.baseline_description,
        goalData.target_value,
        goalData.target_description,
        goalData.metric_unit,
        currentLevel + (additionalContext ? ` | ${additionalContext}` : ''),
        userId
      ]
    );

    const goal = result.rows[0];

    // Log creation
    await logAudit({
      userId,
      action: 'create',
      entityType: 'goal',
      entityId: goal.id,
      newValues: { ...goal, ai_generated: true },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    console.log(`✅ AI-generated goal created: ${goal.id}`);

    res.status(201).json({
      message: 'AI goal generated successfully',
      goal,
      aiMetadata: {
        tokensUsed: aiResult.tokensUsed,
        suggestedAccommodations: goalData.suggested_accommodations,
        progressMonitoringStrategy: goalData.progress_monitoring_strategy,
        recommendedFrequency: goalData.recommended_frequency,
        researchBasis: goalData.research_basis,
        isFallback: aiResult.isFallback
      }
    });

  } catch (error) {
    console.error('AI goal generation error:', error);
    res.status(500).json({ error: error.message || 'AI goal generation failed' });
  }
}

/**
 * Update goal
 */
export async function updateGoal(req, res) {
  try {
    const { goalId } = req.params;
    const userId = req.user.id;

    // Get old values for audit
    const oldResult = await query('SELECT * FROM goals WHERE id = $1', [goalId]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    const oldValues = oldResult.rows[0];

    // Update goal
    const {
      description,
      baselineValue,
      baselineDescription,
      targetValue,
      targetDescription,
      metricUnit,
      status,
      startDate,
      endDate
    } = req.body;

    const result = await query(
      `UPDATE goals SET
        description = COALESCE($1, description),
        baseline_value = COALESCE($2, baseline_value),
        baseline_description = COALESCE($3, baseline_description),
        target_value = COALESCE($4, target_value),
        target_description = COALESCE($5, target_description),
        metric_unit = COALESCE($6, metric_unit),
        status = COALESCE($7, status),
        start_date = COALESCE($8, start_date),
        end_date = COALESCE($9, end_date)
       WHERE id = $10
       RETURNING *`,
      [description, baselineValue, baselineDescription, targetValue, targetDescription,
       metricUnit, status, startDate, endDate, goalId]
    );

    const goal = result.rows[0];

    // Log update
    await logAudit({
      userId,
      action: 'update',
      entityType: 'goal',
      entityId: goalId,
      oldValues,
      newValues: goal,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      message: 'Goal updated successfully',
      goal
    });

  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
}

/**
 * Delete goal
 */
export async function deleteGoal(req, res) {
  try {
    const { goalId } = req.params;
    const userId = req.user.id;

    // Get goal for audit
    const goalResult = await query('SELECT * FROM goals WHERE id = $1', [goalId]);
    if (goalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Delete goal (cascade will delete progress logs)
    await query('DELETE FROM goals WHERE id = $1', [goalId]);

    // Log deletion
    await logAudit({
      userId,
      action: 'delete',
      entityType: 'goal',
      entityId: goalId,
      oldValues: goalResult.rows[0],
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'Goal deleted successfully' });

  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
}

/**
 * Get AI progress prediction
 */
export async function getProgressPrediction(req, res) {
  try {
    const { goalId } = req.params;
    const userId = req.user.id;

    // Get goal and progress data
    const goalResult = await query(
      'SELECT * FROM goals WHERE id = $1',
      [goalId]
    );

    if (goalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const goal = goalResult.rows[0];

    const logsResult = await query(
      `SELECT log_date as date, score FROM progress_logs
       WHERE goal_id = $1
       ORDER BY log_date ASC`,
      [goalId]
    );

    if (logsResult.rows.length < 3) {
      return res.status(400).json({
        error: 'Insufficient data',
        message: 'At least 3 progress logs required for prediction'
      });
    }

    // Generate prediction using AI
    const prediction = await generateProgressPrediction({
      goalDescription: goal.description,
      baselineValue: goal.baseline_value,
      targetValue: goal.target_value,
      progressData: logsResult.rows,
      userId,
      studentId: goal.student_id
    });

    res.json({
      prediction: prediction.analysis,
      tokensUsed: prediction.tokensUsed
    });

  } catch (error) {
    console.error('Progress prediction error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate prediction' });
  }
}

export default {
  getGoalsByStudent,
  getGoalById,
  createGoal,
  generateAIGoal,
  updateGoal,
  deleteGoal,
  getProgressPrediction
};
