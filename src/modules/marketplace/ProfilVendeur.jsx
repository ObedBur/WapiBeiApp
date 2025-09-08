import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import authService from '../../services/auth.service';
import Produits from '../produits/Produits';
import Boutique from '../produits/Boutique';
import Infos from '../utilisateur/infos.jsx';
import Parametres from '../utilisateur/Parametres';
import { Star, ShoppingCart, Eye, User } from '../../components/Icons';

export default function ProfilVendeur({ sellerId: propSellerId }) {
  const { id: paramId } = useParams();
  const sellerId = propSellerId ?? paramId;
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('infos');

  useEffect(() => {
    // Treat missing, empty or string 'undefined' as absent
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

  if (loading) return (
    <div>
      <h2>Profil du vendeur</h2>
      <p>Chargement…</p>
    </div>
  );

  if (error) return (
    <div>
      <h2>Profil du vendeur</h2>
      <p>Erreur: {error}</p>
    </div>
  );

  if (!seller) return (
    <div>
      <h2>Profil du vendeur</h2>
      <p>Vendeur introuvable.</p>
    </div>
  );

  // Compute BASE and avatarUrl so frontend loads uploaded images from backend host
  const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const avatarUrl = seller?.avatar
    ? (seller.avatar.startsWith('/uploads') ? `${BASE}${seller.avatar}` : seller.avatar)
    : '/src/assets/react.svg';
  // small derived stats (fallbacks)
  const ordersCount = seller?.ordersCount ?? seller?.stats?.ordersCount ?? 0;
  const totalSpent = seller?.spent ?? seller?.stats?.spent ?? '—';
  const rating = seller?.rating ?? seller?.stats?.rating ?? '—';

  return (
    <div>
      <header role="banner" className="mb-6">
        <div className="max-w-7xl mx-auto px-2 md:px-0">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => window.history.back()} aria-label="Retour" className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 shadow-sm">← Mon Profil</button>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white rounded-2xl p-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg overflow-hidden">
                  <img src={avatarUrl} alt={`${seller.name} avatar`} className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                  <div className="text-4xl font-extrabold leading-tight">{seller.name ?? seller.email}</div>
                  <div className="text-sm opacity-90 mt-1">{seller.email}</div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Membre depuis {seller.date_inscription ? new Date(seller.date_inscription).toLocaleDateString('fr-FR') : '—'}</span>
                    {owner && <button onClick={() => setActiveTab('boutique')} className="text-xs bg-white/10 px-3 py-1 rounded-full">Gérer ma boutique</button>}
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <div className="bg-white/10 px-5 py-3 rounded-lg text-center min-w-[110px]">
                  <div className="text-2xl font-bold">{ordersCount}</div>
                  <div className="text-xs opacity-90 flex items-center justify-center gap-2"><ShoppingCart className="inline" /> Produits</div>
                </div>
                <div className="bg-white/10 px-5 py-3 rounded-lg text-center min-w-[110px]">
                  <div className="text-2xl font-bold">{totalSpent}</div>
                  <div className="text-xs opacity-90 flex items-center justify-center gap-2"><Eye className="inline" /> Vues</div>
                </div>
                <div className="bg-white/10 px-5 py-3 rounded-lg text-center min-w-[110px]">
                  <div className="text-2xl font-bold">{rating}</div>
                  <div className="text-xs opacity-90 flex items-center justify-center gap-2"><Star className="inline text-yellow-300" /> Note</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {owner && (
        <nav className="flex gap-4 my-4 border-b pb-2">
          <button className={`flex items-center gap-2 px-3 py-2 rounded-md ${activeTab==='commandes'?'bg-emerald-50 text-emerald-700 font-semibold':'text-gray-600'}`} onClick={() => setActiveTab('commandes')}><ShoppingCart/> Mes commandes</button>
          <button className={`flex items-center gap-2 px-3 py-2 rounded-md ${activeTab==='boutique'?'bg-emerald-50 text-emerald-700 font-semibold':'text-gray-600'}`} onClick={() => setActiveTab('boutique')}><User/> Ma boutique</button>
          <button className={`flex items-center gap-2 px-3 py-2 rounded-md ${activeTab==='params'?'bg-emerald-50 text-emerald-700 font-semibold':'text-gray-600'}`} onClick={() => setActiveTab('params')}><Star/> Paramètres</button>
        </nav>
      )}

      <div className="mt-4">
        {activeTab === 'infos' && (
          <div>
            <Infos seller={seller} />
          </div>
        )}

        {activeTab === 'produits' && (
          <div>
            {!seller.boutique ? (
              <div className="text-center py-8">
                <div className="text-lg font-semibold mb-2">Vous devez créer une boutique avant de publier des produits.</div>
                <p className="text-gray-500 mb-4">Créez votre boutique pour pouvoir ajouter des produits.</p>
                {owner ? (
                  <button onClick={() => setActiveTab('boutique')} className="px-4 py-2 bg-emerald-600 text-white rounded-md">Créer ma boutique</button>
                ) : (
                  <div className="text-gray-500">Le vendeur n’a pas encore de boutique.</div>
                )}
              </div>
            ) : (
              <Produits products={seller.products || []} openPublish={false} onAddProduct={(p) => { setSeller((s) => ({ ...s, products: [...(s.products || []), p] }));
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
              }} />
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
  );
}


