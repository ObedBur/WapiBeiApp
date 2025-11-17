import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Assurez-vous que le dossier data existe
const dataDir = join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const dbPath = join(dataDir, "wapibei.db");

// Ouverture DB
const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

// Petite fonction utilitaire pour éviter les crash sur migrations
const safeExec = (sql) => {
    try {
        db.exec(sql);
    } catch (_) {}
};

// -------------------------
//   CREATION DES TABLES
// -------------------------
const initDatabase = () => {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                nom TEXT NOT NULL,
                prenom TEXT NOT NULL,
                telephone TEXT,
                photo_url TEXT,
                role TEXT CHECK(role IN ('acheteur','vendeur')) DEFAULT 'acheteur',
                date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
                derniere_connexion DATETIME,
                statut TEXT CHECK(statut IN ('actif','inactif','en_attente')) DEFAULT 'en_attente',
                ville TEXT,
                pays TEXT,
                boutique_json TEXT
            );
        `);

        db.exec(`
            CREATE TABLE IF NOT EXISTS otp_verifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                code TEXT NOT NULL,
                date_expiration DATETIME NOT NULL,
                verified INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        db.exec(`
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

        db.exec(`
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

        db.exec(`
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

        db.exec(`
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

        db.exec(`
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

        db.exec(`
            CREATE TABLE IF NOT EXISTS testimonials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                avatar TEXT,
                text TEXT,
                location TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        db.exec(`
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                partner_id INTEGER,
                lastMessage TEXT,
                FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        db.exec(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversationId INTEGER,
                senderId INTEGER,
                content TEXT,
                replyTo INTEGER,
                attachment_url TEXT,
                isDraft INTEGER DEFAULT 0,
                scheduledAt DATETIME,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
                FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        db.exec(`
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

        // Migrations silencieuses (ne cassent rien)
        safeExec("ALTER TABLE users ADD COLUMN ville TEXT");
        safeExec("ALTER TABLE users ADD COLUMN pays TEXT");
        safeExec("ALTER TABLE users ADD COLUMN boutique_json TEXT");
        safeExec("ALTER TABLE users ADD COLUMN otp INTEGER");
        safeExec("ALTER TABLE products ADD COLUMN currency TEXT");
        safeExec("ALTER TABLE messages ADD COLUMN replyTo INTEGER");
        safeExec("ALTER TABLE messages ADD COLUMN attachment_url TEXT");
        safeExec("ALTER TABLE messages ADD COLUMN isDraft INTEGER DEFAULT 0");
        safeExec("ALTER TABLE messages ADD COLUMN scheduledAt DATETIME");

        console.log("SQLite (better-sqlite3) initialisée avec succès !");
    } catch (err) {
        console.error("Erreur lors de l'initialisation :", err);
    }
};

initDatabase();

// ------------------------------------------------------------
// API COMPATIBLE pool.query (MySQL style)
// ------------------------------------------------------------
const query = (sql, params = []) => {
    const normalize = (p) => {
        if (p === undefined) return null;
        if (p === null) return null;
        if (p instanceof Date) return p.toISOString();
        if (typeof p === "boolean") return p ? 1 : 0;
        if (typeof p === "object") return JSON.stringify(p);
        return p;
    };

    const bound = Array.isArray(params) ? params.map(normalize) : [normalize(params)];

    const isSelect = /^\s*select/i.test(sql);

    const stmt = db.prepare(sql);

    if (isSelect) {
        const rows = stmt.all(bound);
        return [rows];
    }

    const result = stmt.run(bound);

    return [
        {
            insertId: result.lastInsertRowid ?? null,
            affectedRows: result.changes ?? 0,
        },
    ];
};
export { db };
export default { query, db };

