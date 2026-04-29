import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  selectedNote: null,
  filters: { search: '', tags: [] },
  pagination: { page: 1, limit: 20, total: 0 },
  loading: false,
  error: null,
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setNotes: (state, action) => {
      state.items = action.payload;
    },
    addNote: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateNote: (state, action) => {
      const index = state.items.findIndex(n => n._id === action.payload._id);
      if (index >= 0) {
        state.items[index] = action.payload;
      }
    },
    deleteNote: (state, action) => {
      state.items = state.items.filter(n => n._id !== action.payload);
    },
    setSelectedNote: (state, action) => {
      state.selectedNote = action.payload;
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
  setNotes,
  addNote,
  updateNote,
  deleteNote,
  setSelectedNote,
  setFilters,
  setPagination,
  setLoading,
  setError,
} = notesSlice.actions;

export default notesSlice.reducer;
