const pool = require('../db');
const path = require('path');

// ─── GET /api/profile ─────────────────────────────────────────────────────────
async function getProfile(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id],
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('getProfile:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// ─── PUT /api/profile ─────────────────────────────────────────────────────────
async function updateProfile(req, res) {
  const { name, email } = req.body;

  if (!name && !email) {
    return res.status(400).json({ error: 'Provide at least name or email to update' });
  }

  try {
    // Guard against duplicate email
    if (email) {
      const dup = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), req.user.id],
      );
      if (dup.rows.length) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    const { rows } = await pool.query(
      `UPDATE users
       SET name  = COALESCE($1, name),
           email = COALESCE($2, email)
       WHERE id  = $3
       RETURNING id, name, email, avatar_url, created_at`,
      [name?.trim() || null, email?.toLowerCase() || null, req.user.id],
    );
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('updateProfile:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// ─── POST /api/profile/avatar ─────────────────────────────────────────────────
async function uploadAvatar(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const avatarUrl = `/uploads/${req.file.filename}`;

  try {
    const { rows } = await pool.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, name, email, avatar_url, created_at',
      [avatarUrl, req.user.id],
    );
    res.json({ user: rows[0] });
  } catch (err) {
    console.error('uploadAvatar:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getProfile, updateProfile, uploadAvatar };
