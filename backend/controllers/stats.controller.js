import { db } from "../config/database.js";

export const getPublicStats = (req, res) => {
    try {
        const totalUsers = db.prepare(`
            SELECT COUNT(*) AS total FROM users
        `).get().total;

        const totalAcheteurs = db.prepare(`
            SELECT COUNT(*) AS total FROM users WHERE role = 'acheteur'
        `).get().total;

        const totalVendeurs = db.prepare(`
            SELECT COUNT(*) AS total FROM users WHERE role = 'vendeur'
        `).get().total;

        const totalEnAttente = db.prepare(`
            SELECT COUNT(*) AS total FROM users WHERE statut = 'en_attente'
        `).get().total;

        return res.json({
            success: true,
            data: {
                totalUsers,
                totalAcheteurs,
                totalVendeurs,
                totalEnAttente
            }
        });

    } catch (error) {
        console.error("Erreur publicStats:", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur"
        });
    }
};
