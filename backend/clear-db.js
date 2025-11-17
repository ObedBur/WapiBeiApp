import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'data', 'wapibei.db');

if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
    console.log('Base de données supprimée avec succès :', dbPath);
    console.log('La base sera recréée automatiquement au prochain démarrage du serveur.');
  } catch (err) {
    console.error('Erreur lors de la suppression de la base de données :', err);
    process.exit(1);
  }
} else {
  console.log('Aucune base de données trouvée à l\'emplacement :', dbPath);
}


