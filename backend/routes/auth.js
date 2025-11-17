import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import database from '../config/database.js';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configuration multer pour upload de photos
const uploadDir = 'backend/uploads/profile-photos';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format d\'image non supporté'));
        }
    }
});

// Transporter email (exemple Gmail — à adapter)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

// 📌 Générer OTP (6 chiffres)
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

router.post('/register', upload.single('photo'), async (req, res) => {
    try {
        const { nom, prenom, email, telephone, password, role, ville, pays } = req.body;
        const photoPath = req.file ? `/uploads/profile-photos/${req.file.filename}` : null;

        // Validation basique
        if (!nom || !prenom || !email || !password) {
            // Supprimer la photo si elle a été uploadée et qu'il y a une erreur
            if (req.file) {
                fs.unlinkSync(path.join(uploadDir, req.file.filename));
            }
            return res.status(400).json({ message: 'Champs obligatoires manquants' });
        }

        // Vérifier si email existe déjà
        const [existingUser] = await database.query(
            'SELECT id FROM users WHERE email = ?', 
            [email]
        );

        if (existingUser.length > 0) {
            if (req.file) {
                fs.unlinkSync(path.join(uploadDir, req.file.filename));
            }
            return res.status(400).json({ message: 'Email déjà utilisé' });
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();

        // Insérer utilisateur
        await database.query(
            'INSERT INTO users (nom, prenom, email, telephone, password, role, ville, pays, photo_url, otp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nom, prenom, email, telephone || null, hashedPassword, role || 'acheteur', ville || null, pays || null, photoPath, otp]
        );

        // Récupérer l'ID de l'utilisateur créé
        const [newUser] = await database.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        const userId = newUser[0]?.id;

        // Envoyer l'OTP par email
        await transporter.sendMail({
            to: email,
            subject: 'Votre code OTP WapiBei',
            text: `Bienvenue sur WapiBei!\n\nVotre code OTP est : ${otp}\n\nCe code expire dans 10 minutes.`
        });

        return res.json({ 
            message: 'Utilisateur créé. OTP envoyé.',
            userId: userId,
            otp: otp // À enlever en production
        });

    } catch (err) {
        // Nettoyer la photo uploadée en cas d'erreur
        if (req.file) {
            try {
                fs.unlinkSync(path.join(uploadDir, req.file.filename));
            } catch (e) {
                // Ignorer les erreurs de suppression
            }
        }
        console.error('Erreur inscription:', err);
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription.' });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Chercher l'utilisateur
        const [rows] = await database.query(
            'SELECT * FROM users WHERE email = ?', 
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Utilisateur introuvable' });
        }

        const user = rows[0];

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

        // Générer le token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({ message: 'Connexion réussie', token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

/* =====================================================
   📍 VERIFY OTP
===================================================== */
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const [rows] = await database.query(
            'SELECT otp FROM users WHERE email = ?', 
            [email]
        );

        if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur introuvable' });

        if (rows[0].otp !== otp) {
            return res.status(400).json({ message: 'OTP incorrect' });
        }

        // Clear OTP après validation
        await database.query(
            'UPDATE users SET otp = NULL WHERE email = ?',
            [email]
        );

        res.json({ message: 'OTP vérifié avec succès' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

/* =====================================================
   📍 RESEND OTP
===================================================== */
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        const otp = generateOTP();

        // Mettre à jour l'OTP
        await database.query(
            'UPDATE users SET otp = ? WHERE email = ?',
            [otp, email]
        );

        // Envoyer l'OTP
        await transporter.sendMail({
            to: email,
            subject: 'Nouveau code OTP',
            text: `Votre nouveau code OTP : ${otp}`
        });

        res.json({ message: 'OTP renvoyé.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

export default router;

