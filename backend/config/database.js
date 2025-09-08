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
            statut TEXT CHECK(statut IN ('actif', 'inactif', 'en_attente')) DEFAULT 'en_attente',
            ville TEXT,
            pays TEXT
        )
    `);

    // If migrating an existing DB, ensure columns exist (SQLite will throw if already added)
    try {
        db.prepare("ALTER TABLE users ADD COLUMN ville TEXT").run();
    } catch (e) { /* column may already exist */ }
    try {
        db.prepare("ALTER TABLE users ADD COLUMN pays TEXT").run();
    } catch (e) { /* column may already exist */ }

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
initDatabase();
// Table boutique
db.exec(`
    CREATE TABLE IF NOT EXISTS boutique (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        nomboutique TEXT,
        localisation TEXT,
        logo TEXT,
        description TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
`);

// Table products
db.exec(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id INTEGER,
        name TEXT NOT NULL,
        price TEXT,
        quantity TEXT,
        unit TEXT,
        city TEXT,
        country TEXT,
        image TEXT,
        description TEXT,
        date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
    )
`);

// Table conversations
db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        partner_id INTEGER,
        lastMessage TEXT,
        FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE CASCADE
    )
`);

// Table messages
db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversationId INTEGER,
        senderId INTEGER,
        content TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE
    )
`);


// Ensure users have a boutique_json column and date_inscription set
try {
    // Add boutique_json column to users if it doesn't exist
    db.prepare("ALTER TABLE users ADD COLUMN boutique_json TEXT").run();
} catch (e) { /* column may already exist */ }

// Ensure existing users have a date_inscription set to now if null
try {
    db.prepare("UPDATE users SET date_inscription = datetime('now') WHERE date_inscription IS NULL").run();
} catch (e) {
    // ignore
}

// Ensure messages table has replyTo and create message_reactions table
try {
    db.prepare("ALTER TABLE messages ADD COLUMN replyTo INTEGER").run();
} catch (e) { /* column may already exist */ }

// Add attachment_url, isDraft, scheduledAt to messages table if missing
try {
    db.prepare("ALTER TABLE messages ADD COLUMN attachment_url TEXT").run();
} catch (e) { /* may exist */ }
try {
    db.prepare("ALTER TABLE messages ADD COLUMN isDraft INTEGER DEFAULT 0").run();
} catch (e) { /* may exist */ }
try {
    db.prepare("ALTER TABLE messages ADD COLUMN scheduledAt DATETIME").run();
} catch (e) { /* may exist */ }

db.exec(`
    CREATE TABLE IF NOT EXISTS message_reactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        messageId INTEGER,
        userId INTEGER,
        emoji TEXT,
        date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (messageId) REFERENCES messages(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
`);


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
