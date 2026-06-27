const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'taskspace_dev_secret';

/**
 * Express middleware — validates Bearer JWT and sets req.user = { id, email, name }.
 */
function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = requireAuth;
