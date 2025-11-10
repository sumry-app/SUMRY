import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('sumry-auth');
    if (authData) {
      const { token } = JSON.parse(authData).state;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('sumry-auth');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (userData) =>
    api.post('/auth/register', userData),

  getProfile: () =>
    api.get('/auth/profile'),

  updateProfile: (userData) =>
    api.put('/auth/profile', userData),

  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword })
};

// Students API
export const studentsAPI = {
  getAll: () =>
    api.get('/students'),

  getById: (studentId) =>
    api.get(`/students/${studentId}`),

  create: (studentData) =>
    api.post('/students', studentData),

  update: (studentId, studentData) =>
    api.put(`/students/${studentId}`, studentData),

  delete: (studentId) =>
    api.delete(`/students/${studentId}`),

  addTeamMember: (studentId, memberData) =>
    api.post(`/students/${studentId}/team`, memberData)
};

// Goals API
export const goalsAPI = {
  getByStudent: (studentId) =>
    api.get(`/goals/student/${studentId}`),

  getById: (goalId) =>
    api.get(`/goals/${goalId}`),

  create: (goalData) =>
    api.post('/goals', goalData),

  // AI Goal Generation - Cornerstone Feature!
  generateAI: (aiData) =>
    api.post('/goals/generate-ai', aiData),

  update: (goalId, goalData) =>
    api.put(`/goals/${goalId}`, goalData),

  delete: (goalId) =>
    api.delete(`/goals/${goalId}`),

  getProgressPrediction: (goalId) =>
    api.get(`/goals/${goalId}/predict`)
};

// Progress API
export const progressAPI = {
  getByGoal: (goalId) =>
    api.get(`/progress/goal/${goalId}`),

  create: (logData) =>
    api.post('/progress', logData),

  update: (logId, logData) =>
    api.put(`/progress/${logId}`, logData),

  delete: (logId) =>
    api.delete(`/progress/${logId}`),

  getAnalytics: (studentId) =>
    api.get(`/progress/analytics/${studentId}`)
};

export default api;
