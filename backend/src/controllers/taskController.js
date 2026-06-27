const pool = require('../db');

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
async function getTasks(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM tasks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id],
    );
    res.json({ tasks: rows });
  } catch (err) {
    console.error('getTasks:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
async function createTask(req, res) {
  const { title, description, priority, due_date, reminder_at } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO tasks (user_id, title, description, priority, due_date, reminder_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.user.id,
        title.trim(),
        description || null,
        priority   || 'medium',
        due_date   || null,
        reminder_at || null,
      ],
    );
    res.status(201).json({ task: rows[0] });
  } catch (err) {
    console.error('createTask:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
async function updateTask(req, res) {
  const { id } = req.params;
  const { title, description, priority, due_date, reminder_at } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE tasks
       SET title       = COALESCE($1, title),
           description = COALESCE($2, description),
           priority    = COALESCE($3, priority),
           due_date    = $4,
           reminder_at = $5,
           notified    = CASE
                           WHEN $5 IS DISTINCT FROM reminder_at THEN FALSE
                           ELSE notified
                         END
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        title       || null,
        description || null,
        priority    || null,
        due_date    || null,
        reminder_at || null,
        id,
        req.user.id,
      ],
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ task: rows[0] });
  } catch (err) {
    console.error('updateTask:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// ─── PATCH /api/tasks/:id/complete ───────────────────────────────────────────
async function toggleComplete(req, res) {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `UPDATE tasks
       SET completed = NOT completed
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id],
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ task: rows[0] });
  } catch (err) {
    console.error('toggleComplete:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
async function deleteTask(req, res) {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id],
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('deleteTask:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getTasks, createTask, updateTask, toggleComplete, deleteTask };
