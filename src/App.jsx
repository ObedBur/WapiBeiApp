import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Accueil from './modules/produits/Accueil';
import ProductModal from './components/ProductModal';
import Connexion from './modules/auth/Connexion';
import Inscription from './modules/auth/Inscription';
import VerificationOTP from './modules/auth/VerificationOTP';
import Marketplace from './modules/marketplace/Marketplace';
import ProfilVendeur from './modules/marketplace/ProfilVendeur';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/verification-otp" element={<VerificationOTP />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/vendeur/:id" element={<ProfilVendeur />} />
          <Route Path="/ProductModal" element={<ProductModal/>}/>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

