import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Accueil from './modules/produits/Accueil';
import ProductModal from './components/ProductModal';
import Connexion from './modules/auth/Connexion';
import Inscription from './modules/auth/Inscription';
import VerificationOTP from './modules/auth/VerificationOTP';
import Marketplace from './modules/marketplace/Marketplace';
import ProfilVendeur from './modules/marketplace/ProfilVendeur';
import PublicationPrix from './modules/produits/PublicationPrix';
import ComparaisonPrix from './modules/produits/ComparaisonPrix';
import authService from './services/auth.service';

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
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/comparaison" element={<div className="container mx-auto px-4 py-8"><ComparaisonPrix /></div>} />
          <Route path="/connexion" element={<div className="container mx-auto px-4 py-8"><Connexion /></div>} />
          <Route path="/inscription" element={<div className="container mx-auto px-4 py-8"><Inscription /></div>} />
          <Route path="/verification-otp" element={<div className="container mx-auto px-4 py-8"><VerificationOTP /></div>} />
          <Route path="/marketplace" element={<div className="container mx-auto px-4 py-8"><Marketplace /></div>} />
          <Route path="/vendeur/:id" element={<div className="container mx-auto px-4 py-8"><ProfilVendeur /></div>} />
          <Route path="/publier" element={<div className="container mx-auto px-4 py-8"><PublishGuard /></div>} />
          <Route Path="/ProductModal" element={<div className="container mx-auto px-4 py-8"><ProductModal/></div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

