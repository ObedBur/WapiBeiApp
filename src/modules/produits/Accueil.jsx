import React from 'react';
import { Link } from 'react-router-dom';

import {
  Globe,
  Search,
  Bell,
  ShoppingCart,
  Star,
  Info,
  Mail,
  ArrowRight,
  Heart,
  Eye,
  X,
} from '../../components/Icons';
import heroImg from '../../assets/wapibei.png';

// Small mock dataset
const initialProducts = [
  {
    id: 1,
    nom: 'Riz Jasmin Premium',
    prix: '25 000 FC',
    category: 'Céréales',
    description: 'Riz jasmin de qualité supérieure, parfait pour tous vos plats.',
    image:
      'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.8,
  },
  {
    id: 2,
    nom: 'Huile de Palme Bio',
    prix: '18 500 FC',
    category: 'Huiles',
    description: 'Huile de palme 100% naturelle et bio, extraite à froid.',
    image:
      'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.6,
  },
  {
    id: 3,
    nom: 'Tomates Fraîches',
    prix: '8 000 FC',
    category: 'Légumes',
    description: 'Tomates fraîches du jour, cultivées localement.',
    image:
      'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.9,
  },
];

const ProductCard = ({ produit, onAdd, onViewDetails = () => {}, onToggleFavorite = () => {}, isFavorite = false }) => (
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
      <img src={produit.image} alt={produit.nom} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700" />
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
            <div className="text-center py-16">
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
      <p className="text-gray-600 text-base mb-2">“{testimonial.text}”</p>
    </div>
  );
}

// Blog posts data
const blogPosts = [
  {
    id: 1,
    title: '10 Astuces pour Économiser sur vos Courses Alimentaires',
    excerpt:
      "Découvrez nos conseils d'experts pour réduire votre budget courses sans compromettre la qualité.",
    image:
      'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=400',
    author: 'Équipe WapiBei',
    date: '15 Jan 2024',
  },
  {
    id: 2,
    title: 'Les Bienfaits des Produits Locaux Africains',
    excerpt:
      'Pourquoi privilégier les produits locaux ? Santé, économie et environnement au rendez-vous.',
    image:
      'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=400',
    author: 'Dr. Amina Kone',
    date: '12 Jan 2024',
  },
  {
    id: 3,
    title: 'Guide Complet de la Conservation des Aliments',
    excerpt:
      'Apprenez à conserver vos aliments plus longtemps et réduisez le gaspillage alimentaire.',
    image:
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    author: 'Chef Mamadou',
    date: '10 Jan 2024',
  },
];

// Simple BlogCard component
function BlogCard({ post }) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="font-bold text-gray-800 mb-2">{post.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {post.author} • {post.date}
          </div>
          <button className="text-emerald-600 font-semibold flex items-center gap-2">
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
  const testimonials = [
    {
      id: 1,
      name: 'Fatou S.',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      text: 'Wapibei m’a permis de trouver des produits locaux de qualité à des prix imbattables. Livraison rapide et service client au top !',
      location: 'Dakar, Sénégal',
    },
    {
      id: 2,
      name: 'Jean-Marc K.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      text: 'J’adore la simplicité d’utilisation et la sécurité des paiements. Je recommande à tous mes amis commerçants.',
      location: 'Abidjan, Côte d’Ivoire',
    },
    {
      id: 3,
      name: 'Aminata D.',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      text: 'Le choix de produits est impressionnant et la livraison express m’a vraiment dépannée. Merci Wapibei !',
      location: 'Bamako, Mali',
    },
  ];

  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);
  React.useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const products = initialProducts;
  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.nom.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  });

  const addToCart = (produit) => {
    setCartItems((prev) => {
      const found = prev.find((i) => i.id === produit.id);
      if (found)
        return prev.map((i) => (i.id === produit.id ? { ...i, qty: (i.qty || 1) + 1 } : i));
      return [...prev, { id: produit.id, nom: produit.nom, prix: produit.prix, qty: 1 }];
    });
    setCartOpen(true);
  };

  return (
    <div className="w-full bg-gray-50 ">
      <main className="w-full pb-16">
      <section className="relative pt-24">
        <div className="w-full bg-gradient-to-r from-green-600 to-emerald-500">
          <div className="max-w-7xl mx-auto px-6 py-16 lg:py-28">
            <div className="relative rounded-2xl text-white p-8 lg:p-12 shadow-2xl overflow-hidden">
              {/* floating decorative icons */}
              <div className="absolute left-8 top-8 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-yellow-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="absolute right-12 top-20 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-yellow-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17l-5 3 1-6-4-4 6-1 3-6 1 6 6 1-4 4 1 6z" />
                </svg>
              </div>

              <div className="mx-auto text-center max-w-3xl">
                <div className="inline-block bg-white/10 text-white/90 rounded-full px-4 py-1 mb-6">
                  <span className="text-sm">🔥 Offres limitées jusqu'à -50%</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
                  <span className="block">Comparez, publiez et</span>
                  <span className="block text-yellow-300">économisez</span>
                  <span className="block text-green-100 mt-2">partout en Afrique</span>
                </h1>
                <p className="mt-6 text-lg text-green-100/90">
                  Découvrez les meilleurs produits alimentaires aux meilleurs prix.{' '}
                  <span className="font-semibold text-yellow-200">Plus de 10,000 produits</span>{' '}
                  disponibles avec{' '}
                  <span className="font-semibold text-yellow-200">livraison gratuite</span> dans
                  toute l'Afrique.
                </p>

                {/* search */}
                <div className="mt-10 relative">
                  <div className="mx-auto max-w-2xl">
                    <div className="relative bg-white rounded-full shadow-lg px-4 py-3 flex items-center">
                      <Search className="w-5 h-5 text-gray-400 mr-3" />
                      <input
                        aria-label="Rechercher des produits"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Rechercher un produit (ex: Riz, Huile, Tomates...)"
                        className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
                      />
                      <button
                        className="ml-4 bg-emerald-600 text-white px-5 py-2 rounded-full font-medium shadow-md"
                        onClick={() => setSearch(searchInput)}
                      >
                        Rechercher
                      </button>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="mt-8 flex justify-center gap-6">
                  <button className="bg-white rounded-xl px-6 py-3 shadow-md flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-emerald-800">Publier un prix</div>
                      <div className="text-sm text-gray-500">Gagnez des points</div>
                    </div>
                  </button>

                  <button onClick={() => setIsCompareOpen(true)} className="border border-white/40 rounded-xl px-6 py-3 flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12h18M12 3v18" /></svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Comparer les prix</div>
                      <div className="text-sm text-gray-200/80">Économisez plus</div>
                    </div>
                  </button>
        </div>

                {/* benefits */}
                <div className="mt-12 flex items-center justify-center gap-8 text-sm text-green-50/90">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>{' '}
                    Livraison gratuite
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 10h18v10H3z" />
                    </svg>{' '}
                    Paiement sécurisé
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l2 5h5l-4 3 1 5-4-3-4 3 1-5-4-3h5z" />
                    </svg>{' '}
                    Qualité garantie
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 8v4l3 3" />
                    </svg>{' '}
                    Support 24/7
                  </div>
              </div>
              </div>

              {/* floating gift */}
              <div className="absolute right-10 bottom-6 w-14 h-14 bg-white/6 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-pink-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7" />
                </svg>
            </div>
          </div>
          </div>
          </div>
      </section>
        <section className="bg-gradient-to-r from-green-50 via-white to-green-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white rounded-3xl shadow-xl p-10">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mb-4 shadow-md">
                  <svg
                    className="w-8 h-8 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 21 12 17.27 7.82 21 9 12.91l-5-3.64 5.91-.91z" />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-800 mb-3">
                  Une expérience d'achat révolutionnaire
                </h2>
                <p className="text-gray-600 max-w-3xl leading-relaxed">
                  Découvrez une plateforme complète qui transforme votre façon d'acheter avec des
                  fonctionnalités innovantes et un service exceptionnel.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                {/* Comparaison intelligente */}
                <div className="border border-emerald-100 rounded-2xl bg-white p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                    <svg
                      className="w-7 h-7 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 17v-2a4 4 0 014-4h6M9 7V5a4 4 0 014-4h6" />
                      <circle cx="7" cy="17" r="3" />
                      <circle cx="17" cy="7" r="3" />
                    </svg>
                  </div>
                  <div className="font-semibold text-emerald-800 mb-2">
                    Comparaison intelligente
                  </div>
                  <div className="text-gray-600 text-sm leading-relaxed">
                    Comparez les prix en temps réel avec notre IA pour économiser jusqu'à{' '}
                    <span className="font-bold text-emerald-600">40%</span> sur vos achats
                  </div>
                </div>
                {/* Sécurité maximale */}
                <div className="border border-emerald-100 rounded-2xl bg-white p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                    <svg
                      className="w-7 h-7 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="11" width="18" height="10" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                      <circle cx="12" cy="16" r="1.5" />
                    </svg>
                  </div>
                  <div className="font-semibold text-emerald-800 mb-2">Sécurité maximale</div>
                  <div className="text-gray-600 text-sm leading-relaxed">
                    Transactions cryptées et protection des données avec certification SSL et
                    conformité RGPD
                  </div>
                </div>
                {/* Livraison express */}
                <div className="border border-emerald-100 rounded-2xl bg-white p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                    <svg
                      className="w-7 h-7 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="1" y="7" width="15" height="13" rx="2" />
                      <path d="M16 10h2.5a2 2 0 011.98 1.75l.5 4A2 2 0 0119 18H17" />
                      <circle cx="5.5" cy="19.5" r="1.5" />
                      <circle cx="18.5" cy="19.5" r="1.5" />
                      <path d="M7 10v2h5" />
                    </svg>
                  </div>
                  <div className="font-semibold text-emerald-800 mb-2">Livraison express</div>
                  <div className="text-gray-600 text-sm leading-relaxed">
                    Livraison dans toute l'Afrique en 24-48h avec suivi GPS en temps réel
                  </div>
                </div>
                {/* Support premium */}
                <div className="border border-emerald-100 rounded-2xl bg-white p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                    <svg
                      className="w-7 h-7 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 15c1.333 1 2.667 1 4 0" />
                      <path d="M9 9h.01M15 9h.01" />
                    </svg>
                  </div>
                  <div className="font-semibold text-emerald-800 mb-2">Support premium</div>
                  <div className="text-gray-600 text-sm leading-relaxed">
                    Assistance personnalisée 24/7 par chat, téléphone et WhatsApp dans votre langue
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              Découvrez nos produits populaires <span className="text-emerald-600">en direct</span>
            </h2>
            <div className="text-sm text-gray-600">
              {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-white p-4 rounded-lg shadow"
                    style={{ height: 240 }}
                  />
                ))
              : filtered.map((p) => <ProductCard key={p.id} produit={p} onAdd={addToCart} />)}
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <MessageCircle className="w-4 h-4" />
                Témoignages clients
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Ce que disent nos clients</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Plus de 10,000 clients nous font confiance pour leurs achats quotidiens
              </p>
            </div>

            {/* Testimonials Carousel */}
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    className={`transition-all duration-500 ${
                      index === currentTestimonial ? 'scale-105 z-10' : 'scale-95 opacity-75'
                    }`}
                  >
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                ))}
              </div>

              {/* Navigation dots */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-emerald-600 w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Info className="w-4 h-4" />
                Blog & Conseils
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Conseils et actualités</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Découvrez nos articles pour optimiser vos achats et découvrir les tendances
                alimentaires
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            <div className="text-center mt-12">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3 mx-auto">
                Voir tous les articles
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <span className="w-4 h-4">🎯</span>
                  Rejoignez-nous maintenant
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Prêt à révolutionner <span className="block text-emerald-400">vos achats ?</span>
                </h2>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Rejoignez plus de 10,000 utilisateurs qui économisent déjà avec WapiBei. Commencez
                  dès aujourd'hui et découvrez une nouvelle façon d'acheter.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="group bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1">
                    <span className="w-6 h-6">🏆</span>
                    <div className="text-left">
                      <div>Devenir vendeur</div>
                      <div className="text-sm text-emerald-200">Commission 0% le 1er mois</div>
                    </div>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button className="group border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1">
                    <span className="w-6 h-6">👥</span>
                    <div className="text-left">
                      <div>Créer un compte</div>
                      <div className="text-sm opacity-80">Gratuit à vie</div>
                    </div>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                      <div className="w-8 h-8 text-emerald-400 mb-3">📊</div>
                      <h3 className="font-bold mb-2">Économies moyennes</h3>
                      <p className="text-2xl font-bold text-emerald-400">35%</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                      <div className="w-8 h-8 text-blue-400 mb-3">👥</div>
                      <h3 className="font-bold mb-2">Utilisateurs actifs</h3>
                      <p className="text-2xl font-bold text-blue-400">10K+</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                      <div className="w-8 h-8 text-purple-400 mb-3">📈</div>
                      <h3 className="font-bold mb-2">Satisfaction client</h3>
                      <p className="text-2xl font-bold text-purple-400">98%</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                      <div className="w-8 h-8 text-yellow-400 mb-3">⚡</div>
                      <h3 className="font-bold mb-2">Commandes/jour</h3>
                      <p className="text-2xl font-bold text-yellow-400">500+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-6">Restez informé des meilleures offres</h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Recevez chaque semaine nos offres exclusives, nouveaux produits et conseils d'experts
              directement dans votre boîte mail.
            </p>

            <div className="max-w-md mx-auto">
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="flex-1 px-6 py-4 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/20"
                />
                <button className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-colors shadow-lg">
                  S'abonner
                </button>
              </div>
              <p className="text-sm text-emerald-200 mt-4">Pas de spam, désabonnement en un clic</p>
            </div>
          </div>
        </section>
      </main>

      {/* Price comparison modal */}
      {isCompareOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Overlay avec blur */}
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={() => setIsCompareOpen(false)}
    />

    {/* Contenu modale */}
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 p-6 z-10 animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b pb-3">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
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


      <CartDrawer open={cartOpen} items={cartItems} onClose={() => setCartOpen(false)} />
    </div>
  );
}

export default Accueil;
