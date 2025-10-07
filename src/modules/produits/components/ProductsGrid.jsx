import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../../components/ProductCard';
import EmptyState from '../../../components/EmptyState';
// Remove mock fallback: expect `products` to be provided from backend

export default function ProductsGrid({ products, isLoading, error, onRetry, onAddToCart, onViewDetails, onToggleFavorite, favorites = [], isLoadingMore, hasMore, onLoadMore, popularityMap }) {
  const navigate = useNavigate();
  const effectiveRaw = Array.isArray(products) ? products : [];
  

  const normalizedProducts = React.useMemo(() => {
    return (effectiveRaw || []).map((p) => {
      return {
        // keep original fields but normalize common names used by ProductCard
        ...p,
        id: p.id ?? p._id ?? p.productId,
        nom: p.nom ?? p.name ?? p.title ?? '',
        prix: p.prix ?? p.price ?? p.cost ?? '',
        image:
          p.image ??
          (Array.isArray(p.images) && (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url)) ??
          p.img ??
          p.imageUrl ??
          p.url ??
          p.thumbnail ??
          (p.assets && Array.isArray(p.assets) && p.assets[0] && (p.assets[0].url || p.assets[0].src)) ??
          '',
        description: p.description ?? p.desc ?? p.summary ?? '',
        category: p.category ?? p.categorie ?? 'Autres',
        rating: p.rating ?? p.note ?? p.ratingValue ?? 0,
        inStock: p.inStock ?? (p.stock != null ? p.stock > 0 : true),
      };
    });
  }, [effectiveRaw]);

  const grouped = React.useMemo(() => {
    const map = {};
    (normalizedProducts || []).forEach((p) => {
      const key = (p.category || 'Autres').trim() || 'Autres';
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [normalizedProducts]);

  const categories = Object.keys(grouped);

  // refs/state for row scrolling & overflow detection
  const rowRefs = React.useRef({});
  const [hasOverflow, setHasOverflow] = React.useState({});

  const checkOverflow = (cat) => {
    const el = rowRefs.current[cat];
    if (!el) return false;
    return el.scrollWidth > el.clientWidth + 1;
  };

  const updateOverflows = React.useCallback(() => {
    const next = {};
    Object.keys(grouped).forEach((cat) => {
      next[cat] = checkOverflow(cat);
    });
    setHasOverflow((prev) => {
      const changed = Object.keys(next).some((k) => prev[k] !== next[k]);
      return changed ? next : prev;
    });
  }, [grouped]);

  React.useEffect(() => {
    updateOverflows();
    const onResize = () => updateOverflows();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateOverflows]);

  // observe changes in each row (if ResizeObserver available)
  React.useEffect(() => {
    const observers = [];
    if (typeof ResizeObserver !== 'undefined') {
      Object.keys(grouped).forEach((cat) => {
        const el = rowRefs.current[cat];
        if (!el) return;
        const ro = new ResizeObserver(() => updateOverflows());
        ro.observe(el);
        observers.push(ro);
      });
    }
    return () => observers.forEach((ro) => ro.disconnect && ro.disconnect());
  }, [grouped, updateOverflows]);

  const scrollRow = (cat, direction) => {
    const el = rowRefs.current[cat];
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.7) || 300;
    el.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 shadow-sm mr-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4M4 10v6a2 2 0 002 2h12a2 2 0 002-2v-6M4 10l8 4 8-4" />
            </svg>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
            Découvrez nos <span className="text-emerald-600">produits populaires</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-emerald-50 px-4 py-2 rounded-lg shadow-sm font-medium">
          <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.257 3.099c.366-.446.993-.446 1.359 0l6.518 7.95c.457.557.052 1.401-.68 1.401H3.42c-.732 0-1.137-.844-.68-1.401l6.517-7.95z" />
          </svg>
          <span>
            {normalizedProducts.length} produit{normalizedProducts.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white p-4 rounded-lg shadow"
              style={{ height: 240 }}
            />
          ))}
        </div>
      ) : error ? (
        <div className="col-span-full text-center py-16 text-red-500">
          <div>Erreur lors du chargement des produits: {error}</div>
          <div className="mt-4">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-emerald-600 text-white rounded"
            >
              Réessayer
            </button>
          </div>
        </div>
      ) : normalizedProducts.length === 0 ? (
        <div className="col-span-full py-8">
          <EmptyState
            title="Nos produits arrivent bientôt !"
            description={"Nous préparons une sélection exceptionnelle de produits frais et locaux. Revenez bientôt pour découvrir nos offres exclusives !"}
            actions={(
              <>
                <button onClick={() => navigate('/notifications-publiques')} className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg">
                  Voir les notifications
                </button>
                <button onClick={() => navigate('/marketplace')} className="px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-all transform hover:scale-105">
                  Découvrir nos vendeurs
                </button>
                <button onClick={() => navigate('/vendeurs')} className="px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-all transform hover:scale-105 ml-3">
                  Voir tous les vendeurs
                </button>
              </>
            )}
          />
        </div>
      ) : (
        <div className="space-y-10">
          {[
            "Fruits",
            "Légumes",
            "Tubercules",
            "Céréales",
            "Légumineuses",
            "Produits animaux",
            "Produits laitiers",
            "Épices et condiments",
            "Huiles et oléagineux",
            "Graines et semences",
          ].map((cat) =>
            grouped[cat] && grouped[cat].length > 0 ? (
              <div key={cat}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{cat}</h3>
                  <div className="text-sm text-gray-500">
                    {grouped[cat].length} produit
                    {grouped[cat].length !== 1 ? "s" : ""}
                  </div>
                </div>

              <div className="relative">
                {hasOverflow[cat] && (
                  <button
                    aria-label={`Précédent ${cat}`}
                    onClick={() => scrollRow(cat, 'left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow"
                  >
                    <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                )}
                <div className="relative py-2">
                  <div className="absolute inset-0 pointer-events-none" />
                  <div
                    ref={(el) => (rowRefs.current[cat] = el)}
                    className="flex gap-4 items-start hide-scrollbar"
                    style={{ paddingBottom: 6, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                  >
                    {grouped[cat].map((p, idx) => (
                      <div key={p.id ?? `p-${cat}-${idx}`} style={{ flex: '0 0 auto' }}>
                        <ProductCard
                          produit={p}
                          onAdd={onAddToCart}
                          onViewDetails={onViewDetails}
                          onToggleFavorite={onToggleFavorite}
                          isFavorite={Array.isArray(favorites) && favorites.includes(p.id)}
                          isPopular={Boolean(popularityMap && popularityMap[p.id] && popularityMap[p.id].isPopular)}
                          cardWidth="220px"
                          imgHeight={96}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {hasOverflow[cat] && (
                  <button
                    aria-label={`Suivant ${cat}`}
                    onClick={() => scrollRow(cat, 'right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow"
                  >
                    <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                )}
              </div>
              </div>
            ) : null
          )}
        </div>
      )}

    {/* load more button */}
    <div className="mt-10 flex flex-col items-center">
      <div className="w-full flex justify-center">
        <div className="relative flex items-center gap-2">
          {isLoadingMore ? (
            <button
              disabled
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-500/80 text-white font-semibold shadow-lg cursor-not-allowed opacity-80"
            >
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Chargement...
            </button>
          ) : hasMore ? (
            <button
              onClick={() => onLoadMore && onLoadMore()}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold shadow-lg hover:from-emerald-700 hover:to-teal-600 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <span>Charger plus</span>
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-y-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => {
                try {
                  window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'info', message: 'Plus de produits disponibles' } }));
                } catch (e) {}
              }}
              aria-disabled="true"
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gray-200 text-gray-500 font-semibold shadow cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              Plus de produits
            </button>
          )}
        </div>
      </div>
      <div className="w-24 h-1 bg-gradient-to-r from-emerald-200 via-emerald-400 to-teal-200 rounded-full mt-4 opacity-60" />
    </div>
    </section>
  );
}