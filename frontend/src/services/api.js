import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('qa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me'),
};

export const userAPI = {
  getUsers: () => API.get('/users'),
  createUser: (userData) => API.post('/users', userData),
  updateUser: (id, userData) => API.put(`/users/${id}`, userData),
};

export const projectAPI = {
  getProjects: () => API.get('/projects'),
  getProjectById: (id) => API.get(`/projects/${id}`),
  createProject: (data) => API.post('/projects', data),
  updateProject: (id, data) => API.put(`/projects/${id}`, data),
};

export const requirementAPI = {
  getRequirements: (params) => API.get('/requirements', { params }),
  createRequirement: (data) => API.post('/requirements', data),
  updateRequirement: (id, data) => API.put(`/requirements/${id}`, data),
  deleteRequirement: (id) => API.delete(`/requirements/${id}`),
};

export const testCaseAPI = {
  getTestCases: (params) => API.get('/testcases', { params }),
  createTestCase: (data) => API.post('/testcases', data),
  updateTestCase: (id, data) => API.put(`/testcases/${id}`, data),
  deleteTestCase: (id) => API.delete(`/testcases/${id}`),
};

export const executionAPI = {
  getExecutionHistory: (params) => API.get('/executions', { params }),
  recordExecution: (data) => API.post('/executions', data),
};

export const bugAPI = {
  getBugs: (params) => API.get('/bugs', { params }),
  getBugById: (id) => API.get(`/bugs/${id}`),
  createBug: (formData) => API.post('/bugs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateBug: (id, formData) => API.put(`/bugs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  addComment: (id, data) => API.post(`/bugs/${id}/comments`, data),
};

export const reportAPI = {
  getDashboardStats: () => API.get('/reports/dashboard'),
  getRTMData: (params) => API.get('/reports/rtm', { params }),
};

export const notificationAPI = {
  getNotifications: () => API.get('/notifications'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
};

export default API;
