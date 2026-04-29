import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: !localStorage.getItem('sidebarCollapsed'),
  theme: localStorage.getItem('theme') || 'dark',
  commandPaletteOpen: false,
  activeSection: 'dashboard',
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
      localStorage.setItem('sidebarCollapsed', !state.sidebarOpen);
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
      localStorage.setItem('sidebarCollapsed', !action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleCommandPalette: (state) => {
      state.commandPaletteOpen = !state.commandPaletteOpen;
    },
    setCommandPaletteOpen: (state, action) => {
      state.commandPaletteOpen = action.payload;
    },
    setActiveSection: (state, action) => {
      state.activeSection = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleTheme,
  setTheme,
  toggleCommandPalette,
  setCommandPaletteOpen,
  setActiveSection,
  addNotification,
  removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
