import express from 'express';
import fs from 'fs';
import path from 'path';
import sgMail from '@sendgrid/mail';

const router = express.Router();
const DB_FILE = path.join(process.cwd(), 'backend', 'data', 'subscribers.json');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function ensureDB() {
  try {
    if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify([]));
  } catch (e) { console.error('Could not ensure newsletter DB:', e); }
}

async function sendConfirmationEmail(email) {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM) return;
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM,
    subject: 'Confirmation d\'abonnement - WapiBei',
    text: 'Merci de vous être inscrit(e) à la newsletter WapiBei!',
    html: `<p>Merci de vous être inscrit(e) à la newsletter WapiBei!</p><p>Vous recevrez bientôt nos meilleures offres.</p>`,
  };
  try {
    await sgMail.send(msg);
  } catch (e) {
    console.error('SendGrid send error', e);
  }
}

router.post('/', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Email invalide' });
    }
    ensureDB();
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    let list = [];
    try {
      list = JSON.parse(raw || '[]');
    } catch (e) {
      console.warn('Could not parse subscribers.json, resetting to empty list', e);
      list = [];
    }
    const exists = list.find((s) => (s.email || '').toLowerCase() === email.toLowerCase());
    if (exists) return res.status(200).json({ message: 'Déjà abonné' });
    list.push({ email, subscribedAt: new Date().toISOString() });
    fs.writeFileSync(DB_FILE, JSON.stringify(list, null, 2));
    // send confirmation if sendgrid configured
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM) {
      sendConfirmationEmail(email).catch((e) => console.error(e));
    }
    return res.status(201).json({ message: "Merci ! Vous êtes abonné(e)" });
  } catch (err) {
    console.error('newsletter error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;


