import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/products - list all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, seller_id, name, price, quantity, unit, city, country, image, description, date_created FROM products');
    res.json(rows || []);
  } catch (err) {
    console.error('Error fetching products', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/products/:id - product details + sellers info (if any)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, seller_id, name, price, quantity, unit, city, country, image, description, date_created FROM products WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Produit introuvable' });
    const product = rows[0];

    // Try to attach seller info if seller_id present
    if (product.seller_id) {
      try {
        const [srows] = await pool.query('SELECT id, nom, prenom, email, photo_url AS avatar, ville, pays FROM users WHERE id = ?', [product.seller_id]);
        product.seller = srows && srows.length ? srows[0] : null;
      } catch (e) {
        product.seller = null;
      }
    }

    res.json(product);
  } catch (err) {
    console.error('Error fetching product details', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router; 