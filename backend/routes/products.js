import express from 'express';
import pool from '../config/database.js';
import authMiddleware from '../middleware/auth.js';
import testimonialsRoutes from './testimonials.js';

const router = express.Router();

// GET /api/products - list products with optional pagination & search
router.get('/', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    const q = req.query.q ? String(req.query.q).trim() : null;

    // If pagination or search requested, return { data, total }
    if (page || limit || q) {
      const perPage = Number.isInteger(limit) && limit > 0 ? limit : 12;
      const currentPage = Number.isInteger(page) && page > 0 ? page : 1;
      const offset = (currentPage - 1) * perPage;

      let where = '';
      const params = [];
      if (q) {
        where = "WHERE (name LIKE ? OR description LIKE ? OR city LIKE ? OR country LIKE ?)";
        const like = `%${q}%`;
        params.push(like, like, like, like);
      }

      const countSql = `SELECT COUNT(*) AS cnt FROM products ${where}`;
      const [countRows] = await pool.query(countSql, params);
      const total = countRows && countRows[0] ? Number(countRows[0].cnt) : 0;

      const sql = `SELECT id, seller_id AS sellerId, name AS nom, price AS prix, currency, quantity, unit, city, country, image, description, date_created AS date FROM products ${where} ORDER BY date_created DESC LIMIT ? OFFSET ?`;
      const dataParams = params.concat([perPage, offset]);
      const [rows] = await pool.query(sql, dataParams);
      return res.json({ data: rows || [], total });
    }

    // default: return all products (backwards compatible)
    const [rows] = await pool.query('SELECT id, seller_id, name, price, currency, quantity, unit, city, country, image, description, date_created FROM products');
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

// GET /api/products/popularity?ids=1,2,3 - aggregated popularity for multiple products
router.get('/popularity', async (req, res) => {
  const idsParam = req.query.ids || '';
  const ids = idsParam.split(',').map((v) => Number(v)).filter(Boolean).slice(0, 100);
  if (!ids.length) return res.status(400).json({ message: 'ids query param required' });
  try {
    // helper to run a query safely and return rows or null on error
    const safeQuery = async (sql, params = []) => {
      try {
        const [rows] = await pool.query(sql, params);
        return rows;
      } catch (e) {
        return null;
      }
    };

    const results = [];
    for (const id of ids) {
      // reuse the same logic as single endpoint but per id
      const sales = { day: null, week: null, month: null };
      const qDay = await safeQuery(
        'SELECT COALESCE(SUM(oi.quantity),0) AS total FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.product_id = ? AND o.status = ? AND o.date_created >= DATE_SUB(NOW(), INTERVAL 1 DAY)',
        [id, 'completed']
      );
      const qWeek = await safeQuery(
        'SELECT COALESCE(SUM(oi.quantity),0) AS total FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.product_id = ? AND o.status = ? AND o.date_created >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
        [id, 'completed']
      );
      const qMonth = await safeQuery(
        'SELECT COALESCE(SUM(oi.quantity),0) AS total FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.product_id = ? AND o.status = ? AND o.date_created >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
        [id, 'completed']
      );
      sales.day = qDay ? (qDay[0] ? qDay[0].total : 0) : null;
      sales.week = qWeek ? (qWeek[0] ? qWeek[0].total : 0) : null;
      sales.month = qMonth ? (qMonth[0] ? qMonth[0].total : 0) : null;

      let reviews = { count: null, average: null };
      const qReviews = await safeQuery('SELECT COUNT(*) AS cnt, AVG(rating) AS avgRating FROM reviews WHERE product_id = ?', [id]);
      if (qReviews) {
        reviews.count = qReviews[0] ? Number(qReviews[0].cnt) : 0;
        reviews.average = qReviews[0] && qReviews[0].avgRating !== null ? Number(parseFloat(qReviews[0].avgRating).toFixed(2)) : null;
      }

      const qViews = await safeQuery('SELECT COUNT(*) AS views FROM product_views WHERE product_id = ?', [id]);
      const pageViews = qViews ? (qViews[0] ? Number(qViews[0].views) : 0) : null;

      const qCartAdds = await safeQuery("SELECT COUNT(*) AS adds FROM cart_events WHERE product_id = ? AND action = 'add'", [id]);
      const cartAdds = qCartAdds ? (qCartAdds[0] ? Number(qCartAdds[0].adds) : 0) : null;
      const qFavorites = await safeQuery('SELECT COUNT(*) AS favs FROM favorites WHERE product_id = ?', [id]);
      const favorites = qFavorites ? (qFavorites[0] ? Number(qFavorites[0].favs) : 0) : null;
      const qShares = await safeQuery('SELECT COUNT(*) AS shares FROM social_shares WHERE product_id = ?', [id]);
      const socialShares = qShares ? (qShares[0] ? Number(qShares[0].shares) : 0) : null;
      const qRestocks = await safeQuery('SELECT COUNT(*) AS restocks FROM restocks WHERE product_id = ?', [id]);
      const restockCount = qRestocks ? (qRestocks[0] ? Number(qRestocks[0].restocks) : 0) : null;

      const monthPurchases = sales.month;
      const conversionRate = pageViews && monthPurchases !== null && pageViews > 0 ? Number(((monthPurchases / pageViews) * 100).toFixed(2)) : null;

      results.push({
        productId: Number(id),
        sales,
        conversion: { views: pageViews, purchasesLast30Days: monthPurchases, conversionRatePercent: conversionRate },
        reviews,
        cartAdds,
        favorites,
        socialShares,
        restockCount,
      });
    }

    return res.json(results);
  } catch (err) {
    console.error('Error computing aggregated popularity metrics', err);
    res.status(500).json({ message: 'Erreur serveur lors du calcul des métriques agrégées' });
  }
});

// GET /api/products/:id/popularity - aggregated popularity metrics for a product
router.get('/:id/popularity', async (req, res) => {
  const { id } = req.params;
  try {
    // helper to run a query safely and return rows or null on error
    const safeQuery = async (sql, params = []) => {
      try {
        const [rows] = await pool.query(sql, params);
        return rows;
      } catch (e) {
        // table might not exist or other DB error - return null to indicate unavailable
        return null;
      }
    };

    // Sales over different windows (requires order_items & orders tables)
    const sales = { day: null, week: null, month: null };
    const qDay = await safeQuery(
      'SELECT COALESCE(SUM(oi.quantity),0) AS total FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.product_id = ? AND o.status = ? AND o.date_created >= DATE_SUB(NOW(), INTERVAL 1 DAY)',
      [id, 'completed']
    );
    const qWeek = await safeQuery(
      'SELECT COALESCE(SUM(oi.quantity),0) AS total FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.product_id = ? AND o.status = ? AND o.date_created >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
      [id, 'completed']
    );
    const qMonth = await safeQuery(
      'SELECT COALESCE(SUM(oi.quantity),0) AS total FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.product_id = ? AND o.status = ? AND o.date_created >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
      [id, 'completed']
    );
    sales.day = qDay ? (qDay[0] ? qDay[0].total : 0) : null;
    sales.week = qWeek ? (qWeek[0] ? qWeek[0].total : 0) : null;
    sales.month = qMonth ? (qMonth[0] ? qMonth[0].total : 0) : null;

    // Reviews
    let reviews = { count: null, average: null };
    const qReviews = await safeQuery('SELECT COUNT(*) AS cnt, AVG(rating) AS avgRating FROM reviews WHERE product_id = ?', [id]);
    if (qReviews) {
      reviews.count = qReviews[0] ? Number(qReviews[0].cnt) : 0;
      reviews.average = qReviews[0] && qReviews[0].avgRating !== null ? Number(parseFloat(qReviews[0].avgRating).toFixed(2)) : null;
    }

    // Page views
    const qViews = await safeQuery('SELECT COUNT(*) AS views FROM product_views WHERE product_id = ?', [id]);
    const pageViews = qViews ? (qViews[0] ? Number(qViews[0].views) : 0) : null;

    // Adds to cart / wishlist / favorites
    const qCartAdds = await safeQuery("SELECT COUNT(*) AS adds FROM cart_events WHERE product_id = ? AND action = 'add'", [id]);
    const cartAdds = qCartAdds ? (qCartAdds[0] ? Number(qCartAdds[0].adds) : 0) : null;
    const qFavorites = await safeQuery('SELECT COUNT(*) AS favs FROM favorites WHERE product_id = ?', [id]);
    const favorites = qFavorites ? (qFavorites[0] ? Number(qFavorites[0].favs) : 0) : null;

    // Social shares
    const qShares = await safeQuery('SELECT COUNT(*) AS shares FROM social_shares WHERE product_id = ?', [id]);
    const socialShares = qShares ? (qShares[0] ? Number(qShares[0].shares) : 0) : null;

    // Restock frequency
    const qRestocks = await safeQuery('SELECT COUNT(*) AS restocks FROM restocks WHERE product_id = ?', [id]);
    const restockCount = qRestocks ? (qRestocks[0] ? Number(qRestocks[0].restocks) : 0) : null;

    // Conversion estimate (month purchases / views)
    const monthPurchases = sales.month;
    const conversionRate = pageViews && monthPurchases !== null && pageViews > 0 ? Number(((monthPurchases / pageViews) * 100).toFixed(2)) : null;

    return res.json({
      productId: Number(id),
      sales,
      conversion: {
        views: pageViews,
        purchasesLast30Days: monthPurchases,
        conversionRatePercent: conversionRate,
      },
      reviews,
      cartAdds,
      favorites,
      socialShares,
      restockCount,
    });
  } catch (err) {
    console.error('Error computing popularity metrics', err);
    res.status(500).json({ message: 'Erreur serveur lors du calcul des métriques' });
  }
});

// Public: list blogs (supports pagination)
router.get('/blogs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const offset = (page - 1) * limit;
    const [rows] = await pool.query('SELECT id, title, slug, excerpt, cover_url AS coverImage, author, published_at AS date FROM posts ORDER BY published_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    // total count for pagination
    const [crows] = await pool.query('SELECT COUNT(*) AS cnt FROM posts');
    const total = crows && crows[0] ? Number(crows[0].cnt) : null;
    res.json({ data: rows, total });
  } catch (err) {
    console.error('Error fetching blog posts', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Public: get by id or slug
router.get('/blogs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, title, slug, excerpt, body, cover_url AS coverImage, author, published_at AS date FROM posts WHERE id = ? OR slug = ?', [id, id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Article introuvable' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching blog post', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Protected: create a post (only admin/editor)
router.post('/blogs', authMiddleware, async (req, res) => {
  try {
    const user = req.user || {};
    if (!user.role || (user.role !== 'admin' && user.role !== 'vendeur')) return res.status(403).json({ message: 'Accès refusé' });

    const { title, slug, excerpt, body, coverImage, author, published_at } = req.body;
    if (!title || !slug) return res.status(400).json({ message: 'title and slug are required' });
    const [result] = await pool.query('INSERT INTO posts (title, slug, excerpt, body, cover_url, author, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [title, slug, excerpt, body, coverImage, author, published_at || null]);
    const [rows] = await pool.query('SELECT id, title, slug, excerpt, body, cover_url AS coverImage, author, published_at AS date FROM posts WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating post', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router; 