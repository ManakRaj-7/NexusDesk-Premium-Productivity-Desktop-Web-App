import api from './api';

export const authService = {
  signup: (email, username, password) =>
    api.post('/auth/signup', { email, username, password }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  logout: () =>
    api.post('/auth/logout'),

  getProfile: () =>
    api.get('/auth/profile'),

  updateProfile: (data) =>
    api.put('/auth/profile', data),
};

export const notesService = {
  create: (data) =>
    api.post('/notes', data),

  getAll: (page = 1, limit = 20, filters = {}) =>
    api.get('/notes', { params: { page, limit, ...filters } }),

  getById: (id) =>
    api.get(`/notes/${id}`),

  update: (id, data) =>
    api.put(`/notes/${id}`, data),

  delete: (id) =>
    api.delete(`/notes/${id}`),

  search: (query) =>
    api.get('/notes/search', { params: { q: query } }),
};

export const tasksService = {
  create: (data) =>
    api.post('/tasks', data),

  getAll: (page = 1, limit = 20, filters = {}) =>
    api.get('/tasks', { params: { page, limit, ...filters } }),

  getById: (id) =>
    api.get(`/tasks/${id}`),

  update: (id, data) =>
    api.put(`/tasks/${id}`, data),

  delete: (id) =>
    api.delete(`/tasks/${id}`),

  filter: (filters) =>
    api.get('/tasks/filter', { params: filters }),
};

export const dashboardService = {
  getSummary: () =>
    api.get('/dashboard/summary'),

  getActivity: (limit = 20) =>
    api.get('/dashboard/activity', { params: { limit } }),

  getPinned: () =>
    api.get('/dashboard/pinned'),
};

export const assistantService = {
  sendMessage: (message, conversationId = null) =>
    api.post('/assistant/chat', { message, conversationId }),

  getConversations: () =>
    api.get('/assistant/conversations'),

  getConversation: (id) =>
    api.get(`/assistant/conversations/${id}`),

  deleteConversation: (id) =>
    api.delete(`/assistant/conversations/${id}`),
};

export const linksService = {
  create: (data) =>
    api.post('/links', data),

  getAll: (page = 1, limit = 20, filters = {}) =>
    api.get('/links', { params: { page, limit, ...filters } }),

  getById: (id) =>
    api.get(`/links/${id}`),

  update: (id, data) =>
    api.put(`/links/${id}`, data),

  delete: (id) =>
    api.delete(`/links/${id}`),
};

export const sessionsService = {
  create: (data) =>
    api.post('/sessions', data),

  getStats: (days = 7) =>
    api.get('/sessions/stats', { params: { days } }),

  delete: (id) =>
    api.delete(`/sessions/${id}`),
};

export const settingsService = {
  get: () =>
    api.get('/settings'),

  update: (data) =>
    api.put('/settings', data),
};
