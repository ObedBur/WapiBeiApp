import React from "react";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import { Navigate } from 'react-router-dom';
import { ShoppingCart, Search, Filter, Star, ArrowRight, Heart, Eye } from '../../components/Icons';
import ProductCard from '../../components/ProductCard';
import CartDrawer from '../../components/CartDrawer';
import ProductModal from '../../components/ProductModal';
import PublicationPrix from './PublicationPrix';
import ComparaisonPrix from './ComparaisonPrix';
import heroImg from '../../assets/wapibei.png';
import ProfilVendeur from '../marketplace/ProfilVendeur';

function Accueil() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [category, setCategory] = React.useState('Tous');
  const [cartOpen, setCartOpen] = React.useState(false);
  const [cartItems, setCartItems] = React.useState([]);
  const [viewMode, setViewMode] = React.useState('grid');

  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // Debounce search input to avoid filtering on every keystroke
  React.useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);


  const [products, setProducts] = React.useState(() => {
    try {
      const raw = localStorage.getItem('wapibei_products');
      return raw ? JSON.parse(raw) : initialProducts;
    } catch (e) { return initialProducts }
  });

  const [newProduct, setNewProduct] = React.useState({ nom: '', prix: '', category: '', description: '', image: '', rating: '' });
  const [imagePreview, setImagePreview] = React.useState('');
  const [priceError, setPriceError] = React.useState('');

  React.useEffect(() => {
    try { localStorage.setItem('wapibei_products', JSON.stringify(products)); } catch (e) {}
  }, [products]);

  const categories = ['Tous', ...new Set(products.map(p => p.category))];
  const cartCount = cartItems.reduce((s, it) => s + (it.qty || 1), 0);

  const addToCart = (produit, qty = 1) => {
    setCartItems((prev) => {
      const found = prev.find((it) => it.id === produit.id);
      if (found) {
        return prev.map((it) => (it.id === produit.id ? { ...it, qty: (it.qty || 1) + qty } : it));
      }
      return [...prev, { id: produit.id, nom: produit.nom, prix: produit.prix, qty }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((it) => it.id !== id));
  };

  const changeQty = (id, qty) => {
    setCartItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty } : it)));
  };

  const clearCart = () => setCartItems([]);

  const [modalProduct, setModalProduct] = React.useState(null);

  const handleViewDetails = (produit) => {
    setModalProduct(produit);
  };

  const closeModalProduct = () => setModalProduct(null);

  const addNewProduct = (e) => {
    e.preventDefault();
    if (!newProduct.nom || !newProduct.prix) return setPriceError('Nom et prix requis');
    // normalize price: extract digits and format with thousands separator + FC
    const digits = String(newProduct.prix).replace(/\D/g, '');
    if (!digits) return setPriceError('Prix invalide');
    const value = parseInt(digits, 10);
    const formattedPrice = value.toLocaleString('fr-FR').replace(/\u202f/g, ' ') + ' FC';
    setPriceError('');
    const nextId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const created = { ...newProduct, id: nextId, rating: Number(newProduct.rating) || 0, prix: formattedPrice };
    setProducts((p) => [...p, created]);
    setNewProduct({ nom: '', prix: '', category: '', description: '', image: '', rating: '' });
  };

  React.useEffect(() => {
    if (!newProduct.image) return setImagePreview('');
    try {
      const url = new URL(newProduct.image);
      setImagePreview(url.href);
    } catch (_) {
      setImagePreview('');
    }
  }, [newProduct.image]);

  const handlePhotoChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewProduct((p) => ({ ...p, image: reader.result }));
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(f);
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(search.toLowerCase()) || 
                         p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'Tous' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const [modalType, setModalType] = React.useState(null);
  const [sellerProfileId, setSellerProfileId] = React.useState(null);
  const openModal = (type) => setModalType(type);
  const closeModal = () => setModalType(null);
  const openSellerProfile = (id) => { setSellerProfileId(id); setModalType('sellerProfile'); };

  const handlePublishClick = async () => {
    const user = authService.getCurrentUser();
    if (!user) { navigate('/connexion'); return; }
    try {
      const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      const res = await fetch(`${BASE}/api/sellers/${user.id}`);
      if (!res.ok) {
        openSellerProfile(user.id);
        return;
      }
      const data = await res.json();
      if (data.boutique) {
        // navigate to /publier which is guarded
        navigate('/publier');
      } else {
        openSellerProfile(user.id);
      }
    } catch (e) {
      openSellerProfile(user.id);
    }
  };

  return (
    <div className="acc-root min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-10">
      {/* Hero Section */}
      <div className="acc-hero relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl text-white p-8 lg:p-10 shadow-lg overflow-hidden">
            <div className="md:flex md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight"> <span className="text-yellow-200">WapiBei</span> Comparez, publiez et économisez sur vos achats partout en Afrique</h1>
                <p className="mt-4 text-lg text-green-100">Découvrez les meilleurs produits alimentaires aux meilleurs prix. Comparez, commandez et faites-vous livrer en toute simplicité.</p>
              </div>
              <div className="hidden lg:block lg:ml-8">
                <img src={heroImg} alt="Produits" className="w-64 h-44 object-cover rounded-xl shadow-xl" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="acc-search relative max-w-2xl mx-auto mt-6">
            <Search className="acc-search-icon absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              aria-label="Rechercher des produits"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              type="text"
              placeholder="Rechercher un produit (ex: Riz, Huile, Tomates...)"
              className="acc-search-input w-full pl-12 pr-28 py-4 rounded-2xl border border-gray-200 shadow-sm focus:ring-4 focus:ring-emerald-200 focus:outline-none text-gray-800 bg-white"
            />
            {searchInput && (
              <button aria-label="Effacer" onClick={() => setSearchInput('')} className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">Effacer</button>
            )}
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full" onClick={() => setSearch(searchInput)}>Rechercher</button>
          </div>
        
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" fill="none" className="w-full h-16">
            <path d="M0,50 Q300,120 600,50 T1200,50 L1200,120 L0,120 Z" fill="currentColor" className="text-white" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Filter & Quick Actions */}
        <div className="acc-controls flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="acc-categories-wrap flex-1 flex items-center gap-3 overflow-x-auto py-2">
            <Filter className="acc-icon text-gray-500" />
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap border ${category === cat ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="acc-quick-actions flex gap-3 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Trier par:</label>
              <select className="border rounded-md px-3 py-2" onChange={(e) => setViewMode(e.target.value)} value={viewMode}>
                <option value="grid">Popularité</option>
                <option value="list">Prix: bas → haut</option>
                <option value="compact">Prix: haut → bas</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-md shadow hover:bg-emerald-700" onClick={() => openModal('publier')}>Publier</button>
            <button className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-md hover:bg-emerald-50" onClick={() => openModal('comparer')}>Comparer</button>
            <Link to="./marketplace/MarketPlace.jsx" className="px-4 py-2 border border-gray-200 rounded-md hover:shadow">Marketplace</Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="acc-stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-start">
            <div className="text-2xl font-bold text-green-600">{filtered.length}</div>
            <div className="text-sm text-gray-500">Produits disponibles</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-start">
            <div className="text-2xl font-bold text-blue-600">24/7</div>
            <div className="text-sm text-gray-500">Service disponible</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-start">
            <div className="text-2xl font-bold text-yellow-600">4.8⭐</div>
            <div className="text-sm text-gray-500">Note moyenne</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-start">
            <div className="text-2xl font-bold text-purple-600">1000+</div>
            <div className="text-sm text-gray-500">Clients satisfaits</div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Produits Populaires
          </h2>
          <div className="text-sm text-gray-600">
            {filtered.length} produit{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="acc-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white p-4 rounded-lg shadow">
                  <div className="bg-gray-200 rounded h-40 mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                </div>
              ))
            : filtered.map((produit) => (
                <div key={produit.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                  <ProductCard 
                    produit={produit} 
                    onAdd={() => addToCart(produit, 1)}
                    onViewDetails={handleViewDetails}
                  />
                </div>
              ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button className="px-3 py-2 border rounded-md">Préc</button>
          <div className="px-4 py-2">Page 1</div>
          <button className="px-3 py-2 border rounded-md">Suiv</button>
        </div>

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-500">Essayez de modifier votre recherche ou changez de catégorie</p>
          </div>
        )}
      </div>

      {/* Modal for quick actions */}
      {modalType && (
        <div className="pm-overlay" onClick={closeModal}>
          <div className="pm-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="pm-close" onClick={closeModal} aria-label="Fermer">×</button>
            <div className="pm-body">
              {modalType === 'publier' && (
                <div>
                  <h3>Publier un prix</h3>
                  <form onSubmit={(e) => { addNewProduct(e); closeModal(); }} className="pm-publish-form">
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
                      <div>
                        <label className="acc-label">Nom du produit</label>
                        <input className="acc-input" value={newProduct.nom} onChange={e => setNewProduct({...newProduct, nom: e.target.value})} />
                      </div>
                      <div>
                        <label className="acc-label">Prix</label>
                        <input className="acc-input" value={newProduct.prix} onChange={e => setNewProduct({...newProduct, prix: e.target.value})} />
                      </div>
                      <div>
                        <label className="acc-label">Catégorie</label>
                        <input className="acc-input" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                      </div>
                      <div>
                        <label className="acc-label">Nom du vendeur</label>
                        <input className="acc-input" value={newProduct.vendeur || ''} onChange={e => setNewProduct({...newProduct, vendeur: e.target.value})} />
                      </div>
                      <div>
                        <label className="acc-label">Image</label>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} />
                      </div>
                      <div>
                        <label className="acc-label">Note</label>
                        <input className="acc-input" value={newProduct.rating} onChange={e => setNewProduct({...newProduct, rating: e.target.value})} />
                      </div>
                      <div style={{gridColumn: '1 / -1'}}>
                        <label className="acc-label">Description</label>
                        <textarea className="acc-input" rows={3} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                      </div>
                    </div>
                    {imagePreview && <div style={{marginTop:12}}><img src={imagePreview} alt="preview" style={{maxWidth:200, borderRadius:8}}/></div>}
                    <div style={{marginTop:12, display:'flex', gap:8}}>
                      <button type="submit" className="acc-btn acc-cta">Publier</button>
                      <button type="button" className="acc-btn acc-cta-outline" onClick={() => { setNewProduct({ nom:'', prix:'', category:'', description:'', image:'', rating:'' }); setImagePreview(''); }}>Réinitialiser</button>
                    </div>
                  </form>
                </div>
              )}
              {modalType === 'comparer' && <ComparaisonPrix />}
              {modalType === 'explorer' && (
                <div>
                  <h3>Explorer le marché</h3>
                  <p>Voici quelques produits récents :</p>
                  <div style={{display:'grid', gridTemplateColumns: 'repeat(2,1fr)', gap:12}}>
                    {products.slice(0,6).map(p => (
                      <div key={p.id} style={{border:'1px solid #eee', padding:8, borderRadius:8}}>
                        <img src={p.image} alt={p.nom} style={{width:'100%', height:80, objectFit:'cover', borderRadius:6}} />
                        <div style={{fontWeight:700, marginTop:6}}>{p.nom}</div>
                        <div style={{color:'#666', fontSize:13}}>{p.prix}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {modalType === 'sellerProfile' && (
                <div>
                  <ProfilVendeur sellerId={sellerProfileId} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CartDrawer 
        open={cartOpen} 
        items={cartItems} 
        onClose={() => setCartOpen(false)} 
        onClear={clearCart} 
        onRemove={removeFromCart} 
        onChangeQty={changeQty} 
      />
    </div>
    </div>
  );
}

export default Accueil;