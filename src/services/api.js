// Supabase-powered API layer
// This replaces the old Node.js/Express backend with Supabase

import { supabaseAuthAPI } from './supabaseAuth'
import { supabaseStudentsAPI } from './supabaseStudents'
import { supabaseGoalsAPI } from './supabaseGoals'
import { supabaseProgressAPI } from './supabaseProgress'

// Re-export Supabase APIs with the same interface as before
export const authAPI = {
  login: (email, password) => supabaseAuthAPI.login(email, password),
  register: (userData) => supabaseAuthAPI.register(userData),
  getProfile: () => supabaseAuthAPI.getProfile(),
  updateProfile: (userData) => supabaseAuthAPI.updateProfile(userData),
  changePassword: (currentPassword, newPassword) =>
    supabaseAuthAPI.changePassword(currentPassword, newPassword)
};

// Students API
export const studentsAPI = {
  getAll: () => supabaseStudentsAPI.getAll(),
  getById: (studentId) => supabaseStudentsAPI.getById(studentId),
  create: (studentData) => supabaseStudentsAPI.create(studentData),
  update: (studentId, studentData) => supabaseStudentsAPI.update(studentId, studentData),
  delete: (studentId) => supabaseStudentsAPI.delete(studentId),
  addTeamMember: (studentId, memberData) => supabaseStudentsAPI.addTeamMember(studentId, memberData)
};

// Goals API
export const goalsAPI = {
  getByStudent: (studentId) => supabaseGoalsAPI.getByStudent(studentId),
  getById: (goalId) => supabaseGoalsAPI.getById(goalId),
  create: (goalData) => supabaseGoalsAPI.create(goalData),
  generateAI: (aiData) => supabaseGoalsAPI.generateAI(aiData), // Will need Edge Function
  update: (goalId, goalData) => supabaseGoalsAPI.update(goalId, goalData),
  delete: (goalId) => supabaseGoalsAPI.delete(goalId),
  getProgressPrediction: (goalId) => supabaseGoalsAPI.getProgressPrediction(goalId)
};

// Progress API
export const progressAPI = {
  getByGoal: (goalId) => supabaseProgressAPI.getByGoal(goalId),
  create: (logData) => supabaseProgressAPI.create(logData),
  update: (logId, logData) => supabaseProgressAPI.update(logId, logData),
  delete: (logId) => supabaseProgressAPI.delete(logId),
  getAnalytics: (studentId) => supabaseProgressAPI.getAnalytics(studentId)
};

// Export empty default for backward compatibility
export default {};
