import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import notesReducer from './slices/notesSlice';
import tasksReducer from './slices/tasksSlice';
import uiReducer from './slices/uiSlice';
import assistantReducer from './slices/assistantSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    notes: notesReducer,
    tasks: tasksReducer,
    ui: uiReducer,
    assistant: assistantReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['dashboard/setLoading', 'notes/setLoading'],
      },
    }),
});

export default store;
