import express from 'express';
import fs from 'fs';
import path from 'path';
import pool from '../config/database.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/', adminAuth, async (req, res) => {
  try {
    // users count
    const [usersRows] = await pool.query('SELECT COUNT(*) as count FROM users');
    const usersCount = usersRows[0]?.count || 0;

    // products count
    const [prodRows] = await pool.query('SELECT COUNT(*) as count FROM products');
    const productsCount = prodRows[0]?.count || 0;

    // testimonials count
    const [testRows] = await pool.query('SELECT COUNT(*) as count FROM testimonials');
    const testimonialsCount = testRows[0]?.count || 0;

    // newsletter subscribers
    const subsFile = path.join(process.cwd(), 'backend', 'data', 'subscribers.json');
    let subscribersCount = 0;
    try {
      const raw = fs.readFileSync(subsFile, 'utf8');
      const list = JSON.parse(raw || '[]');
      subscribersCount = Array.isArray(list) ? list.length : 0;
    } catch (e) { subscribersCount = 0; }

    // vendor clicks
    const vcFile = path.join(process.cwd(), 'backend', 'data', 'vendor_clicks.json');
    let vendorClicks = 0;
    try {
      const raw = fs.readFileSync(vcFile, 'utf8');
      const obj = JSON.parse(raw || '{}');
      vendorClicks = obj.count || 0;
    } catch (e) { vendorClicks = 0; }

    return res.json({ usersCount, productsCount, testimonialsCount, subscribersCount, vendorClicks });
  } catch (err) {
    console.error('admin stats error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;


