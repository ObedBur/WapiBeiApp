import React from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import { fetchJson, fetchWithAuth } from '../../utils/api';

import {
  Globe,
  Search,
  Bell,
  CheckCircle,
  ShoppingCart,
  Star,
  Info,
  Mail,
  ArrowRight,
  Heart,
  Eye,
  X,
  TrendingUp,
  Shield,
  Truck,
  Headphones,
  Sparkles,
} from '../../components/Icons';
import heroImg from '../../assets/wapibei.png';
import ProductModal, { BlogModal } from '../../components/ProductModal';
import Hero from './components/Hero';
import ProductsGrid from './components/ProductsGrid';
import Testimonials from './components/Testimonials';
import BlogSection from './components/BlogSection';

// NOTE: initialProducts kept only as a development fallback; frontend will fetch from backend by default
const initialProducts = [];

function ProductCard({ produit, onAdd, onViewDetails = () => {}, onToggleFavorite = () => {}, isFavorite = false, isPopular = false }) {
  const [imgLoaded, setImgLoaded] = React.useState(false);
  return (
  <div className="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-emerald-200">
    {/* Badges */}
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
      {produit.discount > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">-{produit.discount}%</div>
      )}
      {produit.isNew && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Nouveau</div>
      )}
      {produit.isBestseller && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">Best</div>
      )}
        {isPopular && (
          <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Populaire</div>
      )}
    </div>

    {/* Action buttons */}
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
      <button onClick={() => onToggleFavorite(produit.id)} className={`p-2 rounded-full shadow-lg transition-all duration-300 ${isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'}`}>
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>
      <button onClick={() => onViewDetails(produit)} className="p-2 bg-white rounded-full shadow-lg text-gray-600 hover:bg-blue-50 hover:text-blue-500 transition-all duration-300"><Eye className="w-4 h-4" /></button>
      <button className="p-2 bg-white rounded-full shadow-lg text-gray-600 hover:bg-green-50 hover:text-green-500 transition-all duration-300"><Star className="w-4 h-4" /></button>
    </div>
    
    {/* Image container */}
    <div className="relative overflow-hidden">
        {!imgLoaded && <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>}
        <img loading="lazy" src={produit.image} srcSet={`${produit.image} 1x`} alt={produit.nom} onLoad={() => setImgLoaded(true)} className={`w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      {/* Quick view button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
        <button onClick={() => onViewDetails(produit)} className="bg-white/90 backdrop-blur-sm text-gray-800 px-6 py-3 rounded-full font-semibold transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 hover:bg-white shadow-xl">
          Aperçu rapide
        </button>
      </div>
    </div>
    
    {/* Content */}
    <div className="p-6">
      {/* Category and rating */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{produit.category}</span>
        <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-current" /><span className="text-sm font-medium text-gray-700">{produit.rating}</span></div>
      </div>
      
      {/* Title and description */}
      <h3 className="font-bold text-gray-800 mb-2 text-lg leading-tight line-clamp-1">{produit.nom}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{produit.description}</p>
      
      {/* Vendor and location */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">📍<span>{produit.vendeur || 'Vendeur'} • {produit.location || 'Local'}</span></div>
      
      {/* Price and delivery */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2"><span className="text-xl font-bold text-gray-800">{produit.prix}</span>{produit.originalPrice && (<span className="text-sm text-gray-400 line-through">{produit.originalPrice}</span>)}</div>
          <div className="flex items-center gap-1 text-xs text-green-600">🚚<span>{produit.deliveryTime || '24-48h'}</span></div>
        </div>
        {produit.inStock ? (<span className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">En stock</span>) : (<span className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full font-medium">Rupture</span>)}
      </div>
      
      {/* Add to cart button */}
      <button onClick={() => onAdd(produit)} disabled={!produit.inStock} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
        <ShoppingCart className="w-5 h-5" />
        {produit.inStock ? 'Ajouter au panier' : 'Non disponible'}
      </button>
    </div>
  </div>
);
}

// Enhanced Cart Drawer Component
const CartDrawer = ({ open, items, onClose, onClear, onRemove, onChangeQty }) => {
  const total = items.reduce((sum, item) => {
    const price = parseInt(item.prix.replace(/\D/g, ''));
    return sum + (price * (item.qty || 1));
  }, 0);

  return (
    <div className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${open ? 'opacity-50' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Mon Panier</h3>
              <p className="text-sm text-gray-600">{items.length} article{items.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-16 px-8 flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-12 h-12 text-gray-300" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Votre panier est vide</h4>
              <p className="text-gray-500 mb-6">Découvrez nos produits et ajoutez-les à votre panier</p>
              <button 
                onClick={onClose}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-emerald-200 transition-colors">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">{item.nom}</h4>
                    <p className="text-sm text-emerald-600 font-medium">{item.prix}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onChangeQty(item.id, Math.max(1, (item.qty || 1) - 1))}
                      className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-emerald-300 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{item.qty || 1}</span>
                    <button 
                      onClick={() => onChangeQty(item.id, (item.qty || 1) + 1)}
                      className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-emerald-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="text-red-500 hover:text-red-700 p-1 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-800">Total:</span>
              <span className="text-2xl font-bold text-emerald-600">
                {total.toLocaleString('fr-FR')} FC
              </span>
            </div>
            <div className="space-y-3">
              <button 
                onClick={onClear}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-2xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <CreditCard className="w-5 h-5 inline mr-2" />
                Commander maintenant
              </button>
              <button 
                onClick={onClose}
                className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-2xl font-medium hover:border-emerald-300 hover:text-emerald-600 transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Testimonials section
// Add missing declarations if needed

// MessageCircle icon (if not imported)
const MessageCircle = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6A8.38 8.38 0 0112.5 3a8.5 8.5 0 018.5 8.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// TestimonialCard component
function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-emerald-100">
      <img
        src={testimonial.avatar}
        alt={testimonial.name}
        className="w-16 h-16 rounded-full mb-4 object-cover border-2 border-emerald-200"
      />
      <div className="text-lg font-semibold text-gray-800 mb-2">{testimonial.name}</div>
      <div className="text-emerald-600 text-sm mb-3">{testimonial.location}</div>
      <p className="text-gray-600 text-base mb-2">"{testimonial.text}"</p>
    </div>
  );
}


function BlogCard({ post }) {
  const [imgLoaded, setImgLoaded] = React.useState(false);
  // Map common CMS fields to component props (coverImage/body/slug)
  const imageSrc = post.coverImage || post.image || post.thumbnail || '';
  const excerpt = post.excerpt || (post.body ? (typeof post.body === 'string' ? post.body.replace(/<[^>]+>/g, '').slice(0, 160) + (post.body.length > 160 ? '…' : '') : '') : '');
  const slug = post.slug || post.id;

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative overflow-hidden">
        {!imgLoaded && <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>}
        <img
          src={imageSrc}
          srcSet={`${imageSrc} 1x`}
          alt={post.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <div className="p-6">
        <h3 className="font-bold text-gray-800 mb-2">{post.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {post.author || 'Équipe WapiBei'} • {post.date}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); if (typeof post.onOpen === 'function') post.onOpen(post); }}
            className="text-emerald-600 font-semibold flex items-center gap-2"
            aria-label={`Lire la suite de ${post.title}`}
          >
            Lire la suite
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Accueil() {
  const [isCompareOpen, setIsCompareOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [cartOpen, setCartOpen] = React.useState(false);
  const [cartItems, setCartItems] = React.useState([]);
  const [currentTestimonial, setCurrentTestimonial] = React.useState(0);
  const [testimonialsData, setTestimonialsData] = React.useState([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = React.useState(false);
  const [testimonialsError, setTestimonialsError] = React.useState(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = React.useState(false);
  const [blogModalPost, setBlogModalPost] = React.useState(null);
  const [isModalLoading, setIsModalLoading] = React.useState(false);
  const [modalError, setModalError] = React.useState(null);
  const [blogsData, setBlogsData] = React.useState([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = React.useState(false);
  const [blogsError, setBlogsError] = React.useState(null);
  const [blogsPage, setBlogsPage] = React.useState(1);
  const [blogsPerPage] = React.useState(3);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [hasMoreBlogs, setHasMoreBlogs] = React.useState(true);
  const blogModalRef = React.useRef(null);
  const compareModalRef = React.useRef(null);

  // Compare modal accessibility: trap focus and close on Escape
  React.useEffect(() => {
    if (!isCompareOpen || !compareModalRef.current) return undefined;
    const modal = compareModalRef.current;
    const selector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(modal.querySelectorAll(selector));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const previous = document.activeElement;
    first?.focus();

    function onKey(e) {
      if (e.key === 'Escape') { setIsCompareOpen(false); }
      if (e.key === 'Tab' && focusables.length) {
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
        else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); try { previous?.focus && previous.focus(); } catch (e) {} };
  }, [isCompareOpen]);

  const fetchBlogsPage = async (page = 1, append = false) => {
    const possibleBases = [import.meta.env.VITE_BLOG_API, '/api/blogs', '/api/products/blogs'].filter(Boolean);
    const makeEndpoint = (base) => `${base}${base.includes('?') ? '&' : '?'}limit=${blogsPerPage}&page=${page}`;
    let mounted = true;
    if (append) setIsLoadingMore(true); else setIsLoadingBlogs(true);
    setBlogsError(null);
    const token = (authService.getCurrentUser && authService.getCurrentUser()?.token) || null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    let data = null;
    let usedBase = null;
    for (const base of possibleBases) {
      try {
        const endpoint = makeEndpoint(base);
        const fetched = await fetchWithAuth(endpoint, { headers });
        if (!fetched) continue;
        data = fetched;
        usedBase = base;
        if (data) break;
      } catch (e) {
        // try next
        continue;
      }
    }

    try {
      if (!mounted) return;
      if (!data) {
        setBlogsError('Aucun endpoint CMS JSON trouvé (essayez de configurer VITE_BLOG_API)');
        if (!append) setBlogsData([]);
      } else {
        // Expect an array or an object { data: [], total }
        let items = [];
        let total = null;
        if (Array.isArray(data)) items = data;
        else if (data && Array.isArray(data.data)) { items = data.data; total = data.total || null; }
        if (append) setBlogsData((prev) => [...prev, ...items]); else setBlogsData(items.length ? items : []);
        if (total !== null) {
          setHasMoreBlogs((page * blogsPerPage) < total);
        } else {
          setHasMoreBlogs(items.length === blogsPerPage);
        }
      }
    } catch (err) {
      console.error('Failed to process blog posts:', err);
      setBlogsError(err.message || 'Erreur lors du traitement des articles');
      if (!append) setBlogsData([]);
    } finally {
      mounted && setIsLoadingBlogs(false);
      mounted && setIsLoadingMore(false);
    }

    return () => { mounted = false; };
  };

  // initial load
  React.useEffect(() => {
    setBlogsPage(1);
    fetchBlogsPage(1, false);
  }, []);

  const loadMoreBlogs = () => {
    const next = blogsPage + 1;
    setBlogsPage(next);
    fetchBlogsPage(next, true);
  };

  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);
  React.useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const [products, setProducts] = React.useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(false);
  const [productsError, setProductsError] = React.useState(null);
  const [didFetchProducts, setDidFetchProducts] = React.useState(false);
  const [productsPage, setProductsPage] = React.useState(1);
  const [productsPerPage] = React.useState(9);
  const [productsHasMore, setProductsHasMore] = React.useState(true);
  const [popularityMap, setPopularityMap] = React.useState({});
  const [favorites, setFavorites] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch (e) { return []; }
  });
  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.nom.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  });

  const fetchProductsPage = React.useCallback(async (page = 1, append = false, q = '') => {
    let mounted = true;
    setIsLoadingProducts(true);
    setProductsError(null);
    try {
      const BASE = import.meta.env.VITE_API_BASE || '';
      const base = BASE ? `${BASE}/api/products` : '/api/products';
      const url = new URL(base, location.origin);
      url.searchParams.set('page', String(page));
      url.searchParams.set('limit', String(productsPerPage));
      if (q) url.searchParams.set('q', q);
      const data = await fetchJson(url.toString());
      // expect { data, total } or array
      let items = [];
      let total = null;
      if (Array.isArray(data)) items = data;
      else if (data && Array.isArray(data.data)) { items = data.data; total = data.total || null; }

      if (append) setProducts((prev) => [...prev, ...items]); else setProducts(items);
      setDidFetchProducts(true);
      if (total !== null) {
        const maxPage = Math.ceil(total / productsPerPage);
        setProductsHasMore(page < maxPage);
      } else {
        setProductsHasMore(items.length === productsPerPage);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      if (!mounted) return;
      if (err.status === 401) setProductsError('Vous devez vous connecter pour voir les produits.');
      else if (err.status === 403) setProductsError('Accès refusé.');
      else if (err.status === 404) setProductsError('Produits non trouvés');
      else setProductsError(err.message || 'Erreur lors du chargement des produits');
    } finally {
      mounted && setIsLoadingProducts(false);
    }
    return () => { mounted = false; };
  }, [productsPerPage]);

  // initial load / when search changes
  React.useEffect(() => {
    setProductsPage(1);
    fetchProductsPage(1, false, search);
  }, [fetchProductsPage, search]);

  const loadMoreProducts = () => {
    const next = productsPage + 1;
    setProductsPage(next);
    fetchProductsPage(next, true, search);
  };

  // Use aggregated popularity endpoint once products are loaded
  React.useEffect(() => {
    if (!didFetchProducts || !Array.isArray(products) || products.length === 0) return;
    let mounted = true;
    const ids = products.map((p) => p.id).filter(Boolean);
    const BASE = import.meta.env.VITE_API_BASE || '';
    const endpoint = (BASE ? `${BASE}/api/products/popularity?ids=${ids.join(',')}` : `/api/products/popularity?ids=${ids.join(',')}`);

    (async () => {
      try {
        const data = await fetchJson(endpoint);
        const map = {};
        if (Array.isArray(data)) {
          data.forEach((d) => {
            const id = d.productId;
            let isPopular = false;
            const monthSales = d.sales && d.sales.month ? Number(d.sales.month) : 0;
            const conv = d.conversion && d.conversion.conversionRatePercent != null ? Number(d.conversion.conversionRatePercent) : null;
            const favs = d.favorites != null ? Number(d.favorites) : 0;
            const reviews = d.reviews && d.reviews.count ? Number(d.reviews.count) : 0;
            if (monthSales >= 20 || (conv !== null && conv >= 5) || favs >= 10 || reviews >= 20) isPopular = true;
            map[id] = { data: d, isPopular };
          });
        }
        if (mounted) setPopularityMap(map);
      } catch (e) {
        console.error('Failed fetching aggregated popularity:', e);
      }
    })();

    return () => { mounted = false; };
  }, [didFetchProducts, products]);

  // Persist favorites to localStorage and sync to server if authenticated
  React.useEffect(() => {
    try { localStorage.setItem('favorites', JSON.stringify(favorites)); } catch (e) {}
  }, [favorites]);

  const syncFavoritesToServer = async (favList) => {
    try {
      const u = authService.getCurrentUser && authService.getCurrentUser();
      const token = u?.token;
      if (!u || !token) return;
      await fetchJson(`${import.meta.env.VITE_API_BASE || ''}/api/users/me/favorites`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ favorites: favList }) });
    } catch (e) {
      console.error('Failed to sync favorites to server', e);
    }
  };

  // on login: load server favorites and merge
  React.useEffect(() => {
    const u = authService.getCurrentUser && authService.getCurrentUser();
    const token = u?.token;
    if (!u || !token) return;
    let mounted = true;
    (async () => {
      try {
        const data = await fetchJson(`${import.meta.env.VITE_API_BASE || ''}/api/users/me/favorites`, { headers: { Authorization: `Bearer ${token}` } });
        if (data && Array.isArray(data.favorites)) {
          // merge server favorites with local
          const merged = Array.from(new Set([...(favorites || []), ...data.favorites]));
          setFavorites(merged);
          // persist merged back to server
          await syncFavoritesToServer(merged);
        }
      } catch (e) {
        console.warn('Could not load user favorites:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggleFavorite = (productId) => {
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((p) => p !== productId) : [...prev, productId];
      // try sync in background
      syncFavoritesToServer(next);
      return next;
    });
  };

  // fetch testimonials with retry support
  const fetchTestimonials = React.useCallback(async () => {
    let mounted = true;
    try {
      setIsLoadingTestimonials(true);
      setTestimonialsError(null);
      const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      try {
        const data = await fetchJson(`${BASE}/api/testimonials`);
        setTestimonialsData(Array.isArray(data) ? data : []);
      } catch (e) {
        throw e;
      }
    } catch (e) {
      console.error('Failed loading testimonials', e);
      setTestimonialsError(e.message || 'Erreur chargement témoignages');
      setTestimonialsData([]);
    } finally {
      mounted && setIsLoadingTestimonials(false);
    }
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    const cancel = fetchTestimonials();
    return () => { if (typeof cancel === 'function') cancel(); };
  }, [fetchTestimonials]);

  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = React.useState(false);

  const openProductModal = (produit) => {
    setSelectedProduct(produit);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(false);
  };

  const addToCart = (produit) => {
    setCartItems((prev) => {
      const found = prev.find((i) => i.id === produit.id);
      if (found)
        return prev.map((i) => (i.id === produit.id ? { ...i, qty: (i.qty || 1) + 1 } : i));
      return [...prev, { id: produit.id, nom: produit.nom, prix: produit.prix, qty: 1 }];
    });
    setCartOpen(true);
  };

  const handleOpenBlogModal = (post) => {
    const slug = post.slug || post.id;
    setBlogModalPost({ ...post, slug });
    setIsBlogModalOpen(true);
  };

  return (
    <div className="w-full bg-gray-50 ">
      <style>{`@keyframes spring { 0% { transform: translateY(0) scale(1); } 25% { transform: translateY(-8px) scale(1.02); } 55% { transform: translateY(-3px) scale(1.01); } 85% { transform: translateY(-1px) scale(1.005); } 100% { transform: translateY(0) scale(1); } } @keyframes spring-subtle { 0% { transform: translateY(0) scale(1); } 40% { transform: translateY(-4px) scale(1.01); } 70% { transform: translateY(-1px) scale(1.003); } 100% { transform: translateY(0) scale(1); } } @keyframes spring-strong { 0% { transform: translateY(0) scale(1); } 30% { transform: translateY(-12px) scale(1.08); } 60% { transform: translateY(-4px) scale(1.03); } 100% { transform: translateY(0) scale(1); } } .feature-card { transition: transform 420ms cubic-bezier(.22,.9,.3,1), box-shadow 300ms cubic-bezier(.22,.9,.3,1); will-change: transform; } .feature-card:hover { animation: spring 1000ms cubic-bezier(.25,.9,.35,1) both; } .feature-card--subtle:hover { animation: spring-subtle 1000ms cubic-bezier(.25,.9,.35,1) both; } .feature-card--strong:hover { animation: spring-strong 1000ms cubic-bezier(.25,.9,.35,1) both; } .stagger-0{animation-delay:0ms} .stagger-1{animation-delay:100ms} .stagger-2{animation-delay:200ms} .stagger-3{animation-delay:300ms}`}</style>
      <main className="w-full pb-16">
        <Hero searchInput={searchInput} setSearchInput={setSearchInput} onSearch={() => setSearch(searchInput)} setIsCompareOpen={setIsCompareOpen} />
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-3xl shadow-xl p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <div className="group text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-emerald-200 transform hover:-translate-y-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Comparaison intelligente</h3>
                  <p className="text-gray-600 leading-relaxed">Comparez les prix en temps réel avec notre IA pour économiser jusqu'à 40% sur vos achats</p>
          </div>

                <div className="group text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-10 h-10 text-blue-600" />
          </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Sécurité maximale</h3>
                  <p className="text-gray-600 leading-relaxed">Transactions cryptées et protection des données avec certification SSL et conformité RGPD</p>
            </div>

                <div className="group text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 transform hover:-translate-y-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Truck className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Livraison express</h3>
                  <p className="text-gray-600 leading-relaxed">Livraison dans toute l'Afrique en 24-48h avec suivi GPS en temps réel</p>
              </div>

                <div className="group text-center p-8 bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-yellow-200 transform hover:-translate-y-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Headphones className="w-10 h-10 text-yellow-600" />
              </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Support premium</h3>
                  <p className="text-gray-600 leading-relaxed">Assistance personnalisée 24/7 par chat, téléphone et WhatsApp dans votre langue</p>
            </div>
          </div>
              </div>
            </div>
        <div className="max-w-7xl mx-auto px-6">
          <ProductsGrid products={products} isLoading={isLoadingProducts} error={productsError} onRetry={() => fetchProductsPage(1, false, search)} onAddToCart={addToCart} onViewDetails={openProductModal} onToggleFavorite={toggleFavorite} favorites={favorites} isLoadingMore={isLoadingProducts} hasMore={productsHasMore} onLoadMore={loadMoreProducts} popularityMap={popularityMap} />
            </div>
        <div className="max-w-7xl mx-auto px-6 mt-12">
          <Testimonials data={testimonialsData} loading={isLoadingTestimonials} error={testimonialsError} onRetry={fetchTestimonials} currentIndex={currentTestimonial} onSetIndex={setCurrentTestimonial} />
            </div>
        <BlogSection posts={blogsData} onOpenPost={(p) => handleOpenBlogModal(p)} isModalOpen={isBlogModalOpen} modalPost={blogModalPost} isModalLoading={isModalLoading} modalError={modalError} BlogModalComponent={BlogModal} />
        {/* Product modal */}
        {isProductModalOpen && selectedProduct && (
          <ProductModal product={selectedProduct} onClose={closeProductModal} onAdd={(p) => { addToCart(p); closeProductModal(); }} />
        )}
      </main>

      {/* Price comparison modal */}
      {isCompareOpen && (
  <div ref={compareModalRef} className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Overlay avec blur */}
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={() => setIsCompareOpen(false)}
    />

    {/* Contenu modale */}
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 p-6 z-10 animate-scale-in" role="dialog" aria-modal="true" aria-labelledby="compare-modal-title">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b pb-3">
        <h3 id="compare-modal-title" className="text-xl font-bold text-gray-800 flex items-center gap-2">
          🔍 Comparer les prix
        </h3>
        <button
          onClick={() => setIsCompareOpen(false)}
          className="text-gray-500 hover:text-red-500 transition"
        >
          ✖
        </button>
      </div>

      {/* Formulaire */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const data = Object.fromEntries(new FormData(e.target))
          console.log("Compare data:", data)
          alert("Comparaison effectuée (voir console)")
          setIsCompareOpen(false)
        }}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nom produit */}
          <div>
            <label className="text-sm font-medium text-gray-700">Nom du produit</label>
            <input
              name="productName"
              required
              className="mt-1 block w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="ex: Riz Jasmin"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="text-sm font-medium text-gray-700">Catégorie</label>
            <input
              name="category"
              className="mt-1 block w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="ex: Céréales"
            />
          </div>

          {/* Localisation vendeur */}
          <div>
            <label className="text-sm font-medium text-gray-700">Ville / Pays du vendeur</label>
            <input
              name="sellerLocation"
              className="mt-1 block w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="ex: Kinshasa, RDC"
            />
          </div>

          {/* Unité */}
          <div>
            <label className="text-sm font-medium text-gray-700">Unité</label>
            <select
              name="unit"
              className="mt-1 block w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="kg">Kg</option>
              <option value="litre">Litre</option>
              <option value="piece">Pièce</option>
              <option value="carton">Carton</option>
            </select>
          </div>

          {/* Note vendeur */}
          <div>
            <label className="text-sm font-medium text-gray-700">Note vendeur</label>
            <input
              name="sellerRating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              className="mt-1 block w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="ex: 4.5"
            />
          </div>

          {/* Badge vérifié */}
          <div>
            <label className="text-sm font-medium text-gray-700">Vendeur vérifié</label>
            <select
              name="isVerified"
              className="mt-1 block w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="yes">Oui</option>
              <option value="no">Non</option>
            </select>
          </div>

          {/* Photo */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Photo du produit</label>
            <input
              name="productPhoto"
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-700 border border-gray-300 rounded-xl file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
            />
          </div>

          {/* Commentaires */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Commentaires</label>
            <textarea
              name="comments"
              rows="3"
              className="mt-1 block w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Détails supplémentaires..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => setIsCompareOpen(false)}
            className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            Comparer
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      <CartDrawer open={cartOpen} items={cartItems} onClose={() => setCartOpen(false)} onRemove={(id)=> setCartItems(prev=> prev.filter(i=>i.id!==id))} onChangeQty={(id, qty)=> setCartItems(prev=> prev.map(it=> it.id===id ? {...it, qty} : it))} onClear={()=> setCartItems([])} />
    </div>
  );
}

export default Accueil;
