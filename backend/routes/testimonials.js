import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/testimonials - list all testimonials
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, avatar, text, location FROM testimonials ORDER BY id DESC');
    res.json(rows || []);
  } catch (err) {
    console.error('Error fetching testimonials', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router; 