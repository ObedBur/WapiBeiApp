import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import Messagerie from '../modules/messagerie/Messagerie';

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  // normalize possible shapes: { id }, { user: { id } }, { data: { id } }
  const currentUser = user ?? null;
  const userId = currentUser?.id ?? currentUser?.user?.id ?? currentUser?.data?.id ?? currentUser?.userId ?? null;
  const profileLink = userId ? `/vendeur/${userId}` : '/connexion';

  const [showMessagerie, setShowMessagerie] = useState(false);

  useEffect(() => {
    const onStorage = () => setUser(authService.getCurrentUser());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const handler = () => {
      setShowMessagerie(true);
      // If Messagerie is not mounted yet it may miss the original event.
      // Re-dispatch after a short delay so Messagerie can read localStorage and react.
      setTimeout(() => window.dispatchEvent(new Event('open-messagerie')), 120);
    };
    window.addEventListener('open-messagerie', handler);
    return () => window.removeEventListener('open-messagerie', handler);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
  };

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
                to={profileLink} 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Profil
              </Link>
              <button
                onClick={() => setShowMessagerie(true)}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                aria-haspopup="dialog"
              >
                Messagerie
              </button>
            </nav>

          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button onClick={handleLogout} className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium border border-transparent rounded-lg hover:border-gray-200">Se déconnecter</button>
                <Link to={profileLink} className="bg-primary text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200">Mon profil</Link>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {showMessagerie && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowMessagerie(false)}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg bg-white border border-gray-200"
              aria-label="Fermer la messagerie"
            >
              ✖
            </button>
          </div>
          <div className="h-full">
            <Messagerie />
          </div>
        </div>
      )}
    </header>
  );
}