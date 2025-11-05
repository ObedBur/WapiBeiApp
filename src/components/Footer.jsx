
import React from 'react';
import { Globe, Mail, WhatsApp } from './Icons';

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
                <span className="w-5 h-5 text-emerald-400 flex-shrink-0"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.1 2 4.6 3.6 2 6.4v3.1c0 .5.4.9.9.9h2.6c.5 0 .8-.3.9-.8l.4-1.6c.1-.4.5-.7.9-.7.6 0 1.9.4 2.9 1.1 1.5 1 3.1 2.6 3.9 4.2.7 1.2.7 2.4.3 3.3-.3.7-1 1.5-1.8 1.8-.7.3-1.5.2-2.7-.3l-.9-.4c-.4-.2-.8-.1-1 .2l-1.1 1c1.6 3 4.6 5 8.1 5 5 0 9-4 9-9 0-4.4-3.4-8-7.7-8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                <span className="text-gray-400">Nord-Kivu (Goma), RDC</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 text-emerald-400 flex-shrink-0"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.13 19.5 19.5 0 01-6-6 19.86 19.86 0 01-3.13-8.63A2 2 0 014.07 2h3a2 2 0 012 1.72c.12 1.05.38 2.07.76 3.03a2 2 0 01-.45 2.11L8.91 10.09a16 16 0 006 6l1.23-1.23a2 2 0 012.11-.45c.96.38 1.98.64 3.03.76A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                <a href="tel:+243974927593" className="text-gray-400">+243 974 927 593</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <a href="mailto:wapibeiapp@gmail.com" className="text-gray-400">wapibeiapp@gmail.com</a>
              </div>
              <div className="flex items-center gap-3">
                <WhatsApp className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <a href="https://wa.me/243974927593" target="_blank" rel="noreferrer" className="text-gray-400">WhatsApp 24/7</a>
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


