import bcrypt from 'bcryptjs';
import db from '../config/database.js';

const adminsEnv = process.env.ADMINS_JSON;
let admins = [];
if (adminsEnv) {
  try {
    admins = JSON.parse(adminsEnv);
    if (!Array.isArray(admins)) {
      console.error('ADMINS_JSON doit contenir un tableau d’objets {email,password,nom,prenom,role}');
      process.exit(1);
    }
  } catch (err) {
    console.error('ADMINS_JSON invalide JSON:', err.message);
    process.exit(1);
  }
} else if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  admins.push({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    nom: process.env.ADMIN_NOM || 'Admin',
    prenom: process.env.ADMIN_PRENOM || 'User',
    role: process.env.ADMIN_ROLE || 'vendeur',
  });
} else {
  console.error('Aucun admin fourni. Définissez la variable d’environnement ADMINS_JSON ou ADMIN_EMAIL et ADMIN_PASSWORD.');
  console.error("Exemple (ADMINS_JSON): export ADMINS_JSON='[{\"email\":\"admin@example.com\",\"password\":\"Secret123\",\"nom\":\"Admin\",\"prenom\":\"Root\",\"role\":\"admin\"}]'");
  process.exit(1);
}

async function run() {
  try {
    for (const a of admins) {
      const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [a.email]);
      if (rows && rows.length > 0) {
        console.log(`Utilisateur existant, skip: ${a.email}`);
        continue;
      }
      const hashed = await bcrypt.hash(a.password, 10);
      const role = a.role || 'vendeur';
      const [res] = await db.query('INSERT INTO users (email, password, nom, prenom, role, statut) VALUES (?, ?, ?, ?, ?, ?)', [a.email, hashed, a.nom, a.prenom, role, 'actif']);
      console.log(`Créé: ${a.email} (id: ${res.insertId})`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la création des admins:', err);
    process.exit(1);
  }
}

run(); 