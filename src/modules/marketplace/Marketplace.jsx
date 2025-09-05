import React, { useEffect, useState } from 'react';

export default function Marketplace() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sort, setSort] = useState('relevance');

  // Fetch products from API; fall back to sample data if API unavailable
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('No API');
        const data = await res.json();
        if (!cancelled) setProducts(data);
      } catch (err) {
        // Fallback sample data
        if (!cancelled) {
          setProducts([
            {
              id: 1,
              name: 'Produit A',
              category: 'Catégorie 1',
              avgPrice: 12.5,
              priceRange: '10 - 15',
              image: '/uploads/sample-product.jpg',
              sellers: [
                { id: 's1', price: 11.99, rating: 4 },
                { id: 's2', price: 12.5, rating: 5 }
              ]
            },
            {
              id: 2,
              name: 'Produit B',
              category: 'Catégorie 2',
              avgPrice: 8.2,
              priceRange: '7 - 9',
              image: '/uploads/sample-product-2.jpg',
              sellers: [
                { id: 's3', price: 7.5, rating: 3 },
                { id: 's4', price: 8.9, rating: 4 }
              ]
            }
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const normalize = (s) => s.trim().toLowerCase();

  const filtered = products
    .filter(p => (categoryFilter === 'all' ? true : p.category === categoryFilter))
    .filter(p => normalize(p.name).includes(normalize(search)) || normalize(p.category).includes(normalize(search)));

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-asc') return a.avgPrice - b.avgPrice;
    if (sort === 'price-desc') return b.avgPrice - a.avgPrice;
    return a.name.localeCompare(b.name);
  });

  const formatPrice = (v) => (typeof v === 'number' ? v.toFixed(2) : v);

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1 flex gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit ou catégorie..."
            className="w-full md:w-80 px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500"
          />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 border rounded-md">
            <option value="all">Toutes catégories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Trier :</label>
          <select value={sort} onChange={e => setSort(e.target.value)} className="px-3 py-2 border rounded-md">
            <option value="relevance">Par nom</option>
            <option value="price-asc">Prix ↑</option>
            <option value="price-desc">Prix ↓</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Chargement des produits...</div>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">Aucun produit trouvé.</div>
          ) : (
            sorted.map((product) => (
              <article
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full md:w-44 h-44 md:h-40 object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{product.name}</h2>
                      <p className="text-sm text-gray-500">{product.category} • Prix moyen: ${formatPrice(product.avgPrice)}</p>
                      <p className="mt-1 text-sm text-gray-400">Fourchette: {product.priceRange}</p>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-indigo-700 transition-colors"
                      >
                        Voir vendeurs
                      </button>
                      <div className="flex gap-2">
                        {product.sellers?.slice(0, 2).map((s) => (
                          <div key={s.id} className="flex flex-col items-end">
                            <span className="text-sm font-bold text-gray-900">${formatPrice(s.price)}</span>
                            <div className="flex gap-1 text-yellow-400">
                              {Array.from({ length: Math.round(s.rating || 0) }).map((_, i) => (
                                <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.561-.955L10 0l2.949 5.955 6.561.955-4.755 4.635 1.123 6.545z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* Modal for selected product sellers */}
      {selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Vendeurs pour {selectedProduct.name}</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-500 hover:text-gray-700">Fermer</button>
            </div>
            <div className="space-y-4">
              {selectedProduct.sellers.map((s) => (
                <div key={s.id} className="flex justify-between items-center border p-3 rounded">
                  <div>
                    <p className="font-bold">Vendeur {s.id}</p>
                    <p className="text-sm text-gray-500">Note: {s.rating}/5</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">${formatPrice(s.price)}</p>
                    <button className="mt-2 px-3 py-1 bg-primary-600 text-white rounded">Contacter</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


