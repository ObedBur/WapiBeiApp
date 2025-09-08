import express from 'express';
import pool from '../config/database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// GET /api/users?query=... - search users (protected)
router.get('/', authMiddleware, async (req, res) => {
  const q = (req.query.query || '').trim();
  try {
    try {
      if (!q) {
        const [rows] = await pool.query('SELECT id, nom, prenom, email, photo_url AS avatar FROM users LIMIT 50');
        return res.json(rows || []);
      }
      const like = `%${q.replace(/%/g, '')}%`;
      const [rows] = await pool.query('SELECT id, nom, prenom, email, photo_url AS avatar FROM users WHERE nom LIKE ? OR prenom LIKE ? OR email LIKE ? LIMIT 50', [like, like, like]);
      return res.json(rows || []);
    } catch (e) {
      // fallback: empty
      return res.json([]);
    }
  } catch (err) {
    console.error('Error searching users', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router; 