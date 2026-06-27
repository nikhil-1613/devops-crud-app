require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const migrate = require('./db/migrate');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const profileRoutes = require('./routes/profile');
const reminderRoutes = require('./routes/reminders');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reminders', reminderRoutes);

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ─── Boot ────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await migrate();
    app.listen(PORT, () => {
      console.log(`🚀 TaskSpace API  →  http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup failed:', err.message);
    process.exit(1);
  }
}

start();