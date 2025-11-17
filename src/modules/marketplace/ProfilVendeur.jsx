import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import authService from '../../services/auth.service';

import Produits from '../produits/Produits';
import Boutique from '../produits/Boutique';
import Infos from '../utilisateur/infos.jsx';
import Parametres from '../utilisateur/Parametres';
import { Star, ShoppingCart, Eye, User, Heart } from '../../components/Icons';

// Simple inline icon fallbacks (kept minimal to avoid new deps)
const ArrowLeft = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const MapPin = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M12 11.5a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 21s6-4.5 6-9.5A6 6 0 0012 5a6 6 0 00-6 6c0 5 6 9.5 6 9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Calendar = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
);
const Award = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M8 21l4-3 4 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
);
const TrendingUp = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Package = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M21 16V8a2 2 0 00-1-1.73L13 3a2 2 0 00-2 0L4 6.27A2 2 0 003 8v8a2 2 0 001 1.73L11 21a2 2 0 002 0l8-4.27A2 2 0 0021 16z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Share2 = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 6l-4-4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const MessageCircle = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Shield = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M12 2l7 3v6c0 5-4 9-7 11-3-2-7-6-7-11V5l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Verified = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M12 2l2 4 4 1-2 4 1 4-4-2-4 2 1-4-2-4 4-1 2-4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Clock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
);
const Users = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6"/></svg>
);

export default function ProfilVendeur({ sellerId: propSellerId }) {
  const { id: paramId } = useParams();
  const sellerId = propSellerId ?? paramId;
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('infos');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // Si l'identifiant vendeur est absent, ne créez pas de données fictives
    if (!sellerId || sellerId === 'undefined') {
      setLoading(false);
      setSeller(null);
      return;
    }

    const fetchSeller = async () => {
      setLoading(true);
      setError(null);
      try {
        const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
        const res = await fetch(`${BASE}/api/sellers/${sellerId}`);
        if (res.status === 404) {
          setSeller(null);
        } else if (!res.ok) {
          throw new Error('Erreur lors de la récupération du vendeur');
        } else {
          const data = await res.json();
          setSeller(data);
          // fetch products separately to ensure up-to-date list
          try {
            const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
            setLoadingProducts(true);
            const prow = await fetch(`${BASE}/api/sellers/${sellerId}/products`);
            if (prow.ok) {
              const pdata = await prow.json();
              setSeller((s) => ({ ...s, products: pdata.products || [] }));
            }
          } catch (e) {
            // ignore product load errors
          } finally {
            setLoadingProducts(false);
          }
        }
      } catch (e) {
        setError(e.message || 'Erreur');
      } finally {
        setLoading(false);
      }
    };

    fetchSeller();
  }, [sellerId]);

  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.id ?? currentUser?.user?.id ?? currentUser?.data?.id ?? currentUser?.userId ?? null;
  const owner = !!(userId && seller && String(userId) === String(seller.id ?? seller.userId ?? seller._id ?? seller.user?.id));

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareModal(false);
    // You could add a toast notification here
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Chargement du profil</h2>
        <p className="text-gray-600">Veuillez patienter...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Erreur</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );

  if (!seller) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Vendeur introuvable</h2>
        <p className="text-gray-600 mb-4">Ce profil n'existe pas ou a été supprimé.</p>
        <button 
          onClick={() => window.history.back()} 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retour
        </button>
      </div>
    </div>
  );

  // Compute BASE and avatarUrl so frontend loads uploaded images from backend host
  const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const avatarUrl = seller?.avatar
    ? (seller.avatar.startsWith('/uploads') ? `${BASE}${seller.avatar}` : seller.avatar)
    : '/src/assets/react.svg';
  
  // Enhanced stats with fallbacks
  const ordersCount = seller?.ordersCount ?? seller?.stats?.ordersCount ?? 0;
  const totalSpent = seller?.spent ?? seller?.stats?.spent ?? 0;
  const rating = seller?.rating ?? seller?.stats?.rating ?? 4.5;
  const reviewsCount = seller?.reviewsCount ?? seller?.stats?.reviewsCount ?? 0;
  const followersCount = seller?.followersCount ?? seller?.stats?.followersCount ?? 0;
  const responseTime = seller?.responseTime ?? '< 2h';
  const joinDate = seller?.date_inscription ? new Date(seller.date_inscription) : new Date();

  const tabs = [
    { id: 'infos', label: 'À propos', icon: User },
    { id: 'produits', label: 'Produits', icon: Package },
    ...(owner ? [
      { id: 'boutique', label: 'Ma boutique', icon: ShoppingCart },
      { id: 'params', label: 'Paramètres', icon: Star }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => window.history.back()} 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>

            {!owner && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 border border-white/20"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isFollowing 
                      ? 'bg-white/20 text-white border border-white/30' 
                      : 'bg-white text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {isFollowing ? 'Suivi' : 'Suivre'}
                </button>
              </div>
            )}
          </div>

          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-2xl overflow-hidden">
                  <img 
                    src={avatarUrl} 
                    alt={`${seller.name} avatar`} 
                    className="w-full h-full object-cover rounded-2xl" 
                  />
                </div>
                {seller.verified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <Verified className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              <div className="text-center sm:text-left">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">{seller.name ?? seller.email}</h1>
                  {seller.isPremium && (
                    <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                      <Award className="w-4 h-4 text-white inline mr-1" />
                      <span className="text-xs font-semibold text-white">Premium</span>
                    </div>
                  )}
                </div>
                
                <p className="text-blue-100 text-lg mb-3">{seller.email}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Membre depuis {joinDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </div>
                  {seller.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {seller.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Répond en {responseTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-6 h-6 text-blue-200" />
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{ordersCount}</div>
                  <div className="text-xs text-blue-200">Produits vendus</div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <Star className="w-6 h-6 text-yellow-400" />
                    <span className="text-xs text-blue-200">({reviewsCount})</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{rating}/5</div>
                  <div className="text-xs text-blue-200">Note moyenne</div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-6 h-6 text-purple-300" />
                    <Heart className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{followersCount}</div>
                  <div className="text-xs text-blue-200">Abonnés</div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="w-6 h-6 text-green-300" />
                    <span className="text-xs text-green-400">+12%</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{totalSpent || '2.4k'}</div>
                  <div className="text-xs text-blue-200">Vues profil</div>
                </div>
              </div>

              {/* Quick Actions */}
              {!owner && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-all duration-200 border border-white/20">
                    <MessageCircle className="w-4 h-4" />
                    Contacter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-all duration-200 border border-white/20">
                    <ShoppingCart className="w-4 h-4" />
                    Voir la boutique
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 font-medium transition-all duration-200 whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
          {activeTab === 'infos' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">À propos de {seller.name}</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    {seller.description || "Ce vendeur n'a pas encore ajouté de description à son profil."}
                  </p>
                </div>
              </div>

              {seller.specialties && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Spécialités</h4>
                  <div className="flex flex-wrap gap-2">
                    {seller.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Infos seller={seller} />
            </div>
          )}

          {activeTab === 'produits' && (
            <div>
              {!seller.boutique ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune boutique</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {owner 
                      ? "Vous devez créer une boutique avant de publier des produits."
                      : "Ce vendeur n'a pas encore créé sa boutique."
                    }
                  </p>
                  {owner && (
                    <button 
                      onClick={() => setActiveTab('boutique')} 
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                      Créer ma boutique
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Produits</h3>
                    {loadingProducts && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Mise à jour...</span>
                      </div>
                    )}
                  </div>
                  <Produits 
                    products={seller.products || []} 
                    openPublish={false} 
                    onAddProduct={(p) => { 
                      setSeller((s) => ({ ...s, products: [...(s.products || []), p] }));
                      // refresh products from server after creation
                      (async () => {
                        try {
                          const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
                          setLoadingProducts(true);
                          const prow = await fetch(`${BASE}/api/sellers/${sellerId}/products`);
                          if (prow.ok) {
                            const pdata = await prow.json();
                            setSeller((s) => ({ ...s, products: pdata.products || [] }));
                          }
                        } catch (e) {}
                        finally { setLoadingProducts(false); }
                      })();
                    }} 
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'boutique' && (
            <div>
              <Boutique
                boutique={seller.boutique}
                owner={owner}
                onCreate={(b) => setSeller((s) => ({ ...s, boutique: b }))}
                onEdit={(b) => setSeller((s) => ({ ...s, boutique: b }))}
                onManage={() => setActiveTab('produits')}
              />
            </div>
          )}

          {activeTab === 'params' && (
            <div>
              <Parametres />
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Partager ce profil</h3>
            <div className="space-y-3">
              <button 
                onClick={copyProfileLink}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium text-gray-900">Copier le lien</span>
              </button>
            </div>
            <button 
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}