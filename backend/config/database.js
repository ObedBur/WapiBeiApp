import sqlite3 from 'sqlite3';
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
const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath);

// Promisified helpers
const execAsync = (sql) => {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(sql, (err) => {
            if (err) return reject(err);
        });
        stmt.run(params, function (err) {
            if (err) {
                stmt.finalize();
                return reject(err);
            }
            const info = { lastID: this.lastID, changes: this.changes };
            stmt.finalize();
            resolve(info);
        });
    });
};

const allAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// Script de création des tables (utilise execAsync/runAsync/allAsync)
const initDatabase = async () => {
    try {
        // Activer les clés étrangères
        await execAsync("PRAGMA foreign_keys = ON;");

        // Table users
        await execAsync(`
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
            );
        `);

        // If migrating an existing DB, ensure columns exist (ignore errors)
        try { await runAsync("ALTER TABLE users ADD COLUMN ville TEXT"); } catch (e) { }
        try { await runAsync("ALTER TABLE users ADD COLUMN pays TEXT"); } catch (e) { }

        // Other tables
        await execAsync(`
            CREATE TABLE IF NOT EXISTS otp_verifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                code TEXT NOT NULL,
                date_expiration DATETIME NOT NULL,
                verified INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        await execAsync(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                token TEXT NOT NULL,
                date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
                date_expiration DATETIME NOT NULL,
                appareil TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        await execAsync(`
            CREATE TABLE IF NOT EXISTS boutique (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                nomboutique TEXT,
                localisation TEXT,
                logo TEXT,
                description TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        await execAsync(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                seller_id INTEGER,
                name TEXT NOT NULL,
                price TEXT,
                currency TEXT,
                quantity TEXT,
                unit TEXT,
                city TEXT,
                country TEXT,
                image TEXT,
                description TEXT,
                date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        await execAsync(`
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                excerpt TEXT,
                body TEXT,
                cover_url TEXT,
                author TEXT,
                published_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await execAsync(`
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, product_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            );
        `);

        await execAsync(`
            CREATE TABLE IF NOT EXISTS testimonials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                avatar TEXT,
                text TEXT,
                location TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await execAsync(`
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                partner_id INTEGER,
                lastMessage TEXT,
                FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        await execAsync(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversationId INTEGER,
                senderId INTEGER,
                content TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
                FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Ensure users have a boutique_json column and date_inscription set
        try { await runAsync("ALTER TABLE users ADD COLUMN boutique_json TEXT"); } catch (e) { }
        try { await runAsync("UPDATE users SET date_inscription = datetime('now') WHERE date_inscription IS NULL"); } catch (e) { }

        // Ensure messages table has replyTo and add columns
        try { await runAsync("ALTER TABLE messages ADD COLUMN replyTo INTEGER"); } catch (e) { }
        try { await runAsync("ALTER TABLE messages ADD COLUMN attachment_url TEXT"); } catch (e) { }
        try { await runAsync("ALTER TABLE messages ADD COLUMN isDraft INTEGER DEFAULT 0"); } catch (e) { }
        try { await runAsync("ALTER TABLE messages ADD COLUMN scheduledAt DATETIME"); } catch (e) { }
        // Ensure existing products table has a currency column (safe if already present)
        try { await runAsync("ALTER TABLE products ADD COLUMN currency TEXT"); } catch (e) { }

        await execAsync(`
            CREATE TABLE IF NOT EXISTS message_reactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                messageId INTEGER,
                userId INTEGER,
                emoji TEXT,
                date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (messageId) REFERENCES messages(id) ON DELETE CASCADE,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

    } catch (err) {
        console.error('Erreur lors de l\'initialisation de la DB:', err);
    }
};

// Initialise la DB de façon asynchrone
initDatabase();

// Fournir une API compatible `pool.query` utilisée dans le code backend
const query = (sql, params = []) => {
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
    const isSelect = /^\s*select/i.test(sql);

    if (isSelect) {
        return allAsync(sql, boundParams).then((rows) => [rows]);
    }

    return runAsync(sql, boundParams).then((info) => [{ insertId: info.lastID, affectedRows: info.changes }]);
};

export default { query };