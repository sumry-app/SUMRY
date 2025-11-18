import { supabase } from '../lib/supabase'

export const supabaseProgressAPI = {
  // Get progress logs by goal
  getByGoal: async (goalId) => {
    const { data, error } = await supabase
      .from('progress_logs')
      .select('*')
      .eq('goal_id', goalId)
      .order('log_date', { ascending: false })

    if (error) throw error

    return {
      logs: data.map(log => ({
        id: log.id,
        goal_id: log.goal_id,
        log_date: log.log_date,
        score: log.score,
        notes: log.notes,
        created_at: log.created_at
      }))
    }
  },

  // Create progress log
  create: async (logData) => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('progress_logs')
      .insert({
        goal_id: logData.goalId,
        log_date: logData.logDate,
        score: logData.score,
        notes: logData.notes,
        logged_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    // Handle accommodations if provided
    if (logData.accommodationIds && logData.accommodationIds.length > 0) {
      const accommodationRecords = logData.accommodationIds.map(accId => ({
        progress_log_id: data.id,
        accommodation_id: accId
      }))

      await supabase
        .from('progress_log_accommodations')
        .insert(accommodationRecords)
    }

    return {
      message: 'Progress logged successfully',
      log: {
        id: data.id,
        goalId: data.goal_id,
        logDate: data.log_date,
        score: data.score,
        notes: data.notes
      }
    }
  },

  // Update progress log
  update: async (logId, logData) => {
    const { error } = await supabase
      .from('progress_logs')
      .update({
        log_date: logData.logDate,
        score: logData.score,
        notes: logData.notes
      })
      .eq('id', logId)

    if (error) throw error

    return { message: 'Progress log updated successfully' }
  },

  // Delete progress log
  delete: async (logId) => {
    const { error } = await supabase
      .from('progress_logs')
      .delete()
      .eq('id', logId)

    if (error) throw error

    return { message: 'Progress log deleted successfully' }
  },

  // Get analytics for a student
  getAnalytics: async (studentId) => {
    // Get all goals for student
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('id, area, status')
      .eq('student_id', studentId)

    if (goalsError) throw goalsError

    // Get total progress logs count
    const goalIds = goals.map(g => g.id)

    let totalLogs = 0
    if (goalIds.length > 0) {
      const { count, error: logsError } = await supabase
        .from('progress_logs')
        .select('*', { count: 'exact', head: true })
        .in('goal_id', goalIds)

      if (logsError) throw logsError
      totalLogs = count || 0
    }

    // Calculate goal stats
    const totalGoals = goals.length
    const activeGoals = goals.filter(g => g.status === 'active').length
    const completedGoals = goals.filter(g => g.status === 'completed').length

    // Get recent activity
    const { data: recentLogs, error: recentError } = await supabase
      .from('progress_logs')
      .select(`
        *,
        goals:goal_id (
          area,
          description
        )
      `)
      .in('goal_id', goalIds)
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentError) throw recentError

    return {
      analytics: {
        goals: {
          total_goals: totalGoals,
          active_goals: activeGoals,
          completed_goals: completedGoals
        },
        logs: {
          total_logs: totalLogs
        },
        recentActivity: recentLogs.map(log => ({
          id: log.id,
          date: log.log_date,
          score: log.score,
          goalArea: log.goals?.area,
          goalDescription: log.goals?.description
        })),
        goalProgress: goals.map(goal => ({
          id: goal.id,
          area: goal.area,
          status: goal.status
        }))
      }
    }
  }
}
