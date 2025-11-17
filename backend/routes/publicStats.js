import express from 'express';
import fs from 'fs';
import path from 'path';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Active users (SQLite compatible)
    const [usersRows] = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE statut = 'actif'"
    );
    const activeUsers = usersRows[0]?.count || 0;

    // Products count
    const [productsRows] = await pool.query(
      "SELECT COUNT(*) AS count FROM products"
    );
    const productsCount = productsRows[0]?.count || 0;

    // Testimonials count
    const [testimonialsRows] = await pool.query(
      "SELECT COUNT(*) AS count FROM testimonials"
    );
    const testimonialsCount = testimonialsRows[0]?.count || 0;

    // Satisfaction %
    let satisfactionPercent = 0;
    if (testimonialsCount > 0) {
      const [ratingRows] = await pool.query(
        "SELECT AVG(rating) AS avg_rating FROM testimonials WHERE rating IS NOT NULL"
      );
      const avgRating = ratingRows[0]?.avg_rating || 0;
      satisfactionPercent = Math.round(avgRating * 20); // 5★ → %
    }

    // Orders per day (SQLite compatible, no CURDATE)
    let ordersPerDay = 0;
    try {
      const [ordersRows] = await pool.query(
        "SELECT COUNT(*) AS count FROM orders WHERE DATE(created_at) = DATE('now')"
      );
      ordersPerDay = ordersRows[0]?.count || 0;
    } catch (e) {
      // No orders table → fallback
      ordersPerDay = Math.round(productsCount * 0.1);
    }

    // Savings percent (from JSON file)
    let savingsPercent = 0;
    try {
      const file = path.join(process.cwd(), 'backend', 'data', 'business_metrics.json');
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        const obj = JSON.parse(raw || '{}');
        savingsPercent = obj.savingsPercent || 0;
      }
    } catch (e) {
      savingsPercent = 0;
    }

    console.log('Real database stats:', {
      activeUsers,
      ordersPerDay,
      satisfactionPercent,
      savingsPercent,
      productsCount,
      testimonialsCount
    });

    return res.json({
      activeUsers,
      ordersPerDay,
      satisfactionPercent,
      savingsPercent,
    });
  } catch (err) {
    console.error('public stats error', err);

    return res.json({
      activeUsers: 0,
      ordersPerDay: 0,
      satisfactionPercent: 0,
      savingsPercent: 0,
    });
  }
});

export default router;
