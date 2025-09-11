import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import { User, ShoppingCart, Mail } from './Icons';

const Messagerie = React.lazy(() => import('../modules/messagerie/Messagerie'));

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
        <div className="flex items-center h-16">
          {/* Left: logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg">
                🌐
              </div>
              <span className="text-2xl font-bold text-emerald-600">WapiBei</span>
            </Link>
          </div>

          {/* Center: navigation */}
          <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Accueil</Link>
              <Link to="/marketplace" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Marketplace</Link>
            </nav>
          </div>

          {/* Right: icons & actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-md hover:bg-gray-100" aria-label="Notifications">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
              </svg>
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-red-100 bg-red-600 rounded-full">3</span>
            </button>

            
            {/* Profil Icon */}
            <Link to={profileLink} className="p-2 rounded-md hover:bg-gray-100" aria-label="Profil">
              <User className="h-5 w-5 text-gray-700" />
            </Link>

            {/* Panier (Cart) Icon */}
            <Link to="/marketplace#cart" className="p-2 rounded-md hover:bg-gray-100" aria-label="Panier">
              <ShoppingCart className="h-5 w-5 text-gray-700" />
            </Link>

            {/* Message Icon */}
            <button onClick={() => setShowMessagerie(true)} className="p-2 rounded-md hover:bg-gray-100" aria-label="Messagerie">
              <Mail className="h-5 w-5 text-gray-700" />
            </button>

            {/* Connexion Button */}
            {!user && (
              <Link to="/login" className="ml-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>

      {showMessagerie && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="absolute top-4 right-4">
            <button onClick={() => setShowMessagerie(false)} className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg bg-white border border-gray-200" aria-label="Fermer la messagerie">✖</button>
          </div>
          <div className="h-full">
            <React.Suspense fallback={<div className="p-6">Chargement de la messagerie...</div>}>
              <Messagerie />
            </React.Suspense>
          </div>
        </div>
      )}

      
    </header>
  );
}