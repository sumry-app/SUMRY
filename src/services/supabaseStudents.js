import { supabase } from '../lib/supabase'

export const supabaseStudentsAPI = {
  // Get all students for current user
  getAll: async () => {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        goals:goals(count)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform to match expected format
    return {
      students: data.map(student => ({
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        grade_level: student.grade_level,
        disability_classification: student.disability_classification,
        date_of_birth: student.date_of_birth,
        student_number: student.student_number,
        active_goals_count: student.goals?.[0]?.count || 0
      }))
    }
  },

  // Get student by ID
  getById: async (studentId) => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (error) throw error

    return {
      student: {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        gradeLevel: data.grade_level,
        disabilityClassification: data.disability_classification,
        dateOfBirth: data.date_of_birth,
        studentNumber: data.student_number
      }
    }
  },

  // Create new student
  create: async (studentData) => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization')
      .eq('id', user.id)
      .single()

    const { data, error } = await supabase
      .from('students')
      .insert({
        first_name: studentData.firstName,
        last_name: studentData.lastName,
        grade_level: studentData.gradeLevel,
        disability_classification: studentData.disabilityClassification,
        date_of_birth: studentData.dateOfBirth,
        student_number: studentData.studentNumber,
        created_by: user.id,
        organization: profile?.organization
      })
      .select()
      .single()

    if (error) throw error

    return {
      message: 'Student created successfully',
      student: {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        gradeLevel: data.grade_level,
        disabilityClassification: data.disability_classification
      }
    }
  },

  // Update student
  update: async (studentId, studentData) => {
    const { error } = await supabase
      .from('students')
      .update({
        first_name: studentData.firstName,
        last_name: studentData.lastName,
        grade_level: studentData.gradeLevel,
        disability_classification: studentData.disabilityClassification,
        date_of_birth: studentData.dateOfBirth,
        student_number: studentData.studentNumber
      })
      .eq('id', studentId)

    if (error) throw error

    return { message: 'Student updated successfully' }
  },

  // Delete student (soft delete)
  delete: async (studentId) => {
    const { error } = await supabase
      .from('students')
      .update({ is_active: false })
      .eq('id', studentId)

    if (error) throw error

    return { message: 'Student deleted successfully' }
  },

  // Add team member to student
  addTeamMember: async (studentId, memberData) => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('team_members')
      .insert({
        student_id: studentId,
        user_id: memberData.userId,
        role: memberData.role,
        can_edit: memberData.canEdit || false,
        can_view: memberData.canView || true,
        added_by: user.id
      })

    if (error) throw error

    return { message: 'Team member added successfully' }
  }
}
