import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization || req.headers['x-access-token'];
  if (!authHeader) return res.status(401).json({ message: 'Token manquant' });
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Optional: validate token exists in sessions table and is not expired
    try {
      const [rows] = await pool.query('SELECT id FROM sessions WHERE token = ? AND date_expiration > CURRENT_TIMESTAMP', [token]);
      if (!rows || rows.length === 0) {
        return res.status(401).json({ message: 'Session invalide' });
      }
    } catch (e) {
      // sessions table might not exist or query failed; ignore and continue
    }

    req.user = { id: payload.userId, role: payload.role };
    req.token = token;
    return next();
  } catch (err) {
    console.error('Auth token error', err);
    // Distinguish expired token for clearer client handling
    if (err && err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré', expiredAt: err.expiredAt });
    }
    return res.status(401).json({ message: 'Token invalide' });
  }
} 