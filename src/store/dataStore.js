import { create } from 'zustand';
import { studentsAPI, goalsAPI, progressAPI } from '../services/api';

export const useDataStore = create((set, get) => ({
  // State
  students: [],
  goals: [],
  progressLogs: [],
  isLoading: false,
  error: null,

  // Students
  fetchStudents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await studentsAPI.getAll();
      set({ students: response.students, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch students',
        isLoading: false
      });
    }
  },

  createStudent: async (studentData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await studentsAPI.create(studentData);
      set((state) => ({
        students: [...state.students, response.student],
        isLoading: false
      }));
      return response.student;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to create student',
        isLoading: false
      });
      throw error;
    }
  },

  updateStudent: async (studentId, studentData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await studentsAPI.update(studentId, studentData);
      set((state) => ({
        students: state.students.map((s) =>
          s.id === studentId ? response.student : s
        ),
        isLoading: false
      }));
      return response.student;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to update student',
        isLoading: false
      });
      throw error;
    }
  },

  deleteStudent: async (studentId) => {
    set({ isLoading: true, error: null });
    try {
      await studentsAPI.delete(studentId);
      set((state) => ({
        students: state.students.filter((s) => s.id !== studentId),
        goals: state.goals.filter((g) => g.student_id !== studentId),
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to delete student',
        isLoading: false
      });
      throw error;
    }
  },

  // Goals
  fetchGoalsByStudent: async (studentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await goalsAPI.getByStudent(studentId);
      // Merge with existing goals from other students
      set((state) => ({
        goals: [
          ...state.goals.filter((g) => g.student_id !== studentId),
          ...response.goals
        ],
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch goals',
        isLoading: false
      });
    }
  },

  createGoal: async (goalData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await goalsAPI.create(goalData);
      set((state) => ({
        goals: [...state.goals, response.goal],
        isLoading: false
      }));
      return response.goal;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to create goal',
        isLoading: false
      });
      throw error;
    }
  },

  // AI Goal Generation (Cornerstone Feature!)
  generateAIGoal: async (goalData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await goalsAPI.generateAI(goalData);
      set((state) => ({
        goals: [...state.goals, response.goal],
        isLoading: false
      }));
      return response;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'AI goal generation failed',
        isLoading: false
      });
      throw error;
    }
  },

  updateGoal: async (goalId, goalData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await goalsAPI.update(goalId, goalData);
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === goalId ? response.goal : g
        ),
        isLoading: false
      }));
      return response.goal;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to update goal',
        isLoading: false
      });
      throw error;
    }
  },

  deleteGoal: async (goalId) => {
    set({ isLoading: true, error: null });
    try {
      await goalsAPI.delete(goalId);
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== goalId),
        progressLogs: state.progressLogs.filter((p) => p.goal_id !== goalId),
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to delete goal',
        isLoading: false
      });
      throw error;
    }
  },

  // Progress Logs
  fetchProgressByGoal: async (goalId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await progressAPI.getByGoal(goalId);
      // Merge with existing progress logs from other goals
      set((state) => ({
        progressLogs: [
          ...state.progressLogs.filter((p) => p.goal_id !== goalId),
          ...response.progressLogs
        ],
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fetch progress',
        isLoading: false
      });
    }
  },

  createProgressLog: async (logData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await progressAPI.create(logData);
      set((state) => ({
        progressLogs: [...state.progressLogs, response.progressLog],
        isLoading: false
      }));
      return response.progressLog;
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to create progress log',
        isLoading: false
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}));
