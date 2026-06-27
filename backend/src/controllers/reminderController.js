const pool = require('../db');

// ─── GET /api/reminders/upcoming ─────────────────────────────────────────────
// Tasks with reminders in the next 24 hours that haven't been notified
async function getUpcomingReminders(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM tasks
       WHERE user_id    = $1
         AND reminder_at IS NOT NULL
         AND reminder_at >  NOW()
         AND reminder_at <= NOW() + INTERVAL '24 hours'
         AND completed   = FALSE
       ORDER BY reminder_at ASC`,
      [req.user.id],
    );
    res.json({ reminders: rows });
  } catch (err) {
    console.error('getUpcomingReminders:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// ─── GET /api/reminders ───────────────────────────────────────────────────────
// All tasks that have a reminder set and are not completed
async function getAllReminders(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM tasks
       WHERE user_id    = $1
         AND reminder_at IS NOT NULL
         AND completed   = FALSE
       ORDER BY reminder_at ASC`,
      [req.user.id],
    );
    res.json({ reminders: rows });
  } catch (err) {
    console.error('getAllReminders:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getUpcomingReminders, getAllReminders };
