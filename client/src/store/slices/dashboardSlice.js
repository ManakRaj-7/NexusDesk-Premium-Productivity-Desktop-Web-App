import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: {
    tasksStats: { todo: 0, doing: 0, done: 0 },
    todaysTasks: [],
    recentNotes: [],
    focusTimeToday: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalNotes: 0,
    totalTasks: 0,
  },
  activities: [],
  pinnedItems: { notes: [], tasks: [] },
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSummary: (state, action) => {
      state.data = action.payload;
    },
    setActivities: (state, action) => {
      state.activities = action.payload;
    },
    setPinnedItems: (state, action) => {
      state.pinnedItems = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setSummary, setActivities, setPinnedItems, setLoading, setError } =
  dashboardSlice.actions;
export default dashboardSlice.reducer;
