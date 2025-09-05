import sqlite3 from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Assurez-vous que le dossier data existe
const dataDir = join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const dbPath = join(dataDir, 'wapibei.db');
const db = sqlite3(dbPath);

// Script de création des tables
const initDatabase = () => {
    // Activer les clés étrangères
    db.pragma('foreign_keys = ON');

    // Table users
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            telephone TEXT,
            photo_url TEXT,
            role TEXT CHECK(role IN ('acheteur', 'vendeur')) DEFAULT 'acheteur',
            date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
            derniere_connexion DATETIME,
            statut TEXT CHECK(statut IN ('actif', 'inactif', 'en_attente')) DEFAULT 'en_attente'
        )
    `);

    // Table otp_verifications
    db.exec(`
        CREATE TABLE IF NOT EXISTS otp_verifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            code TEXT NOT NULL,
            date_expiration DATETIME NOT NULL,
            verified INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Table sessions
    db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            token TEXT NOT NULL,
            date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
            date_expiration DATETIME NOT NULL,
            appareil TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
};

// Initialiser la base de données
initDatabase();

// Fournir une API compatible `pool.query` utilisée dans le code backend
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        try {
            const stmt = db.prepare(sql);
            const isSelect = /^\s*select/i.test(sql);

            // Normaliser les paramètres pour SQLite (dates -> string, boolean -> 0/1, undefined -> null)
            const normalizeParam = (p) => {
                if (p === undefined) return null;
                if (p === null) return null;
                if (p instanceof Date) return p.toISOString();
                if (typeof p === 'boolean') return p ? 1 : 0;
                if (Buffer.isBuffer && Buffer.isBuffer(p)) return p;
                if (typeof p === 'object') return JSON.stringify(p);
                return p;
            };

            const boundParams = Array.isArray(params) ? params.map(normalizeParam) : [normalizeParam(params)];

            if (isSelect) {
                const rows = stmt.all(...boundParams);
                resolve([rows]);
            } else {
                const info = stmt.run(...boundParams);
                // Retourner un objet similaire à mysql2 (insertId, affectedRows)
                resolve([{ insertId: info.lastInsertRowid, affectedRows: info.changes }]);
            }
        } catch (err) {
            reject(err);
        }
    });
};

export default { query };
