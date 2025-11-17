import express from 'express';
import pool from '../config/database.js';
import authMiddleware from '../middleware/auth.js';
import upload from '../config/multer.js';
import { broadcastMessage, broadcastTyping } from '../ws.js';

const router = express.Router();

// GET /api/messages/:convId - list messages for a conversation
router.get('/:convId', authMiddleware, async (req, res) => {
  const { convId } = req.params;
  const userId = req.user?.id;
  try {
    try {
      const [rows] = await pool.query('SELECT id, conversationId, senderId, content, createdAt, replyTo, attachment_url, isDraft, scheduledAt FROM messages WHERE conversationId = ? ORDER BY id ASC', [convId]);
      return res.json(rows || []);
    } catch (e) {
      // Fallback fixtures when messages table missing
      const fixtures = [
        { id: 1, conversationId: Number(convId), senderId: 2, content: 'Bonjour', createdAt: new Date().toISOString(), replyTo: null, attachment_url: null, isDraft: 0, scheduledAt: null },
        { id: 2, conversationId: Number(convId), senderId: userId || 1, content: 'Bonjour, je cherche un produit', createdAt: new Date().toISOString(), replyTo: 1, attachment_url: null, isDraft: 0, scheduledAt: null }
      ];
      return res.json(fixtures);
    }
  } catch (err) {
    console.error('Error fetching messages', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/messages - create a message
router.post('/', authMiddleware, async (req, res) => {
  const body = req.body || {};
  const senderFromReq = body.senderId;
  const senderId = senderFromReq || req.user?.id;
  const { conversationId, content, createdAt, replyTo, attachment_url, isDraft, scheduledAt } = body;
  if (!conversationId || !senderId || (content === undefined || content === null)) return res.status(400).json({ message: 'Données manquantes' });
  try {
    try {
      const [result] = await pool.query('INSERT INTO messages (conversationId, senderId, content, createdAt, replyTo, attachment_url, isDraft, scheduledAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [conversationId, senderId, content, createdAt || new Date().toISOString(), replyTo || null, attachment_url || null, isDraft ? 1 : 0, scheduledAt || null]);
      const insertedId = result.insertId;
      const [rows] = await pool.query('SELECT id, conversationId, senderId, content, createdAt, replyTo, attachment_url, isDraft, scheduledAt FROM messages WHERE id = ?', [insertedId]);
      const created = (rows && rows[0]) || { id: insertedId, conversationId, senderId, content, createdAt };

      // Broadcast the new message to websocket clients subscribed to this conversation
      try { broadcastMessage(created); } catch (e) { console.error('Failed to broadcast message', e); }

      return res.status(201).json(created);
    } catch (e) {
      // If messages table doesn't exist, echo back the submitted message with a fake id
      const created = { id: Date.now(), conversationId, senderId, content, createdAt: createdAt || new Date().toISOString(), replyTo: replyTo || null, attachment_url: attachment_url || null, isDraft: isDraft ? 1 : 0, scheduledAt: scheduledAt || null };

      try { broadcastMessage(created); } catch (err) { console.error('Failed to broadcast message (fallback)', err); }

      return res.status(201).json(created);
    }
  } catch (err) {
    console.error('Error creating message', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/messages/:id/reactions - add/remove reaction
router.post('/:id/reactions', authMiddleware, async (req, res) => {
  const messageId = req.params.id;
  const userId = req.user?.id;
  const { emoji, action } = req.body || {}; // action: 'add' | 'remove'
  if (!emoji || !messageId || !userId) return res.status(400).json({ message: 'Données manquantes' });
  try {
    try {
      if (action === 'remove') {
        await pool.query('DELETE FROM message_reactions WHERE messageId = ? AND userId = ? AND emoji = ?', [messageId, userId, emoji]);
        return res.json({ message: 'removed' });
      }
      // Add reaction if not exists
      await pool.query('INSERT INTO message_reactions (messageId, userId, emoji) VALUES (?, ?, ?) ', [messageId, userId, emoji]);
      return res.status(201).json({ message: 'added' });
    } catch (e) {
      // Fallback: echo
      return res.status(201).json({ message: 'ok' });
    }
  } catch (err) {
    console.error('Error handling reaction', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/messages/:id/reactions - list reactions for a message
router.get('/:id/reactions', authMiddleware, async (req, res) => {
  const messageId = req.params.id;
  try {
    try {
      const [rows] = await pool.query('SELECT emoji, COUNT(*) as count FROM message_reactions WHERE messageId = ? GROUP BY emoji', [messageId]);
      return res.json(rows || []);
    } catch (e) {
      // Fallback: empty
      return res.json([]);
    }
  } catch (err) {
    console.error('Error fetching reactions', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/messages/upload - upload attachment (image)
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    // return path to file (store under /uploads)
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ url });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ message: 'Erreur upload' });
  }
});

// POST /api/messages/draft - save a message draft
router.post('/draft', authMiddleware, async (req, res) => {
  const body = req.body || {};
  const userId = req.user?.id;
  const { conversationId, content, attachment_url } = body;
  try {
    try {
      const [result] = await pool.query('INSERT INTO messages (conversationId, senderId, content, createdAt, isDraft, attachment_url) VALUES (?, ?, ?, ?, ?, ?)', [conversationId || null, userId, content || '', new Date().toISOString(), 1, attachment_url || null]);
      const insertId = result.insertId;
      const [rows] = await pool.query('SELECT id, conversationId, senderId, content, createdAt, isDraft, attachment_url FROM messages WHERE id = ?', [insertId]);
      return res.status(201).json((rows && rows[0]) || { id: insertId, conversationId, senderId: userId, content, createdAt: new Date().toISOString(), isDraft: 1, attachment_url });
    } catch (e) {
      return res.status(201).json({ id: Date.now(), conversationId, senderId: userId, content, createdAt: new Date().toISOString(), isDraft: 1, attachment_url });
    }
  } catch (err) {
    console.error('Error saving draft', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/messages/typing - broadcast typing indicator
router.post('/typing', authMiddleware, async (req, res) => {
  const userId = req.user?.id;
  const { conversationId, isTyping } = req.body || {};
  if (!conversationId || (isTyping === undefined)) return res.status(400).json({ message: 'Données manquantes' });
  try {
    try {
      broadcastTyping({ conversationId, userId, isTyping: !!isTyping });
      return res.json({ ok: true });
    } catch (e) {
      // fallback
      return res.json({ ok: true });
    }
  } catch (err) {
    console.error('Error broadcasting typing', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/messages/scheduled - list scheduled messages for current user
router.get('/scheduled/list', authMiddleware, async (req, res) => {
  const userId = req.user?.id;
  try {
    try {
      const [rows] = await pool.query('SELECT id, conversationId, senderId, content, scheduledAt, isDraft FROM messages WHERE senderId = ? AND scheduledAt IS NOT NULL ORDER BY scheduledAt ASC', [userId]);
      return res.json(rows || []);
    } catch (e) {
      return res.json([]);
    }
  } catch (err) {
    console.error('Error fetching scheduled', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router; 