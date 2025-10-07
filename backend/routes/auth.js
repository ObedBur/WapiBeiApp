import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import upload from '../config/multer.js';
import nodemailer from 'nodemailer';

// Helper to send OTP email. Tries SMTP config from env; on auth/send failure falls back to Ethereal for dev.
const sendOtpEmail = async (toEmail, otp) => {
  try {
    let transporter;

    // If SMTP env vars are set, try to use them first
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      try {
        const info = await transporter.sendMail({
          from: process.env.EMAIL_FROM || `WapiBei <no-reply@wapibei.local>`,
          to: toEmail,
          subject: 'Votre code de vérification WapiBei',
          text: `Votre code de vérification est : ${otp}`,
          html: `<p>Votre code de vérification est : <strong>${otp}</strong></p><p>Il expire dans 15 minutes.</p>`
        });

        // If provider returns a preview URL (Ethereal), log it
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log('Aperçu email OTP (Ethereal):', previewUrl);
        return true;
      } catch (smtpErr) {
        console.error('SMTP envoi échoué, essai avec Ethereal:', smtpErr);
        // fall through to Ethereal fallback
      }
    }

    // Fallback to Ethereal (development/test) if SMTP not configured or failed
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `WapiBei <no-reply@wapibei.local>`,
      to: toEmail,
      subject: 'Votre code de vérification WapiBei',
      text: `Votre code de vérification est : ${otp}`,
      html: `<p>Votre code de vérification est : <strong>${otp}</strong></p><p>Il expire dans 15 minutes.</p>`
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('Aperçu email OTP (Ethereal):', previewUrl);
    return true;
  } catch (err) {
    console.error('Erreur envoi OTP email:', err);
    return false;
  }
};

const router = express.Router();

// Inscription
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { email, password, nom, prenom, telephone, role, ville, pays } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Préparer le chemin de la photo s'il y en a une
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Insérer le nouvel utilisateur
    const [result] = await pool.query(
      'INSERT INTO users (email, password, nom, prenom, telephone, role, photo_url, ville, pays) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, nom, prenom, telephone, role, photoUrl, ville || null, pays || null]
    );

    // Générer OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date(Date.now() + 15 * 60000); // 15 minutes

    await pool.query(
      'INSERT INTO otp_verifications (user_id, code, date_expiration) VALUES (?, ?, ?)',
      [result.insertId, otp, expiration]
    );

    // Envoyer l'OTP par email (ne bloque pas l'inscription si l'envoi échoue)
    try {
      const sent = await sendOtpEmail(email, otp);
      if (!sent) console.warn('OTP non envoyé pour', email);
    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'OTP :', err);
    }

    // Optionnel : exposer l'OTP automatiquement uniquement en environnement de développement
    const showOtp = process.env.NODE_ENV !== 'production';
    if (showOtp) console.log(`DEBUG OTP for user ${result.insertId}:`, otp);

    res.status(201).json({
      message: 'Inscription réussie. Veuillez vérifier votre email.',
      userId: result.insertId,
      ...(showOtp ? { otp } : {})
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier les identifiants
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (user.statut !== 'actif') {
      return res.status(403).json({ message: 'Compte non vérifié ou inactif' });
    }

    // Générer JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Enregistrer la session
    const expiration = new Date(Date.now() + 24 * 60 * 60000);
    await pool.query(
      'INSERT INTO sessions (user_id, token, date_expiration) VALUES (?, ?, ?)',
      [user.id, token, expiration]
    );

    // Mettre à jour dernière connexion
    await pool.query(
      'UPDATE users SET derniere_connexion = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

// Vérification OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, code } = req.body;

    const [verifications] = await pool.query(
      'SELECT * FROM otp_verifications WHERE user_id = ? AND code = ? AND verified = FALSE AND date_expiration > CURRENT_TIMESTAMP ORDER BY id DESC LIMIT 1',
      [userId, code]
    );

    if (!verifications.length) {
      return res.status(400).json({ message: 'Code OTP invalide ou expiré' });
    }

    // Marquer l'OTP comme vérifié
    await pool.query(
      'UPDATE otp_verifications SET verified = TRUE WHERE id = ?',
      [verifications[0].id]
    );

    // Activer le compte utilisateur
    await pool.query(
      "UPDATE users SET statut = 'actif' WHERE id = ?",
      [userId]
    );

    res.json({ message: 'Compte vérifié avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la vérification' });
  }
});

export default router;

// Endpoint pour renvoyer l'OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;

    // Vérifier que l'utilisateur existe
    const [users] = await pool.query('SELECT email FROM users WHERE id = ?', [userId]);
    if (!users.length) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const email = users[0].email;

    // Générer un nouvel OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = new Date(Date.now() + 15 * 60000); // 15 minutes

    await pool.query(
      'INSERT INTO otp_verifications (user_id, code, date_expiration) VALUES (?, ?, ?)',
      [userId, otp, expiration]
    );

    // Envoyer l'OTP par email
    await sendOtpEmail(email, otp);

    res.json({ message: 'Code renvoyé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du renvoi du code' });
  }
});
