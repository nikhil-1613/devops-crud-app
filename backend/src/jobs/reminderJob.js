const cron = require('node-cron');
const pool = require('../db');

/**
 * Runs every minute. Checks for reminders due in the next 5 minutes
 * that haven't been notified yet and marks them as notified.
 * (Email / push hook can be added here later)
 */
function startReminderJob() {
  cron.schedule('* * * * *', async () => {
    try {
      const result = await pool.query(
        `UPDATE tasks
         SET notified = TRUE
         WHERE reminder_at IS NOT NULL
           AND reminder_at <= NOW() + INTERVAL '5 minutes'
           AND reminder_at > NOW() - INTERVAL '1 minute'
           AND notified = FALSE
           AND completed = FALSE
         RETURNING id, user_id, title, reminder_at`
      );

      if (result.rows.length > 0) {
        console.log(`🔔 Reminder job: ${result.rows.length} reminder(s) triggered`);
        result.rows.forEach((task) => {
          console.log(`   - Task "${task.title}" (user: ${task.user_id}) due at ${task.reminder_at}`);
          // TODO: send email/push notification here
        });
      }
    } catch (err) {
      console.error('Reminder job error:', err.message);
    }
  });

  console.log('⏰ Reminder cron job started (runs every minute)');
}

module.exports = startReminderJob;
