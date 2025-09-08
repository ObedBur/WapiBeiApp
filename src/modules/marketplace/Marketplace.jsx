import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';

export default function Marketplace() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & filters
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sort, setSort] = useState('relevance');
  const [view, setView] = useState('grid');
  
  const [showContactModal, setShowContactModal] = useState(false);
  const [contact, setContact] = useState({});

  
  // Cart (simple)
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  // Base URL for API
  const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const navigate = useNavigate();
  const [currentUserData, setCurrentUserData] = useState(null);

  // Load current user details (to show avatar on profile button)
  useEffect(() => {
    const load = async () => {
      try {
        const raw = authService.getCurrentUser();
        const id = raw?.user?.id ?? raw?.id ?? raw?.userId ?? null;
        if (!id) return setCurrentUserData(null);
        const res = await fetch(`${BASE}/api/sellers/${id}`);
        if (!res.ok) return setCurrentUserData(null);
        const data = await res.json();
        setCurrentUserData(data);
      } catch (e) {
        setCurrentUserData(null);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE}/api/products`);
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Bad response ${res.status}: ${txt}`);
        }
        const contentType = res.headers.get('content-type') || '';
        let data;
        if (contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const txt = await res.text();
          throw new Error(`Expected JSON but got: ${txt.slice(0,200)}`);
        }
        if (!cancelled) setProducts(Array.isArray(data) ? data : (data.products || []));
      } catch (err) {
        console.error('Failed to load products from backend:', err);
        if (!cancelled) setProducts([]); // explicitly empty if backend not available
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Helpers to safely parse and format price values coming from the backend
  const parsePrice = (value) => {
    if (value == null) return 0;
    if (typeof value === 'number') return value;
    // extract digits and decimal separator
    const cleaned = String(value).replace(/[^0-9,\.\-]/g, '').replace(',', '.');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const formatPrice = (value) => {
    const n = parsePrice(value);
    try { return n.toLocaleString('fr-FR'); } catch (e) { return String(n); }
  };

  // Resolve image paths (prefix /uploads with BASE)
  const resolveImageUrl = (src) => {
    if (!src) return null;
    try {
      if (typeof src !== 'string') return src;
      if (src.startsWith('blob:')) return src;
      if (/^https?:\/\//i.test(src)) return src;
      if (src.startsWith('/uploads')) return `${BASE}${src}`;
      return src;
    } catch (e) { return src; }
  };

  // Fetch seller details cache
  const [sellersById, setSellersById] = useState({});

  const fetchSellerIfNeeded = async (sellerId) => {
    if (!sellerId) return null;
    if (sellersById[sellerId]) return sellersById[sellerId];
    try {
      const res = await fetch(`${BASE}/api/sellers/${sellerId}`);
      if (!res.ok) return null;
      const data = await res.json();
      setSellersById(prev => ({ ...prev, [sellerId]: data }));
      return data;
    } catch (e) {
      return null;
    }
  };

  // After products load, prefetch seller names for those with seller_id
  useEffect(() => {
    (async () => {
      const ids = Array.from(new Set(products.map(p => p.seller_id).filter(Boolean)));
      await Promise.all(ids.map(id => fetchSellerIfNeeded(id)));
    })();
  }, [products]);

  // Open seller modal and ensure full seller data is loaded
  const openSellerModal = async (sellerId, initial = {}) => {
    if (!sellerId) return;
    // show basic info immediately
    setSelectedSeller({ id: sellerId, ...initial });
    // fetch full seller info and merge
    try {
      const full = await fetchSellerIfNeeded(sellerId);
      if (full) setSelectedSeller(prev => ({ ...(prev || {}), ...full }));
    } catch (e) {
      // ignore
    }
  };

  const cities = Array.from(new Set(products.map(p => p.city))).filter(Boolean);
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  // computed sellerFull for modal rendering
  const sellerFull = selectedSeller ? (sellersById[selectedSeller.id] || selectedSeller) : null;

  // Build a safe sellers array for selectedProduct modal: prefer selectedProduct.sellers, otherwise derive from seller_id
  const selectedProductSellers = (() => {
    if (!selectedProduct) return [];
    if (Array.isArray(selectedProduct.sellers)) return selectedProduct.sellers;
    if (selectedProduct.seller_id) {
      const sid = selectedProduct.seller_id;
      const s = sellersById[sid];
      return [{ id: sid, name: s?.name || 'Vendeur inconnu', city: s?.ville || selectedProduct.city || '', price: selectedProduct.price || s?.price, rating: s?.rating, contact: s?.contact }];
    }
    return [];
  })();

  // Lock body scroll and close modals on Escape when contact modal is open
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setShowContactModal(false); };
    if (showContactModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [showContactModal]);

  const normalize = (s) => String(s || '').toLowerCase();

  const filtered = products
    .filter(p => cityFilter === 'all' ? true : p.city === cityFilter)
    .filter(p => categoryFilter === 'all' ? true : p.category === categoryFilter)
    .filter(p => {
      if (!query) return true;
      return normalize(p.name).includes(normalize(query)) || normalize(p.description).includes(normalize(query)) || normalize(p.category).includes(normalize(query));
    })
    .filter(p => {
      const min = priceMin ? Number(priceMin) : -Infinity;
      const max = priceMax ? Number(priceMax) : Infinity;
      const priceVal = parsePrice(p.price);
      return priceVal >= min && priceVal <= max;
    });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-asc') return parsePrice(a.price) - parsePrice(b.price);
    if (sort === 'price-desc') return parsePrice(b.price) - parsePrice(a.price);
    if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
    // relevance / name
    return a.name.localeCompare(b.name);
  });

  const addToCart = (product, seller = null) => {
    setCart((prev) => {
      const prixVal = seller?.price ?? product.price ?? '';
      const itemId = `${product.id}${seller?.id?`-s${seller.id}`:''}`;
      const existing = prev.find((it) => it.id === itemId);
      if (existing) {
        const updated = prev.map((it) => it.id === itemId ? { ...it, qty: (it.qty || 1) + 1 } : it);
        showToast(`${product.name} ajouté au panier`);
        return updated;
      }
      showToast(`${product.name} ajouté au panier`);
      return [...prev, { id: itemId, nom: product.name || product.nom || '', prix: prixVal, qty: 1 }];
    });
  };

  const contactSeller = (contact) => {
    // Conditions on contact
    if (contact?.whatsapp) {
      const n = normalizePhone(contact.whatsapp);
      if (n) window.open(`https://wa.me/${n.replace(/^\+/, '')}`, '_blank');
      return;
    }
    if (contact?.phone) {
      const n = normalizePhone(contact.phone);
      window.location.href = `tel:${n || contact.phone}`;
      return;
    }
    if (contact?.email) {
      window.location.href = `mailto:${contact.email}`;
      return;
    }
    alert('Contact non disponible.');
  };

  const chooseContactMethod = (contact = {}) => {
    const options = [];
    if (contact.whatsapp) options.push("WhatsApp");
    if (contact.phone) options.push("Téléphone");
    if (contact.email) options.push("Email");
  
    if (options.length === 0) {
      alert("Aucun moyen de contact disponible.");
      return;
    }
  
    const choice = prompt(`Choisissez un mode de contact :\n${options.join("\n")}`);
    
    if (choice?.toLowerCase().includes("whatsapp")) {
      const num = String(contact.whatsapp).replace(/\D/g, '');
      window.open(`https://wa.me/${num}`, "_blank");
    } else if (choice?.toLowerCase().includes("téléphone")) {
      window.location.href = `tel:${contact.phone}`;
    } else if (choice?.toLowerCase().includes("email")) {
      window.location.href = `mailto:${contact.email}`;
    }
  };
  
  // Normalize contact information from seller-like objects or contact sub-objects
  const normalizeContact = (sellerOrContact) => {
    if (!sellerOrContact) return {};
    // If it's already a contact object (has whatsapp/phone/email), return normalized keys
    const possible = sellerOrContact;
    const contact = {};
    if (possible.whatsapp) contact.whatsapp = possible.whatsapp;
    if (possible.phone) contact.phone = possible.phone;
    if (possible.telephone && !contact.phone) contact.phone = possible.telephone;
    if (possible.email) contact.email = possible.email;
    // If there's a nested contact object, merge missing fields
    if (possible.contact && typeof possible.contact === 'object') {
      if (!contact.whatsapp && possible.contact.whatsapp) contact.whatsapp = possible.contact.whatsapp;
      if (!contact.phone && possible.contact.phone) contact.phone = possible.contact.phone;
      if (!contact.email && possible.contact.email) contact.email = possible.contact.email;
      if (!contact.phone && possible.contact.contactPhone) contact.phone = possible.contact.contactPhone;
    }
    // If whatsapp is not explicitly provided, fall back to phone/telephone so the WhatsApp action is available
    if (!contact.whatsapp && contact.phone) contact.whatsapp = contact.phone;
    return contact;
  };

  // Normalize phone numbers to international format for wa.me and tel:
  const normalizePhone = (raw) => {
    if (!raw) return null;
    let s = String(raw).trim();
    // remove spaces, parentheses, dashes
    s = s.replace(/[^0-9+]/g, '');
    // if starts with + keep, if starts with 00 convert to +, else add country code if looks local
    if (s.startsWith('00')) s = '+' + s.slice(2);
    if (s.startsWith('+')) return s.replace(/\D/g, '');
    // If number length looks local (e.g., 9-10 digits) and doesn't have country code, prefix +225 by default
    const digitsOnly = s.replace(/\D/g, '');
    if (digitsOnly.length <= 10) {
      return '243' + digitsOnly; // default to +243 (DRC) when no country code provided
    }
    return digitsOnly;
  };

  // Cart modal state and handlers
  const [cartOpen, setCartOpen] = useState(false);
  const onChangeQty = (id, qty) => setCart((prev) => prev.map((it) => (it.id === id ? { ...it, qty } : it)));
  const onRemove = (id) => setCart((prev) => prev.filter((it) => it.id !== id));
  const onClear = () => setCart([]);

  return (
    <div className="p-6">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/src/assets/wapibei.png" alt="WapiBei" className="w-28 h-10 object-contain" />
        </div>

        <div className="w-full mt-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex-1">
                <div className="relative">
                  <input
                    aria-label="Rechercher des produits ou vendeurs"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher un produit, une catégorie ou un vendeur..."
                    className="w-full md:w-96 pl-4 pr-12 py-2 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select aria-label="Filtrer par ville" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-emerald-200">
                  <option value="all">🌍 Toutes villes</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <select aria-label="Filtrer par catégorie" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-emerald-200">
                  <option value="all">Toutes catégories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <button aria-label="Réinitialiser les filtres" onClick={() => { setQuery(''); setCityFilter('all'); setCategoryFilter('all'); setPriceMin(''); setPriceMax(''); showToast('Filtres réinitialisés'); }} className="px-3 py-2 bg-gray-50 border rounded-md text-sm hover:bg-gray-100">Réinitialiser</button>

                <button aria-label="Ouvrir le panier" onClick={() => setCartOpen(true)} className="relative px-3 py-2 bg-white border rounded-md hover:shadow text-sm">
                  <span>🛒</span>
                  <span className="ml-2 hidden sm:inline">Panier</span>
                  <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">{cart.reduce((s,i)=>s+(i.qty||1),0)}</span>
                </button>

                <button title={currentUserData?.name || 'Profil'} aria-label="Voir le profil" onClick={() => navigate('/profil')} className="flex items-center gap-3 px-3 py-2 rounded-full border border-gray-200 hover:shadow-md transition-shadow duration-150">
                  <div className="flex items-center gap-3">
                    {currentUserData?.avatar ? (
                      <img src={currentUserData.avatar.startsWith('/uploads') ? `${BASE}${currentUserData.avatar}` : currentUserData.avatar} alt="profile" className="w-9 h-9 rounded-full object-cover border-2 border-emerald-600 shadow-sm" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-600 shadow-sm">
                        <span className="text-emerald-700 font-semibold">{currentUserData?.name?.[0]?.toUpperCase() || '👤'}</span>
                      </div>
                    )}
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-emerald-700 font-semibold text-sm leading-tight truncate max-w-[140px]">Profil</span>
                      {currentUserData?.name && <span className="text-xs text-gray-500 truncate max-w-[140px]">{currentUserData.name}</span>}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

      </header>

      {/* Advanced filters */}
      <section className="mb-6 bg-white p-4 rounded-xl shadow-md">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    
    {/* Filtre prix */}
    <fieldset className="flex items-center gap-2 border border-transparent p-0">
      <legend className="text-sm font-medium text-gray-600 px-1">Prix</legend>
      <input
        type="number"
        aria-label="Prix minimum"
        placeholder="Min"
        value={priceMin}
        onChange={(e) => { setPriceMin(e.target.value); }}
        className="px-3 py-2 border border-gray-300 rounded-md w-28 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
      />
      <span className="text-gray-500">—</span>
      <input
        type="number"
        aria-label="Prix maximum"
        placeholder="Max"
        value={priceMax}
        onChange={(e) => { setPriceMax(e.target.value); }}
        className="px-3 py-2 border border-gray-300 rounded-md w-28 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
      />
      {/* Inline validation message */}
      {priceMin !== '' && priceMax !== '' && Number(priceMin) > Number(priceMax) && (
        <div role="status" aria-live="polite" className="text-sm text-red-600 ml-3">Le prix minimum doit être inférieur ou égal au prix maximum.</div>
      )}
    </fieldset>

    {/* Tri + affichage */}
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">Trier par :</label>
        <select
          id="sort-select"
          aria-describedby="sort-help"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="relevance">Nom (A → Z)</option>
          <option value="price-asc">Prix : bas → haut</option>
          <option value="price-desc">Prix : haut → bas</option>
          <option value="rating">Popularité </option>
        </select>
      </div>
  
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">Affichage :</label>
        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="grid">Grille</option>
          <option value="list">Liste</option>
        </select>
      </div>
    </div>
  </div>
</section>

      {/* Catalogue */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">Chargement des produits...</div>
      ) : (
        <div className={view === 'grid' ? 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
          {sorted.length === 0 ? (
            <div className="text-center text-gray-500 py-10">Aucun produit trouvé.</div>
          ) : (
            sorted.map(product => (
              <article key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={view === 'grid' ? 'flex flex-col' : 'flex'}>
                  <img src={resolveImageUrl(product.image)} alt={product.name} className={view === 'grid' ? 'w-full h-44 object-cover' : 'w-44 h-32 object-cover'} />
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">{product.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">{product.rating?.toFixed?.(1) ?? '—'}⭐</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {product.seller_id ? (sellersById[product.seller_id]?.name || 'Vendeur inconnu') : 'Vendeur inconnu'}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">{product.category} • {product.city}</p>
                      <p className="mt-2 text-gray-700 font-semibold">{formatPrice(product.price)} {String(product.price || '').includes('USD') ? 'USD' : 'FC'}</p>
                      <p className="mt-2 text-sm text-gray-500">{product.description}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {product.availability === 'in_stock' && <span className="text-sm text-green-700">En stock</span>}
                        {product.availability === 'low_stock' && <span className="text-sm text-yellow-700">Rupture prochaine</span>}
                        {product.availability === 'out_of_stock' && <span className="text-sm text-red-600">Épuisé</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedProduct(product)} className="px-3 py-1 border rounded text-sm">Voir vendeurs</button>
                        <button onClick={() => addToCart(product, product.sellers?.[0])} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm">Ajouter</button>
                      </div>
                    </div>

                    {/* Sellers preview */}
                    {product.sellers && product.sellers.length > 0 && (
                      <div className="mt-3 flex gap-3 overflow-x-auto">
                        {product.sellers.slice(0, 3).map(s => (
                          <button key={s.id} onClick={() => openSellerModal(s.id, s)} className="flex-shrink-0 bg-gray-50 px-3 py-2 rounded border text-left">
                            <div className="text-sm font-bold">{s.name}</div>
                            <div className="text-xs text-gray-500">{s.city} • {formatPrice(s.price)} {String(s.price || '').includes('USD') ? 'USD' : 'FC'}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* Product Sellers Modal */}
      {/* Product Sellers Modal */}
{selectedProduct && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-6 w-11/12 max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Vendeurs — {selectedProduct.name}</h3>
        <button onClick={() => setSelectedProduct(null)} className="text-gray-500">Fermer</button>
      </div>
      <div className="space-y-3">
        {selectedProductSellers.map(s => (
          <div key={s.id} className="flex justify-between items-center border p-3 rounded">
            <div>
              <div className="font-bold">
                {s.name} <span className="text-sm text-gray-500">({s.city})</span>
              </div>
              <div className="text-sm text-gray-500">Note: {s.rating}/5</div>
              <div className="text-sm text-gray-500">
                Prix: {formatPrice(s.price)} {String(s.price || '').includes('USD') ? 'USD' : 'FC'}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={async () => {
                    // Open Messagerie and preload partner info
                    const full = await fetchSellerIfNeeded(s.id) || s;
                    const partner = {
                      id: full?.id ?? s?.id,
                      name: full?.name || `${full?.nom || ''} ${full?.prenom || ''}`.trim() || full?.email || s?.name,
                      email: full?.email || s?.email || null,
                      nom: full?.nom || null,
                      prenom: full?.prenom || null,
                    };
                    try {
                      localStorage.setItem('messagerie_open_with', JSON.stringify(partner));
                      window.dispatchEvent(new Event('open-messagerie'));
                    } catch (e) {
                      console.error('Unable to open messagerie:', e);
                    }
                    // close product modal
                    setSelectedProduct(null);
                  }}
                 className="px-3 py-1 border rounded"
               >
                 Contacter
               </button>
              <button
                onClick={() => {
                  openSellerModal(s.id, s);
                  setSelectedProduct(null);
                }}
                className="text-sm text-blue-600"
              >
                Voir la boutique
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}


{showContactModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[99999]">
    <div className="bg-white p-4 rounded shadow-md w-full max-w-md max-h-[60vh] overflow-y-auto relative z-[100000]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {contact.avatar ? <img src={(String(contact.avatar).startsWith('/uploads') ? `${BASE}${contact.avatar}` : contact.avatar)} alt={contact.name || 'avatar'} className="w-full h-full object-cover" /> : <div className="text-gray-400">No photo</div>}
          </div>
          <div>
            <div className="font-semibold">{contact.name || 'Vendeur'}</div>
            <div className="text-sm text-gray-500">{contact.city || ''}</div>
          </div>
        </div>
        <button onClick={() => setShowContactModal(false)} className="text-gray-500">×</button>
      </div>

      <div className="space-y-3">
        <div className="text-sm text-gray-600">Choisissez un mode de contact</div>
        <div className="grid gap-2">
          <button
            onClick={() => {
              if (!contact.whatsapp) return;
              const num = normalizePhone(contact.whatsapp);
              if (num) window.open(`https://wa.me/${num.replace(/^\+/, '')}`, "_blank");
              setShowContactModal(false);
            }}
            className={contact.whatsapp ? 'px-3 py-2 bg-green-600 text-white rounded w-full flex items-center justify-between' : 'px-3 py-2 bg-gray-200 text-gray-500 rounded w-full flex items-center justify-between cursor-not-allowed'}
            disabled={!contact.whatsapp}
          >
            <span>WhatsApp</span>
            <span className="text-xs opacity-80">{contact.whatsapp || 'Non disponible'}</span>
          </button>

          <button
            onClick={() => {
              if (!contact.phone) return;
              const normalizedPhone = normalizePhone(contact.phone);
              if (normalizedPhone) {
                window.location.href = `tel:${normalizedPhone}`;
              } else {
                window.location.href = `tel:${contact.phone}`;
              }
              setShowContactModal(false);
            }}
            className={contact.phone ? 'px-3 py-2 bg-blue-600 text-white rounded w-full flex items-center justify-between' : 'px-3 py-2 bg-gray-200 text-gray-500 rounded w-full flex items-center justify-between cursor-not-allowed'}
            disabled={!contact.phone}
          >
            <span>Téléphone</span>
            <span className="text-xs opacity-80">{contact.phone || 'Non disponible'}</span>
          </button>

          <button
            onClick={() => {
              if (!contact.email) return;
              const subject = selectedProduct?.name ? `Demande au sujet de ${selectedProduct.name}` : `Contact`;
              const bodyLines = [];
              bodyLines.push(`Bonjour ${contact.name || ''},`);
              bodyLines.push('');
              if (selectedProduct?.name) {
                bodyLines.push(`Je vous contacte concernant le produit : ${selectedProduct.name}.`);
              } else {
                bodyLines.push('Je vous contacte au sujet d\'une demande.');
              }
              bodyLines.push('');
              bodyLines.push('Cordialement,');
              const body = bodyLines.join('\r\n');
              // Open Gmail compose in new tab (webmail) as primary action in production
              const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              window.open(gmailUrl, '_blank');
              setShowContactModal(false);
            }}
            className={contact.email ? 'px-3 py-2 bg-gray-600 text-white rounded w-full flex items-center justify-between' : 'px-3 py-2 bg-gray-200 text-gray-500 rounded w-full flex items-center justify-between cursor-not-allowed'}
            disabled={!contact.email}
          >
            <span>Email</span>
            <span className="text-xs opacity-80">{contact.email || 'Non disponible'}</span>
          </button>

          {/* Removed mailto fallback; Gmail web compose is primary action */}

        </div>
      </div>
    </div>
  </div>
)}


      {/* Cart Modal */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center" onClick={() => setCartOpen(false)}>
          <div className="bg-white rounded-lg w-full max-w-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Panier ({cart.reduce((s,i)=>s+(i.qty||1),0)})</h3>
              <button onClick={() => setCartOpen(false)} className="text-gray-500">×</button>
            </div>

            <div className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-6">Votre panier est vide.</div>
              ) : (
                <ul className="space-y-4">
                  {cart.map((it) => (
                    <li key={it.id} className="flex justify-between items-center py-3 border-b">
                      <div>
                        <div className="font-medium">{it.nom}</div>
                        <div className="text-sm text-gray-500">{it.prix}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => onChangeQty(it.id, Math.max(1, (it.qty||1)-1))} className="w-8 h-8 flex items-center justify-center rounded-full border">−</button>
                        <div className="w-8 text-center">{it.qty || 1}</div>
                        <button onClick={() => onChangeQty(it.id, (it.qty||1)+1)} className="w-8 h-8 flex items-center justify-center rounded-full border">+</button>
                        <button onClick={() => onRemove(it.id)} className="text-red-500 ml-3">Suppr</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold">{cart.reduce((s,it)=>s + (Number(String(it.prix).replace(/[^0-9.-]+/g, ''))||0) * (it.qty||1), 0).toLocaleString()} FC</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { onClear(); setCartOpen(false); }} className="flex-1 px-4 py-2 border rounded-lg">Vider le panier</button>
                <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg">Commander</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Seller Mini-boutique Modal */}
      

      {selectedSeller && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-5xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-6 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {sellerFull?.avatar ? (
                    <img src={(sellerFull.avatar.startsWith('/uploads') ? `${BASE}${sellerFull.avatar}` : sellerFull.avatar)} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400">No photo</div>
                  )}
                </div>
                <div>
                  <div className="text-2xl font-extrabold">{sellerFull?.name || selectedSeller.name || 'Vendeur'}</div>
                  <div className="text-sm text-gray-500 mt-1">{sellerFull?.email || '—'}</div>
                  <div className="text-sm text-gray-500">{sellerFull?.telephone || '—'}</div>
                  <div className="text-sm text-gray-500">{sellerFull?.ville ? `${sellerFull.ville}${sellerFull.pays ? ', ' + sellerFull.pays : ''}` : sellerFull?.pays || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <button
                  onClick={() => {
                    const contactData = sellerFull?.contact || {};
                    setContact({
                      id: sellerFull?.id,
                      name: sellerFull?.name || sellerFull?.email || '',
                      avatar: sellerFull?.avatar || sellerFull?.photo || null,
                      city: sellerFull?.ville || sellerFull?.city || '',
                      phone: sellerFull?.telephone || sellerFull?.phone || contactData.phone,
                      whatsapp: sellerFull?.whatsapp || contactData.whatsapp,
                      email: sellerFull?.email || contactData.email,
                    });
                    setShowContactModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded"
                >Contacter</button>
                <button onClick={() => setSelectedSeller(null)} className="px-4 py-2 text-gray-600">Fermer</button>
              </div>
            </div>

            <h4 className="text-lg font-semibold mb-3">Produits du vendeur</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellerFull?.products && sellerFull.products.length > 0 ? (
                sellerFull.products.map((p) => (
                  <div key={p.id} className="border rounded-lg p-4 bg-white flex flex-col">
                    <div className="h-40 w-full overflow-hidden rounded mb-3">
                      <img src={resolveImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{p.name}</div>
                      <div className="text-sm text-gray-500">{p.category} • {p.city}</div>
                      <div className="mt-2 font-semibold">{formatPrice(p.price)} {String(p.price || '').includes('USD') ? 'USD' : 'FC'}</div>
                      <p className="mt-2 text-sm text-gray-600">{p.description}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <button onClick={() => addToCart(p, { id: sellerFull.id })} className="px-3 py-2 bg-emerald-600 text-white rounded">Ajouter</button>
                      <button onClick={() => { /* optionally open product details */ }} className="text-sm text-blue-600">Voir</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 col-span-full">Aucun produit trouvé pour ce vendeur.</div>
              )}
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-emerald-600 text-white px-4 py-2 rounded shadow">{toast}</div>
        </div>
      )}
    </div>
  );
}