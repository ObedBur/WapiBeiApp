import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const FILE = path.join(process.cwd(), 'backend', 'data', 'vendor_clicks.json');

function ensureFile() {
  try {
    if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({ count: 0, events: [] }));
  } catch (e) { console.error(e); }
}

router.post('/', (req, res) => {
  try {
    ensureFile();
    const raw = fs.readFileSync(FILE, 'utf8');
    const data = raw ? JSON.parse(raw) : { count: 0, events: [] };
    data.count = (data.count || 0) + 1;
    data.events = data.events || [];
    data.events.push({ ts: new Date().toISOString() });
    // keep only last 100 events
    if (data.events.length > 100) data.events = data.events.slice(-100);
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    return res.json({ count: data.count });
  } catch (e) {
    console.error('vendor click error', e);
    return res.status(500).json({ message: 'Erreur' });
  }
});

router.get('/events', (req, res) => {
  try {
    ensureFile();
    const raw = fs.readFileSync(FILE, 'utf8');
    const data = raw ? JSON.parse(raw) : { count: 0, events: [] };
    return res.json({ events: data.events || [], count: data.count || 0 });
  } catch (e) {
    console.error('vendor click events error', e);
    return res.status(500).json({ message: 'Erreur' });
  }
});

export default router;


