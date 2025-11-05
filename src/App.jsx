import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Accueil from './modules/produits/Accueil';
import ProductModal from './components/ProductModal';
import Connexion from './modules/auth/Connexion';
import Inscription from './modules/auth/Inscription';
import VerificationOTP from './modules/auth/VerificationOTP';
import Marketplace from './modules/marketplace/Marketplace';
import Vendeurs from './modules/marketplace/Vendeurs';
import ProfilVendeur from './modules/marketplace/ProfilVendeur';
import PublicationPrix from './modules/produits/PublicationPrix';
import ComparaisonPrix from './modules/produits/ComparaisonPrix';
import authService from './services/auth.service';
import BlogDetail from './modules/produits/BlogDetail';
import AdminBlogEditor from './pages/AdminBlogEditor';
import Profil from './modules/utilisateur/profil';
import Securite from './modules/utilisateur/securite';
import Notification from './modules/utilisateur/Notification';
import Confidentialite from './modules/utilisateur/Confidentialite';
import AdminDashboard from './pages/AdminDashboard';
import AdminSubscribers from './pages/AdminSubscribers';
import AdminLogs from './pages/AdminLogs';
import Socials from './modules/produits/Socials';
import PublicNotifications from './modules/produits/PublicNotifications';
import Avis from './modules/produits/Avis';

function PublishGuard() {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/connexion" replace />;
  const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  // We can't use hooks here to fetch synchronously; do a client-side redirect check via window.location if no boutique
  // Instead render PublicationPrix and rely on Accueil's checks when opening modal.
  return <PublicationPrix />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <ScrollToTop />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/comparaison" element={<div className="container mx-auto px-4 py-8"><ComparaisonPrix /></div>} />
          <Route path="/connexion" element={<div className="container mx-auto px-4 py-8"><Connexion /></div>} />
          <Route path="/inscription" element={<div className="container mx-auto px-4 py-8"><Inscription /></div>} />
          <Route path="/verification-otp" element={<div className="container mx-auto px-4 py-8"><VerificationOTP /></div>} />
          <Route path="/marketplace" element={<div className="container mx-auto px-4 py-8"><Marketplace /></div>} />
          <Route path="/vendeurs" element={<div className="container mx-auto px-4 py-8"><Vendeurs /></div>} />
          <Route path="/vendeur/:id" element={<div className="container mx-auto px-4 py-8"><ProfilVendeur /></div>} />
          <Route path="/publier" element={<div className="container mx-auto px-4 py-8"><PublishGuard /></div>} />
          <Route path="/ProductModal" element={<div className="container mx-auto px-4 py-8"><ProductModal/></div>} />
          <Route path="/blog/:slug" element={<div className="container mx-auto px-4 py-8"><BlogDetail /></div>} />
          <Route path="/profil" element={<div className="container mx-auto px-4 py-8"><Profil /></div>} />
          <Route path="/securite" element={<div className="container mx-auto px-4 py-8"><Securite /></div>} />
          <Route path="/notifications" element={<div className="container mx-auto px-4 py-8"><Notification /></div>} />
          <Route path="/confidentialite" element={<div className="container mx-auto px-4 py-8"><Confidentialite /></div>} />
          <Route path="/admin/blogs/new" element={<div className="container mx-auto px-4 py-8"><AdminBlogEditor/></div>} />
          <Route path="/admin" element={<div className="container mx-auto px-4 py-8"><AdminDashboard /></div>} />
          <Route path="/admin/subscribers" element={<div className="container mx-auto px-4 py-8"><AdminSubscribers /></div>} />
          <Route path="/admin/logs" element={<div className="container mx-auto px-4 py-8"><AdminLogs /></div>} />
          <Route path="/notifications-publiques" element={<div className="container mx-auto px-4 py-8"><PublicNotifications /></div>} />
          <Route path="/avis" element={<div className="container mx-auto px-4 py-8"><Avis /></div>} />
          <Route path="/login" element={<div className="container mx-auto px-4 py-8"><Connexion /></div>} />
          <Route path="/socials" element={<div className="container mx-auto px-4 py-8"><Socials /></div>} />

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

