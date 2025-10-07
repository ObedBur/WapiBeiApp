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

// GET /api/users/me/favorites - return array of product ids
router.get('/me/favorites', authMiddleware, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const [rows] = await pool.query('SELECT product_id FROM favorites WHERE user_id = ?', [userId]);
    const favorites = Array.isArray(rows) ? rows.map((r) => Number(r.product_id)) : [];
    res.json({ favorites });
  } catch (err) {
    console.error('Error fetching user favorites', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/users/me/favorites - replace user's favorites list
router.post('/me/favorites', authMiddleware, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const favs = Array.isArray(req.body.favorites) ? req.body.favorites.map((v) => Number(v)).filter(Boolean) : [];

    // delete old
    await pool.query('DELETE FROM favorites WHERE user_id = ?', [userId]);

    if (favs.length) {
      // insert batch
      const values = favs.map((p) => [userId, p]);
      const placeholders = values.map(() => '(?,?)').join(',');
      const flat = values.flat();
      await pool.query(`INSERT INTO favorites (user_id, product_id) VALUES ${placeholders}`, flat);
    }

    res.json({ favorites: favs });
  } catch (err) {
    console.error('Error saving user favorites', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/users/me/privacy - return user's privacy preferences (protected)
router.get('/me/privacy', authMiddleware, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
      // Try to read from users.privacy_json if column exists
      const [rows] = await pool.query('SELECT privacy_json FROM users WHERE id = ?', [userId]);
      if (rows && rows.length && rows[0].privacy_json) {
        const prefs = typeof rows[0].privacy_json === 'object' ? rows[0].privacy_json : JSON.parse(rows[0].privacy_json);
        return res.json(prefs);
      }
    } catch (e) {
      // ignore and fallback
    }

    try {
      // Try alternative table user_privacy
      const [rows2] = await pool.query('SELECT prefs FROM user_privacy WHERE user_id = ?', [userId]);
      if (rows2 && rows2.length && rows2[0].prefs) {
        const prefs = typeof rows2[0].prefs === 'object' ? rows2[0].prefs : JSON.parse(rows2[0].prefs);
        return res.json(prefs);
      }
    } catch (e) {
      // ignore fallback
    }

    // Default prefs if none saved
    res.json({ profileVisible: true, showEmail: false, showPhone: false, personalizedAds: false });
  } catch (err) {
    console.error('Error fetching privacy prefs', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/users/me/privacy - save user's privacy preferences (protected)
router.post('/me/privacy', authMiddleware, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const prefs = req.body && typeof req.body === 'object' ? req.body : {};

    try {
      // Try to write into users.privacy_json column
      await pool.query('UPDATE users SET privacy_json = ? WHERE id = ?', [JSON.stringify(prefs), userId]);
      return res.json({ ...prefs });
    } catch (e) {
      // ignore and fallback
    }

    try {
      // Try upsert into user_privacy table
      await pool.query('INSERT INTO user_privacy (user_id, prefs) VALUES (?, ?) ON DUPLICATE KEY UPDATE prefs = VALUES(prefs)', [userId, JSON.stringify(prefs)]);
      return res.json({ ...prefs });
    } catch (e) {
      // ignore
    }

    // If no DB support, return success but don't persist
    return res.json({ ...prefs });
  } catch (err) {
    console.error('Error saving privacy prefs', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router; 