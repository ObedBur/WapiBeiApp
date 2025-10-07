import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Star, X, Eye, Mail } from '../../components/Icons';
import authService from '../../services/auth.service';
import { fetchWithAuth, fetchJson } from '../../utils/api';
import ProductCard from '../../components/ProductCard';
import EmptyState from '../../components/EmptyState';

// Small fallback icon components (emoji-based) for UI consistency when lucide-react is not installed
const MapPin = (props) => <span {...props} aria-hidden>📍</span>;
const Tag = (props) => <span {...props} aria-hidden>🏷️</span>;
const Grid = (props) => <span {...props} aria-hidden>▦</span>;
const List = (props) => <span {...props} aria-hidden>≡</span>;
const Phone = (props) => <span {...props} aria-hidden>📞</span>;
const MessageCircle = (props) => <span {...props} aria-hidden>💬</span>;
const Plus = (props) => <span {...props} aria-hidden>+</span>;
const Minus = (props) => <span {...props} aria-hidden>−</span>;
const Trash2 = (props) => <span {...props} aria-hidden>🗑️</span>;
const Filter = (props) => <span {...props} aria-hidden>⚙️</span>;

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
        try {
          const data = await fetchWithAuth(`${BASE}/api/sellers/${id}`);
          setCurrentUserData(data);
        } catch (e) {
          setCurrentUserData(null);
        }
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
        const data = await fetchWithAuth(`${BASE}/api/products`);
        if (!cancelled) setProducts(Array.isArray(data) ? data : (data.products || data.data || []));
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
    if (!src) return 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=400';
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
      const data = await fetchWithAuth(`${BASE}/api/sellers/${sellerId}`);
      if (!data) return null;
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

  

  // (grouped is computed from `sorted` above)
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

  // derive cities/categories/grouping AFTER sorted is defined
  const cities = Array.from(new Set(sorted.map(p => p.city))).filter(Boolean);

  // Categories derived from the current sorted/filtered list so selects actually filter results
  const categories = useMemo(() => Array.from(new Set(sorted.map(p => p.category))).filter(Boolean), [sorted]);

  // Preferred display order for categories
  const preferredCategories = ['Fruits','Légumineuses','Céréales','Tubercules','Légumes','Produits animaux','Produits laitiers','Épices et condiments','Huiles et oléagineux','Graines et semences'];

  const orderedCategories = useMemo(() => {
    const present = categories || [];
    return [
      ...preferredCategories.filter(c => present.includes(c)),
      ...present.filter(c => !preferredCategories.includes(c))
    ];
  }, [categories]);

  // Group products by category from the sorted list so the select filters affect displayed groups
  const grouped = useMemo(() => {
    const map = {};
    (sorted || []).forEach((p) => {
      const key = (p.category || 'Autres').trim() || 'Autres';
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [sorted]);

  const addToCart = (product, seller = null) => {
    setCart((prev) => {
      const prixVal = seller?.price ?? product.price ?? '';
      const currencyVal = seller?.currency ?? product.currency ?? 'FC';
      const itemId = `${product.id}${seller?.id?`-s${seller.id}`:''}`;
      const existing = prev.find((it) => it.id === itemId);
      if (existing) {
        const updated = prev.map((it) => it.id === itemId ? { ...it, qty: (it.qty || 1) + 1 } : it);
        showToast(`${product.name} ajouté au panier`);
        return updated;
      }
      showToast(`${product.name} ajouté au panier`);
      return [...prev, { id: itemId, nom: product.name || product.nom || '', prix: prixVal, currency: currencyVal, qty: 1 }];
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                WapiBei
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un produit, une catégorie ou un vendeur..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {cart.reduce((s,i)=>s+(i.qty||1),0)}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/profil')}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors duration-200"
              >
                {currentUserData?.avatar ? (
                  <img 
                    src={currentUserData.avatar.startsWith('/uploads') ? `${BASE}${currentUserData.avatar}` : currentUserData.avatar} 
                    alt="profile" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald-600" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {currentUserData?.name || 'Profil'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <select 
                  value={cityFilter} 
                  onChange={(e) => setCityFilter(e.target.value)} 
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Toutes villes</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)} 
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Toutes catégories</option>
                  {orderedCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Prix:</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-20 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-20 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => { 
                  setQuery(''); 
                  setCityFilter('all'); 
                  setCategoryFilter('all'); 
                  setPriceMin(''); 
                  setPriceMax(''); 
                  showToast('Filtres réinitialisés'); 
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Réinitialiser
              </button>
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center gap-4">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="relevance">Nom (A → Z)</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="rating">Popularité</option>
              </select>

              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    view === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    view === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          Object.keys(grouped).length === 0 ? (
            <div className="col-span-full py-8">
              <EmptyState title="Aucun produit trouvé" description="Essayez de modifier vos filtres de recherche" />
            </div>
          ) : (
            <div>
              {(() => {
                const preferred = [
                  'Fruits',
                  'Légumineuses',
                  'Céréales',
                  'Tubercules',
                  'Légumes',
                  'Produits animaux',
                  'Produits laitiers',
                  'Épices et condiments',
                  'Huiles et oléagineux',
                  'Graines et semences'
                ];
                const present = Object.keys(grouped || {});
                const ordered = [
                  ...preferred.filter((c) => present.includes(c)),
                  ...present.filter((c) => !preferred.includes(c))
                ];

                return ordered.map((cat) => {
                  const items = grouped[cat] || [];
                  return (
                    <div key={cat} className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">{cat}</h3>
                        <div className="text-sm text-gray-500">{items.length} produit{items.length !== 1 ? 's' : ''}</div>
                      </div>
                      <div className={view === 'grid' ? 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}>
                        {items.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={() => addToCart(product, product.sellers?.[0])}
                            onViewSellers={() => setSelectedProduct(product)}
                            onOpenContactModal={() => {
                              const contactData = product.sellers?.[0]?.contact || {};
                              setContact({
                                id: product.sellers?.[0]?.id,
                                name: product.sellers?.[0]?.name || product.sellers?.[0]?.email || '',
                                avatar: product.sellers?.[0]?.avatar || product.sellers?.[0]?.photo || null,
                                city: product.sellers?.[0]?.ville || product.sellers?.[0]?.city || '',
                                phone: product.sellers?.[0]?.telephone || product.sellers?.[0]?.phone || contactData.phone,
                                whatsapp: product.sellers?.[0]?.whatsapp || contactData.whatsapp,
                                email: product.sellers?.[0]?.email || contactData.email,
                              });
                              setShowContactModal(true);
                            }}
                            onOpenSellerModal={() => openSellerModal(product.seller_id, product.sellers?.[0])}
                          />
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )
        )}
      </div>

      {/* Product Sellers Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Vendeurs — {selectedProduct.name}</h3>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {selectedProductSellers.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-emerald-200 transition-colors duration-200">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        {s.name} <span className="text-sm text-gray-500 font-normal">({s.city})</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span>{s.rating}/5</span>
                        </div>
                          <div className="font-medium text-emerald-600">
                          {formatPrice(s.price)} {s.currency || (String(s.price || '').includes('USD') ? 'USD' : 'FC')}
                          </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const full = await fetchSellerIfNeeded(s.id) || s;
                          const partner = {
                            id: full?.id ?? s?.id,
                            name: full?.name || `${full?.nom || ''} ${full?.prenom || ''}`.trim() || full?.email || s?.name,
                            email: full?.email || s?.email || null,
                            nom: full?.nom || null,
                            prenom: full?.prenom || null,
                            avatar: full?.avatar || s?.avatar || null,
                            city: full?.city || s?.city || null,
                          };
                          try {
                            localStorage.setItem('messagerie_open_with', JSON.stringify(partner));
                            window.dispatchEvent(new Event('open-messagerie'));
                          } catch (e) {
                            console.error('Unable to open messagerie:', e);
                          }
                          setSelectedProduct(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                      >
                        Contacter
                      </button>
                      <button
                        onClick={() => {
                          openSellerModal(s.id, s);
                          setSelectedProduct(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
                      >
                        Voir boutique
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {contact.avatar ? (
                    <img 
                      src={String(contact.avatar).startsWith('/uploads') ? `${BASE}${contact.avatar}` : contact.avatar} 
                      alt={contact.name || 'avatar'} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{contact.name || 'Vendeur'}</div>
                  <div className="text-sm text-gray-500">{contact.city || ''}</div>
                </div>
              </div>
              <button 
                onClick={() => setShowContactModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-sm text-gray-600 mb-4">Choisissez un mode de contact</div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (!contact.whatsapp) return;
                    const num = normalizePhone(contact.whatsapp);
                    if (num) window.open(`https://wa.me/${num.replace(/^\+/, '')}`, "_blank");
                    setShowContactModal(false);
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                    contact.whatsapp 
                      ? 'border-green-200 bg-green-50 hover:bg-green-100 text-green-800' 
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!contact.whatsapp}
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">WhatsApp</span>
                  </div>
                  <span className="text-sm opacity-80">{contact.whatsapp || 'Non disponible'}</span>
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
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                    contact.phone 
                      ? 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800' 
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!contact.phone}
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5" />
                    <span className="font-medium">Téléphone</span>
                  </div>
                  <span className="text-sm opacity-80">{contact.phone || 'Non disponible'}</span>
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
                    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    window.open(gmailUrl, '_blank');
                    setShowContactModal(false);
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                    contact.email 
                      ? 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-800' 
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!contact.email}
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">Email</span>
                  </div>
                  <span className="text-sm opacity-80">{contact.email || 'Non disponible'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <div className={`fixed inset-0 z-50 ${cartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${cartOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setCartOpen(false)} 
        />
        <aside className={`absolute right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h4 className="text-lg font-bold text-gray-900">Mon panier</h4>
            <button 
              onClick={() => setCartOpen(false)} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500">Votre panier est vide</div>
              </div>
            ) : (
              <div className="space-y-4">
                  {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.nom}</div>
                        <div className="text-sm text-gray-500">{item.prix} {item.currency || 'FC'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onChangeQty(item.id, Math.max(1, (item.qty || 1) - 1))}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.qty || 1}</span>
                      <button
                        onClick={() => onChangeQty(item.id, (item.qty || 1) + 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="p-1 hover:bg-red-100 text-red-500 rounded ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

                  {cart.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-emerald-600">
                          {/* If mixed currencies exist, show grouped totals per currency */}
                          {(() => {
                            const totals = {};
                            for (const it of cart) {
                              const val = Number(String(it.prix).replace(/[^0-9.-]+/g, '')) || 0;
                              const cur = it.currency || 'FC';
                              totals[cur] = (totals[cur] || 0) + val * (it.qty || 1);
                            }
                            const keys = Object.keys(totals);
                            if (keys.length === 1) {
                              return `${totals[keys[0]].toLocaleString()} ${keys[0]}`;
                            }
                            // multiple currencies -> show concatenated list
                            return keys.map(k => `${totals[k].toLocaleString()} ${k}`).join(' · ');
                          })()}
                </span>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => { onClear(); setCartOpen(false); }} 
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Commander maintenant
                </button>
                <button 
                  onClick={() => { onClear(); setCartOpen(false); }} 
                  className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  Vider le panier
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Seller Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-start justify-between gap-6 p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  {sellerFull?.avatar ? (
                    <img 
                      src={sellerFull.avatar.startsWith('/uploads') ? `${BASE}${sellerFull.avatar}` : sellerFull.avatar} 
                      alt="avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{sellerFull?.name || selectedSeller.name || 'Vendeur'}</div>
                  <div className="text-sm text-gray-500 mt-1">{sellerFull?.email || '—'}</div>
                  <div className="text-sm text-gray-500">{sellerFull?.telephone || '—'}</div>
                  <div className="text-sm text-gray-500">
                    {sellerFull?.ville ? `${sellerFull.ville}${sellerFull.pays ? ', ' + sellerFull.pays : ''}` : sellerFull?.pays || '—'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
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
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors duration-200"
                >
                  Contacter
                </button>
                <button 
                  onClick={() => setSelectedSeller(null)} 
                  className="p-3 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">Produits du vendeur</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sellerFull?.products && sellerFull.products.length > 0 ? (
                  sellerFull.products.map((p) => (
                    <div key={p.id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <div className="h-40 w-full overflow-hidden">
                        <img 
                          src={resolveImageUrl(p.image)} 
                          alt={p.name} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                      <div className="p-4">
                        <div className="font-semibold text-gray-900 mb-1">{p.name}</div>
                        <div className="text-sm text-gray-500 mb-2">{p.category} • {p.city}</div>
                        <div className="text-lg font-bold text-emerald-600 mb-2">
                          {formatPrice(p.price)} {p.currency || (String(p.price || '').includes('USD') ? 'USD' : 'FC')}
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{p.description}</p>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => addToCart(p, { id: sellerFull.id })} 
                            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200"
                          >
                            Ajouter
                          </button>
                          <button className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200">
                            Voir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-6">
                    <EmptyState title="Aucun produit trouvé pour ce vendeur" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}