import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config.js';

import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import tasksRoutes from './routes/tasks.js';
import foldersRoutes from './routes/folders.js';
import dashboardRoutes from './routes/dashboard.js';
import sessionsRoutes from './routes/sessions.js';
import assistantRoutes from './routes/assistant.js';
import linksRoutes from './routes/links.js';
import settingsRoutes from './routes/settings.js';

const app = express();

// Security & Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
const apiPrefix = '/api';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/notes`, notesRoutes);
app.use(`${apiPrefix}/tasks`, tasksRoutes);
app.use(`${apiPrefix}/folders`, foldersRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/sessions`, sessionsRoutes);
app.use(`${apiPrefix}/assistant`, assistantRoutes);
app.use(`${apiPrefix}/links`, linksRoutes);
app.use(`${apiPrefix}/settings`, settingsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.path,
  });
});

// Error Handler
app.use(errorHandler);

export default app;
