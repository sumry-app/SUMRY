import { supabase } from '../lib/supabase'

export const supabaseGoalsAPI = {
  // Get goals by student
  getByStudent: async (studentId) => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      goals: data.map(goal => ({
        id: goal.id,
        student_id: goal.student_id,
        area: goal.area,
        description: goal.description,
        baseline_value: goal.baseline_value,
        baseline_description: goal.baseline_description,
        target_value: goal.target_value,
        target_description: goal.target_description,
        metric_unit: goal.metric_unit,
        status: goal.status,
        start_date: goal.start_date,
        end_date: goal.end_date,
        ai_generated: goal.ai_generated,
        created_at: goal.created_at
      }))
    }
  },

  // Get goal by ID
  getById: async (goalId) => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single()

    if (error) throw error

    return {
      goal: {
        id: data.id,
        studentId: data.student_id,
        area: data.area,
        description: data.description,
        baselineValue: data.baseline_value,
        baselineDescription: data.baseline_description,
        targetValue: data.target_value,
        targetDescription: data.target_description,
        metricUnit: data.metric_unit,
        status: data.status,
        startDate: data.start_date,
        endDate: data.end_date,
        aiGenerated: data.ai_generated
      }
    }
  },

  // Create new goal
  create: async (goalData) => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('goals')
      .insert({
        student_id: goalData.studentId,
        area: goalData.area,
        description: goalData.description,
        baseline_value: goalData.baselineValue,
        baseline_description: goalData.baselineDescription,
        target_value: goalData.targetValue,
        target_description: goalData.targetDescription,
        metric_unit: goalData.metricUnit,
        status: goalData.status || 'active',
        start_date: goalData.startDate,
        end_date: goalData.endDate,
        ai_generated: goalData.aiGenerated || false,
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    return {
      message: 'Goal created successfully',
      goal: {
        id: data.id,
        studentId: data.student_id,
        area: data.area,
        description: data.description,
        baselineValue: data.baseline_value,
        targetValue: data.target_value,
        metricUnit: data.metric_unit,
        status: data.status
      }
    }
  },

  // AI Goal Generation - TODO: Will need Edge Function
  generateAI: async (aiData) => {
    // For now, this will throw an error directing to set up Edge Function
    throw new Error('AI Goal Generation requires Supabase Edge Function setup. This feature will be available after Edge Function deployment.')
  },

  // Update goal
  update: async (goalId, goalData) => {
    const { error } = await supabase
      .from('goals')
      .update({
        area: goalData.area,
        description: goalData.description,
        baseline_value: goalData.baselineValue,
        baseline_description: goalData.baselineDescription,
        target_value: goalData.targetValue,
        target_description: goalData.targetDescription,
        metric_unit: goalData.metricUnit,
        status: goalData.status,
        start_date: goalData.startDate,
        end_date: goalData.endDate
      })
      .eq('id', goalId)

    if (error) throw error

    return { message: 'Goal updated successfully' }
  },

  // Delete goal
  delete: async (goalId) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (error) throw error

    return { message: 'Goal deleted successfully' }
  },

  // Get progress prediction - TODO: Will need Edge Function for AI
  getProgressPrediction: async (goalId) => {
    // Simple linear regression based on existing data
    const { data: logs, error } = await supabase
      .from('progress_logs')
      .select('log_date, score')
      .eq('goal_id', goalId)
      .order('log_date', { ascending: true })

    if (error) throw error

    if (logs.length < 2) {
      return {
        prediction: null,
        message: 'Not enough data for prediction'
      }
    }

    // Simple linear regression calculation
    const n = logs.length
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0

    logs.forEach((log, index) => {
      const x = index
      const y = parseFloat(log.score)
      sumX += x
      sumY += y
      sumXY += x * y
      sumX2 += x * x
    })

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Predict next 4 data points
    const predictions = []
    for (let i = 0; i < 4; i++) {
      const x = n + i
      predictions.push({
        value: slope * x + intercept,
        index: x
      })
    }

    return {
      prediction: {
        trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
        slope,
        predictions
      }
    }
  }
}
