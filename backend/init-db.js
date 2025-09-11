import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const initDatabase = async () => {
  try {
    // Créer la connexion
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Créer la base de données si elle n'existe pas
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('Base de données créée ou déjà existante');

    // Utiliser la base de données
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Créer les tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        telephone VARCHAR(20),
        photo_url VARCHAR(255),
        role ENUM('acheteur', 'vendeur') DEFAULT 'acheteur',
        date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
        derniere_connexion DATETIME,
        statut ENUM('actif', 'inactif', 'en_attente') DEFAULT 'en_attente'
      );
    `);
    console.log('Table users créée ou déjà existante');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        code VARCHAR(6) NOT NULL,
        date_expiration DATETIME NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Table otp_verifications créée ou déjà existante');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        token VARCHAR(255) NOT NULL,
        date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_expiration DATETIME NOT NULL,
        appareil VARCHAR(255),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Table sessions créée ou déjà existante');

    // Créer un utilisateur de test
    const testUser = {
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      nom: 'Test',
      prenom: 'User',
      role: 'acheteur'
    };

    try {
      await connection.query(
        'INSERT INTO users (email, password, nom, prenom, role, statut) VALUES (?, ?, ?, ?, ?, ?)',
        [testUser.email, testUser.password, testUser.nom, testUser.prenom, testUser.role, 'actif']
      );
      console.log('Utilisateur de test créé');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log('L\'utilisateur de test existe déjà');
      } else {
        throw err;
      }
    }

    // Create two default admin/editor users (role 'vendeur' is allowed to publish)
    const defaultAdmins = [
      { email: 'obedburindi@gmail.com', password: 'WapiBei@321', nom: 'Admin', prenom: 'Obed' },
      { email: 'jadenkashongwe@gmail.com', password: 'WapiBei@321', nom: 'Admin', prenom: 'Jaden' },
    ];

    for (const adm of defaultAdmins) {
      try {
        const hashed = await bcrypt.hash(adm.password, 10);
        await connection.query(
          'INSERT INTO users (email, password, nom, prenom, role, statut) VALUES (?, ?, ?, ?, ?, ?)',
          [adm.email, hashed, adm.nom, adm.prenom, 'vendeur', 'actif']
        );
        console.log(`Admin créé: ${adm.email}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Admin existe déjà: ${adm.email}`);
        } else {
          throw err;
        }
      }
    }

    await connection.end();
    console.log('Initialisation terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation :', error);
    process.exit(1);
  }
};

initDatabase();
