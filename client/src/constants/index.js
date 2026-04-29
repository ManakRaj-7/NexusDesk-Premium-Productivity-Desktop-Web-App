export const TASK_PRIORITIES = {
  low: { label: 'Low', color: 'slate' },
  medium: { label: 'Medium', color: 'blue' },
  high: { label: 'High', color: 'orange' },
  urgent: { label: 'Urgent', color: 'red' },
};

export const TASK_STATUS = {
  todo: { label: 'To Do', color: 'slate' },
  doing: { label: 'In Progress', color: 'primary' },
  done: { label: 'Done', color: 'green' },
};

export const FOCUS_DURATIONS = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  focus: 60,
};

export const SIDEBAR_FOLDERS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', color: 'primary' },
  { id: 'notes', label: 'Notes', icon: 'file-text', color: 'slate' },
  { id: 'tasks', label: 'Tasks', icon: 'check-square', color: 'cyan' },
  { id: 'focus', label: 'Focus Mode', icon: 'zap', color: 'accent' },
  { id: 'assistant', label: 'AI Assistant', icon: 'sparkles', color: 'violet' },
  { id: 'jobs', label: 'Jobs & Links', icon: 'link', color: 'orange' },
  { id: 'files', label: 'Files', icon: 'folder', color: 'amber' },
];

export const KEYBOARD_SHORTCUTS = {
  commandPalette: 'Ctrl+K',
  newNote: 'Ctrl+Shift+N',
  newTask: 'Ctrl+Shift+T',
  toggleSidebar: 'Ctrl+\\',
  toggleTheme: 'Ctrl+Shift+L',
};

export const API_ENDPOINTS = {
  auth: {
    signup: '/auth/signup',
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
  },
  notes: {
    list: '/notes',
    create: '/notes',
    get: (id) => `/notes/${id}`,
    update: (id) => `/notes/${id}`,
    delete: (id) => `/notes/${id}`,
    search: '/notes/search',
  },
  tasks: {
    list: '/tasks',
    create: '/tasks',
    get: (id) => `/tasks/${id}`,
    update: (id) => `/tasks/${id}`,
    delete: (id) => `/tasks/${id}`,
    filter: '/tasks/filter',
  },
  dashboard: {
    summary: '/dashboard/summary',
    activity: '/dashboard/activity',
    pinned: '/dashboard/pinned',
  },
};
