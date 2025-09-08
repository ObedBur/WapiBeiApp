import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import sellersRoutes from './routes/sellers.js';
import productsRoutes from './routes/products.js';
import messagesRoutes from './routes/messages.js';
import conversationsRoutes from './routes/conversations.js';
import usersRoutes from './routes/users.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sellers', sellersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/users', usersRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 Serveur démarré avec succès !

📡 Backend API : http://localhost:${PORT}
🌐 Frontend   : http://localhost:5173/produits/accueil

Routes disponibles :
- Page d'accueil : http://localhost:5173/produits/accueil
- Auth API       : http://localhost:${PORT}/api/auth
- Uploads        : http://localhost:${PORT}/uploads
  `);
});
