import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-8">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Wapibei. Tous droits réservés.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Conditions d'utilisation
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Politique de confidentialité
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}


