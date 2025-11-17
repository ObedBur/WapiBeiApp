import express from 'express';
import fs from 'fs';
import path from 'path';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();
const FILE = path.join(process.cwd(), 'backend', 'data', 'subscribers.json');

function ensureFile() { if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify([])); }

router.get('/', adminAuth, (req, res) => {
  try {
    ensureFile();
    const raw = fs.readFileSync(FILE, 'utf8');
    const list = JSON.parse(raw || '[]');
    return res.json(list);
  } catch (e) {
    console.error('subscribers error', e);
    return res.status(500).json({ message: 'Erreur' });
  }
});

router.get('/export', adminAuth, (req, res) => {
  try {
    ensureFile();
    const raw = fs.readFileSync(FILE, 'utf8');
    const list = JSON.parse(raw || '[]');
    const csv = ['email,subscribedAt', ...list.map(s => `${s.email},${s.subscribedAt || ''}`)].join('\n');
    res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
    res.setHeader('Content-Type', 'text/csv');
    return res.send(csv);
  } catch (e) {
    console.error('subscribers export error', e);
    return res.status(500).json({ message: 'Erreur' });
  }
});

router.delete('/', adminAuth, (req, res) => {
  try {
    ensureFile();
    fs.writeFileSync(FILE, JSON.stringify([]));
    return res.json({ message: 'Tous les abonnés supprimés' });
  } catch (e) {
    console.error('subscribers delete error', e);
    return res.status(500).json({ message: 'Erreur' });
  }
});

export default router;


