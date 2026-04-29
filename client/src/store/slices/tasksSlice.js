import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  selectedTask: null,
  filters: { status: null, priority: null, sortBy: 'dueDate' },
  pagination: { page: 1, limit: 20, total: 0 },
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.items = action.payload;
    },
    addTask: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.items.findIndex(t => t._id === action.payload._id);
      if (index >= 0) {
        state.items[index] = action.payload;
      }
    },
    deleteTask: (state, action) => {
      state.items = state.items.filter(t => t._id !== action.payload);
    },
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  setSelectedTask,
  setFilters,
  setPagination,
  setLoading,
  setError,
} = tasksSlice.actions;

export default tasksSlice.reducer;
