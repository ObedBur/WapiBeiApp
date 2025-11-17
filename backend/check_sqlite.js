import { db } from "./config/database.js";

console.log("SQLite loaded!");

const rows = db.prepare("PRAGMA table_info(users);").all();

console.log("Structure de la table users :");
console.table(rows);
