import express from 'express';
import pool from '../config/database.js';
import upload from '../config/multer.js';

const router = express.Router();

// GET /api/sellers - list all sellers
router.get('/', async (req, res) => {
  try {
    // select common user fields for sellers; support multiple possible role values
    const [rows] = await pool.query(
      "SELECT id, nom, prenom, email, photo_url AS avatar, telephone, ville, pays FROM users WHERE role IN ('vendeur','seller','vendor')"
    );
    const sellers = (rows || []).map((u) => ({
      id: u.id,
      name: `${u.nom || ''}${u.prenom ? ' ' + u.prenom : ''}`.trim() || null,
      email: u.email,
      avatar: u.avatar || null,
      telephone: u.telephone || null,
      ville: u.ville || null,
      pays: u.pays || null,
    }));
    res.json(sellers);
  } catch (err) {
    console.error('Error listing sellers', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/sellers/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, nom, prenom, email, photo_url AS avatar, role, telephone, date_inscription, ville, pays FROM users WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Vendeur introuvable' });
    const u = rows[0];
    // Try to fetch products if table exists
    let products = [];
    try {
      const [prows] = await pool.query('SELECT id, name, price, quantity, unit, city, country, image, description FROM products WHERE seller_id = ?', [id]);
      products = prows || [];
    } catch (e) {
      // products table may not exist yet; keep empty array
      products = [];
    }
    const seller = {
      id: u.id,
      name: `${u.nom || ''}${u.prenom ? ' ' + u.prenom : ''}`.trim() || null,
      email: u.email,
      avatar: u.avatar || u.photo_url || null,
      role: u.role,
      telephone: u.telephone || null,
      date_inscription: u.date_inscription || null,
      ville: u.ville || null,
      pays: u.pays || null,
      products,
      boutique: null
    };
    // parse boutique_json if available
    try {
      const [brows] = await pool.query('SELECT boutique_json FROM users WHERE id = ?', [id]);
      if (brows && brows.length && brows[0].boutique_json) {
        seller.boutique = JSON.parse(brows[0].boutique_json);
      }
    } catch (e) {
      // ignore
    }
    res.json(seller);
  } catch (err) {
    console.error('Error fetching seller', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/sellers/:id/boutique - create boutique
router.post('/:id/boutique', upload.single('logo'), async (req, res) => {
  const { id } = req.params;
  try {
    // Build boutique object from multipart fields
    const boutique = {
      name: req.body.name || '',
      shortDescription: req.body.shortDescription || req.body.short_description || '',
      location: req.body.location || '',
    };
    if (req.file) {
      boutique.logo = `/uploads/${req.file.filename}`;
    } else if (req.body.logo) {
      boutique.logo = req.body.logo;
    }

    const [result] = await pool.query('UPDATE users SET boutique_json = ? WHERE id = ?', [JSON.stringify(boutique), id]);
    if (result && result.affectedRows === 0) return res.status(404).json({ message: 'Vendeur introuvable' });
    res.status(201).json({ message: 'Boutique créée', boutique });
  } catch (err) {
    console.error('Error saving boutique', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/sellers/:id/boutique - update boutique
router.put('/:id/boutique', upload.single('logo'), async (req, res) => {
  const { id } = req.params;
  try {
    const boutique = {
      name: req.body.name || '',
      shortDescription: req.body.shortDescription || req.body.short_description || '',
      location: req.body.location || '',
    };
    if (req.file) {
      boutique.logo = `/uploads/${req.file.filename}`;
    } else if (req.body.logo) {
      boutique.logo = req.body.logo;
    }

    const [result] = await pool.query('UPDATE users SET boutique_json = ? WHERE id = ?', [JSON.stringify(boutique), id]);
    if (result && result.affectedRows === 0) return res.status(404).json({ message: 'Vendeur introuvable' });
    res.json({ message: 'Boutique mise à jour', boutique });
  } catch (err) {
    console.error('Error updating boutique', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/sellers/:id/products - list products for seller
router.get('/:id/products', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, seller_id, name, price, currency, quantity, unit, city, country, image, description, date_created FROM products WHERE seller_id = ?', [id]);
    res.json({ products: rows || [] });
  } catch (err) {
    console.error('Error fetching products', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/:id/products', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  try {
    const product = {
      seller_id: id,
      name: req.body.name || '',
      price: req.body.price || '',
      currency: req.body.currency || '',
      quantity: req.body.quantity || '',
      unit: req.body.unit || '',
      city: req.body.city || '',
      country: req.body.country || '',
      description: req.body.description || ''
    };
    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      product.image = req.body.image;
    }
    const [result] = await pool.query('INSERT INTO products (seller_id, name, price, currency, quantity, unit, city, country, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [product.seller_id, product.name, product.price, product.currency, product.quantity, product.unit, product.city, product.country, product.image, product.description]);
    product.id = result.insertId;
    res.status(201).json({ message: 'Produit créé', product });
  } catch (err) {
    console.error('Error creating product', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});



export default router; 