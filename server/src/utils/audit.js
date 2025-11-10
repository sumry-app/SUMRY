import { query } from '../config/database.js';

/**
 * Log audit trail for compliance and security
 */
export async function logAudit(params) {
  const {
    userId,
    action,
    entityType,
    entityId,
    oldValues = null,
    newValues = null,
    ipAddress = null,
    userAgent = null
  } = params;

  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        action,
        entityType,
        entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent
      ]
    );
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error('Audit log error:', error);
  }
}

/**
 * Get audit logs for an entity
 */
export async function getAuditLogs(entityType, entityId, limit = 100) {
  try {
    const result = await query(
      `SELECT al.*, u.email, u.first_name, u.last_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.entity_type = $1 AND al.entity_id = $2
       ORDER BY al.created_at DESC
       LIMIT $3`,
      [entityType, entityId, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Get audit logs error:', error);
    return [];
  }
}

/**
 * Get user activity logs
 */
export async function getUserActivity(userId, limit = 100) {
  try {
    const result = await query(
      `SELECT * FROM audit_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Get user activity error:', error);
    return [];
  }
}

export default {
  logAudit,
  getAuditLogs,
  getUserActivity
};
