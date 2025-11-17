import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const DB_FILE = path.join(process.cwd(), 'backend', 'data', 'public_notifications.json');

function ensureDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const defaultNotifications = [
        {
          id: 1,
          title: "Bienvenue sur WapiBei !",
          content: "Découvrez notre nouvelle plateforme de vente de produits agricoles locaux. Rejoignez notre communauté et profitez de produits frais directement des producteurs.",
          type: "nouveau_produit",
          action_url: "/marketplace",
          created_at: new Date().toISOString(),
          is_active: true
        },
        {
          id: 2,
          title: "Nouveaux produits disponibles",
          content: "De nouveaux producteurs ont rejoint notre plateforme ! Découvrez leurs produits frais et de qualité dans notre marketplace.",
          type: "nouveau_produit",
          action_url: "/marketplace",
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 jour ago
          is_active: true
        },
        {
          id: 3,
          title: "Offre spéciale de lancement",
          content: "Profitez de 20% de réduction sur votre première commande avec le code BIENVENUE20. Offre valable jusqu'à la fin du mois.",
          type: "offre_speciale",
          action_url: "/marketplace",
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 jours ago
          is_active: true
        }
      ];
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultNotifications, null, 2));
    }
  } catch (e) {
    console.error('Could not ensure public notifications DB:', e);
  }
}

// GET /api/public-notifications - Récupérer toutes les notifications publiques actives
router.get('/', (req, res) => {
  try {
    ensureDB();
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    let notifications = [];
    try {
      notifications = JSON.parse(raw || '[]');
    } catch (e) {
      console.warn('Could not parse public_notifications.json, using empty array', e);
      notifications = [];
    }
    
    // Filtrer seulement les notifications actives et les trier par date de création (plus récentes en premier)
    const activeNotifications = notifications
      .filter(n => n.is_active !== false)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return res.json(activeNotifications);
  } catch (err) {
    console.error('public notifications error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/public-notifications - Créer une nouvelle notification publique (admin seulement)
router.post('/', (req, res) => {
  try {
    const { title, content, type = 'general', action_url } = req.body || {};
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Titre et contenu requis' });
    }
    
    ensureDB();
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    let notifications = [];
    try {
      notifications = JSON.parse(raw || '[]');
    } catch (e) {
      notifications = [];
    }
    
    const newNotification = {
      id: Math.max(...notifications.map(n => n.id || 0), 0) + 1,
      title,
      content,
      type,
      action_url: action_url || null,
      created_at: new Date().toISOString(),
      is_active: true
    };
    
    notifications.push(newNotification);
    fs.writeFileSync(DB_FILE, JSON.stringify(notifications, null, 2));
    
    return res.status(201).json(newNotification);
  } catch (err) {
    console.error('create public notification error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/public-notifications/:id - Mettre à jour une notification publique (admin seulement)
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, action_url, is_active } = req.body || {};
    
    ensureDB();
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    let notifications = [];
    try {
      notifications = JSON.parse(raw || '[]');
    } catch (e) {
      return res.status(404).json({ message: 'Notifications non trouvées' });
    }
    
    const index = notifications.findIndex(n => n.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    
    // Mettre à jour les champs fournis
    if (title !== undefined) notifications[index].title = title;
    if (content !== undefined) notifications[index].content = content;
    if (type !== undefined) notifications[index].type = type;
    if (action_url !== undefined) notifications[index].action_url = action_url;
    if (is_active !== undefined) notifications[index].is_active = is_active;
    
    fs.writeFileSync(DB_FILE, JSON.stringify(notifications, null, 2));
    
    return res.json(notifications[index]);
  } catch (err) {
    console.error('update public notification error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/public-notifications/:id - Supprimer une notification publique (admin seulement)
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    ensureDB();
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    let notifications = [];
    try {
      notifications = JSON.parse(raw || '[]');
    } catch (e) {
      return res.status(404).json({ message: 'Notifications non trouvées' });
    }
    
    const index = notifications.findIndex(n => n.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    
    notifications.splice(index, 1);
    fs.writeFileSync(DB_FILE, JSON.stringify(notifications, null, 2));
    
    return res.json({ message: 'Notification supprimée' });
  } catch (err) {
    console.error('delete public notification error', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
