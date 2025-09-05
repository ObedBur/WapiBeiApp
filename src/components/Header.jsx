import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-primary">
                Wapibei
              </Link>
            </div>
            <nav className="hidden md:flex items-center ml-10 space-x-8">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Accueil
              </Link>
              <Link 
                to="/marketplace" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Marketplace
              </Link>
              <Link 
                to="/profil" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Profil
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/connexion" 
              className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium border border-transparent rounded-lg hover:border-gray-200"
            >
              Connexion
            </Link>
            <Link 
              to="/inscription" 
              className="bg-primary text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              Inscription
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}


