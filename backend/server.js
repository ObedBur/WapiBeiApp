import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import authRoutes from './routes/auth.js';
import sellersRoutes from './routes/sellers.js';
import productsRoutes from './routes/products.js';
import messagesRoutes from './routes/messages.js';
import conversationsRoutes from './routes/conversations.js';
import usersRoutes from './routes/users.js';
import testimonialsRoutes from './routes/testimonials.js';
import notificationsRoutes from './routes/notifications.js';
import newsletterRoutes from './routes/newsletter.js';
import vendorClicksRoutes from './routes/vendorClicks.js';
import adminStatsRoutes from './routes/adminStats.js';
import publicStatsRoutes from './routes/publicStats.js';
import publicNotificationsRoutes from './routes/publicNotifications.js';
import subscribersRoutes from './routes/subscribers.js';
import statsRoutes from './routes/stats.routes.js';
import { initWebSocketServer } from './ws.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques uploads
app.use('/uploads', express.static('backend/uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sellers', sellersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/vendor-click', vendorClicksRoutes);
app.use('/api/admin/stats', adminStatsRoutes);
app.use('/api/public-stats', publicStatsRoutes);
app.use('/api/public-notifications', publicNotificationsRoutes);
app.use('/api/subscribers', subscribersRoutes);
app.use('/api/stats', statsRoutes);

const PORT = process.env.PORT || 5000;

// Create a plain HTTP server so we can attach WebSocket server to it
const server = http.createServer(app);

// Initialize WebSocket server
initWebSocketServer(server);

server.listen(PORT, () => {
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
