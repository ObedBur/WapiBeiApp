import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import { User, ShoppingCart, Mail, X, Bell } from './Icons';
import { fetchWithAuth } from '../utils/api';
import LoginButton from './LoginButton';

const Messagerie = React.lazy(() => import('../modules/messagerie/Messagerie'));

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // normalize possible shapes: { id }, { user: { id } }, { data: { id } }
  const currentUser = user ?? null;
  const userId = currentUser?.id ?? currentUser?.user?.id ?? currentUser?.data?.id ?? currentUser?.userId ?? null;
  const role = currentUser?.role ?? currentUser?.user?.role ?? currentUser?.data?.role ?? null;
  const isAdmin = role === 'admin' || role === 'vendeur';
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const profileLink = userId ? `/vendeur/${userId}` : '/connexion';

  const [showMessagerie, setShowMessagerie] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifPreview, setNotifPreview] = useState([]);

  useEffect(() => {
    const onStorage = () => setUser(authService.getCurrentUser());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Load unread count and preview notifications for header
  useEffect(() => {
    let mounted = true;
    async function loadHeaderNotifs() {
      try {
        const data = await fetchWithAuth('/api/notifications?limit=3');
        if (!mounted) return;
        if (Array.isArray(data)) {
          setNotifPreview(data.slice(0, 3));
          setUnreadCount(data.filter(n => !n.is_read).length);
        }
      } catch (e) {
        // ignore header fetch errors
        console.debug('Header notifications load failed', e);
      }
    }
    loadHeaderNotifs();
    return () => { mounted = false; };
  }, [user]);

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

  // Close overlays on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setAdminMenuOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center h-16 justify-between">
          {/* Left: logo + mobile menu button */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg">🌐</div>
              <span className="text-xl sm:text-2xl font-bold text-emerald-600">WapiBei</span>
            </Link>
          </div>

          {/* Center: navigation + search (desktop) */}
          <div className="flex-1 flex items-center justify-center">
            <nav className="hidden md:flex items-center space-x-6 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
              <Link to="/" className="text-gray-600 hover:text-emerald-700 px-3 py-2 text-sm font-medium rounded-md hover:bg-emerald-50 transition transform duration-150">Accueil</Link>
              <Link to="/marketplace" className="text-gray-600 hover:text-emerald-700 px-3 py-2 text-sm font-medium rounded-md hover:bg-emerald-50 transition transform duration-150">Marketplace</Link>
              {isAdmin && (
                <div className="relative">
                  <button onClick={() => setAdminMenuOpen((s) => !s)} className="text-gray-600 hover:text-emerald-700 px-3 py-2 text-sm font-medium inline-flex items-center gap-2 rounded-md hover:bg-emerald-50 transition duration-150">
                    Admin <span className="text-xs">▾</span>
                  </button>
                  {adminMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link to="/admin" onClick={() => setAdminMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Statistiques</Link>
                      <Link to="/admin/subscribers" onClick={() => setAdminMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Abonnés newsletter</Link>
                      <Link to="/admin/logs" onClick={() => setAdminMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logs</Link>
                      <Link to="/admin/blogs/new" onClick={() => setAdminMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Publier un article</Link>
                    </div>
                  )}
                </div>
              )}
            </nav>

            <div className="w-full px-4 md:px-0 max-w-2xl">
              <input
                className="w-full md:w-full lg:hidden placeholder-gray-400 bg-white/70 border border-gray-200 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm hover:shadow-md transition-shadow duration-200"
                placeholder="Rechercher un produit, une catégorie ou un vendeur..."
                aria-label="Rechercher"
              />
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {/* mobile: nothing here, search input is centered */}

            <div className="hidden md:flex items-center space-x-3">
              <div className="relative">
                <button onClick={() => setNotifOpen((s) => !s)} className="relative p-2 rounded-md hover:bg-emerald-50 transition-colors duration-150" aria-label="Notifications">
                  <Bell className="h-5 w-5 text-gray-700 transform transition-transform duration-200 hover:scale-110" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">{unreadCount}</span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-3 z-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold">Notifications récentes</div>
                      <Link to="/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-emerald-600 hover:underline">Voir tout</Link>
                    </div>
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {notifPreview.length === 0 && <div className="text-sm text-gray-500">Aucune notification récente</div>}
                      {notifPreview.map(n => (
                        <Link key={n.id} to="/notifications" onClick={() => setNotifOpen(false)} className={`block p-2 rounded-md hover:bg-gray-50 ${n.is_read ? 'bg-white' : 'bg-emerald-50 border border-emerald-100'}`}>
                          <div className="text-sm font-medium text-gray-900">{n.title}</div>
                          <div className="text-xs text-gray-500 truncate">{n.body}</div>
                          <div className="text-2xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link to={profileLink} className="p-2 rounded-full hover:bg-emerald-50 transition-colors duration-150" aria-label="Profil"><User className="h-5 w-5 text-gray-700 transform transition-transform duration-200 hover:scale-110" /></Link>
              <Link to="/marketplace#cart" className="p-2 rounded-full hover:bg-emerald-50 transition-colors duration-150" aria-label="Panier"><ShoppingCart className="h-5 w-5 text-gray-700 transform transition-transform duration-200 hover:scale-110" /></Link>
              <button onClick={() => setShowMessagerie(true)} className="p-2 rounded-full hover:bg-emerald-50 transition-colors duration-150" aria-label="Messagerie"><Mail className="h-5 w-5 text-gray-700 transform transition-transform duration-200 hover:scale-110" /></button>
              {!user && <LoginButton className="ml-3" />}
            </div>

            {/* Mobile: show minimal icons if not logged in */}
            {/* mobile: hamburger on right */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-md hover:bg-gray-100" aria-label="Ouvrir le menu">
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {/* Mobile menu overlay with animation and modern style */}
      <div>
        {/* Overlay */}
        <div
          className={`fixed inset-0 z-50 bg-black/40 md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden={!mobileMenuOpen}
        />

        {/* Sliding menu */}
        <aside
          className={`
            fixed left-0 top-0 h-full w-11/12 max-w-xs bg-white shadow-2xl z-[60] p-6
            transform transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            rounded-r-3xl
            md:hidden
          `}
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
          onClick={e => e.stopPropagation()}
          role="menu"
          aria-label="Menu mobile"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="text-2xl font-extrabold text-emerald-600 tracking-tight flex items-center gap-2">
              <span className="inline-block bg-emerald-100 rounded-full p-2 shadow-inner">🌐</span>
              WapiBei
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-emerald-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Fermer le menu"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          <nav className="flex flex-col gap-2 text-lg font-medium">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100 group"
            >
              <span className="transition-transform duration-200 group-hover:scale-110">🏠</span>
              Accueil
            </Link>
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100 group"
            >
              <span className="transition-transform duration-200 group-hover:scale-110">🛒</span>
              Marketplace
            </Link>
            <Link
              to="/vendeurs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100 group"
            >
              <span className="transition-transform duration-200 group-hover:scale-110">🧑‍🌾</span>
              Vendeurs
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100 group"
              >
                <span className="transition-transform duration-200 group-hover:scale-110">⚙️</span>
                Admin
              </Link>
            )}
            <Link
              to={profileLink}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700 active:bg-emerald-100 group"
            >
              <span className="transition-transform duration-200 group-hover:scale-110">👤</span>
              Profil
            </Link>
          </nav>
          <div className="mt-10 flex flex-col gap-3">
            {!user && <LoginButton onClick={() => setMobileMenuOpen(false)} className="w-full text-center" />}
          </div>
        </aside>
      </div>

      {/* mobile search removed (search input is centered for all sizes) */}

      {showMessagerie && (
        <div className="fixed inset-0 z-50 bg-white">
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