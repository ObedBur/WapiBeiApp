
import React from 'react';
import { Globe, Mail } from './Icons';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold">WapiBei</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
              La plateforme de référence pour comparer et acheter vos produits alimentaires en Afrique. Économisez plus, achetez mieux.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors">F</a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors">T</a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors">I</a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Navigation</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Accueil</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Marketplace</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Comparer</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">À propos</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Livraison</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Retours</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 text-emerald-400 flex-shrink-0">📍</span>
                <span className="text-gray-400">Nord-Kivu[Goma], RDC</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 text-emerald-400 flex-shrink-0">📞</span>
                <span className="text-gray-400">+243 974 927 593</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-400">wapibeiapp@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 text-emerald-400 flex-shrink-0">📱</span>
                <span className="text-gray-400">WhatsApp 24/7</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-center md:text-left">© 2025 WapiBei. Tous droits réservés. Fait avec l'equipe technique WapiBei en Afrique.</p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


