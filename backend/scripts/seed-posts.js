import db from '../config/database.js';

const posts = [
  {
    title: "10 Astuces Infaillibles pour Économiser sur vos Courses Alimentaires",
    slug: "10-astuces-economiser-courses",
    excerpt:
      "Réduisez efficacement votre budget courses grâce à des conseils pratiques sans sacrifier la qualité ni la variété de vos repas.",
    body: `
      <p>Apprenez à <strong>planifier vos repas</strong>, acheter en vrac, comparer les prix et privilégier les produits locaux. 
      Ces astuces vous aideront non seulement à économiser, mais aussi à consommer plus intelligemment.</p>
      <ul>
        <li>Faites une liste avant de partir</li>
        <li>Privilégiez les fruits et légumes de saison</li>
        <li>Évitez les achats impulsifs</li>
      </ul>
    `,
    cover_url: "https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg",
    author: "Équipe WapiBei",
    date: "2024-12-15",
    category: "Économie domestique"
  },
  {
    title: "Les Bienfaits des Produits Locaux Africains",
    slug: "bienfaits-produits-locaux-afrique",
    excerpt:
      "Privilégier les produits locaux, c’est investir dans sa santé, soutenir l’économie et protéger l’environnement.",
    body: `
      <p>Les produits locaux <strong>favorisent l'économie des communautés rurales</strong>, 
      réduisent l'empreinte carbone liée au transport et garantissent une fraîcheur optimale. 
      Ils préservent aussi les savoir-faire traditionnels et valorisent la biodiversité.</p>
      <blockquote>“Manger local, c’est nourrir sa santé et renforcer l’avenir de son pays.”</blockquote>
    `,
    cover_url: "https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg",
    author: "Dr. Amina Kone",
    date: "2024-01-12",
    category: "Alimentation durable"
  },
  {
    title: "Guide Complet pour Conserver vos Aliments Plus Longtemps",
    slug: "guide-conservation-aliments",
    excerpt:
      "Découvrez des techniques simples et efficaces pour prolonger la durée de vie de vos aliments et réduire le gaspillage.",
    body: `
      <p>De la <strong>congélation</strong> au <strong>rangement intelligent au réfrigérateur</strong>, 
      en passant par des astuces anti-gaspillage, apprenez à mieux gérer vos provisions. 
      Transformez vos restes en plats savoureux et évitez les pertes inutiles.</p>
    `,
    cover_url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    author: "Chef Mamadou",
    date: "15 Jan 2024",
    category: "Nutrition & Gaspillage"
  }
];


async function run() {
  try {
    for (const p of posts) {
      const [found] = await db.query('SELECT id FROM posts WHERE slug = ?', [p.slug]);
      if (found && found.length > 0) {
        console.log(`Post exists, skipping: ${p.slug}`);
        continue;
      }

      const [res] = await db.query(
        'INSERT INTO posts (title, slug, excerpt, body, cover_url, author, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [p.title, p.slug, p.excerpt, p.body, p.cover_url, p.author, new Date().toISOString()]
      );

      console.log(`Inserted post: ${p.slug} (id: ${res.insertId})`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error seeding posts:', err);
    process.exit(1);
  }
}

run(); 