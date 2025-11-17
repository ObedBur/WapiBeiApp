import db from '../config/database.js';

const testimonials = [
  { name: 'Fatou S.', avatar: '/uploads/profile-photos/1756991318697-820363636.jpg', text: "Wapibei m'a permis de trouver des produits locaux de qualité à des prix imbattables. Livraison rapide et service client au top !", location: 'Dakar, Sénégal' },
  { name: 'Jean-Marc K.', avatar: '/uploads/profile-photos/1756991334880-589206063.jpg', text: "J'adore la simplicité d'utilisation et la sécurité des paiements. Je recommande à tous mes amis commerçants.", location: "Abidjan, Côte d'Ivoire" },
  { name: 'Aminata D.', avatar: '/uploads/profile-photos/1756991741639-852254444.jpg', text: "Le choix de produits est impressionnant et la livraison express m'a vraiment dépannée. Merci Wapibei !", location: 'Bamako, Mali' },
];

async function run() {
  try {
    for (const t of testimonials) {
      const [found] = await db.query('SELECT id FROM testimonials WHERE name = ? AND text = ?', [t.name, t.text]);
      if (found && found.length > 0) {
        console.log(`Skip existing testimonial: ${t.name}`);
        continue;
      }
      const [res] = await db.query('INSERT INTO testimonials (name, avatar, text, location) VALUES (?, ?, ?, ?)', [t.name, t.avatar, t.text, t.location]);
      console.log(`Inserted testimonial: ${t.name} (id: ${res.insertId})`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error seeding testimonials:', err);
    process.exit(1);
  }
}

run(); 