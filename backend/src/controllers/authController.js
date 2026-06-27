const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../db');

const JWT_SECRET  = process.env.JWT_SECRET || 'taskspace_dev_secret';
const JWT_EXPIRES = '7d';

// ─── POST /api/auth/register ──────────────────────────────────────────────────
async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash   = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, avatar_url, created_at`,
      [name.trim(), email.toLowerCase(), hash],
    );

    const user  = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES },
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('register:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, password_hash, avatar_url FROM users WHERE email = $1',
      [email.toLowerCase()],
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user  = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES },
    );

    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('login:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
async function me(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id],
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('me:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { register, login, me };
