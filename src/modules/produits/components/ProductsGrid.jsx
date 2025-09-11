import React from 'react';

export default function ProductsGrid({ products, isLoading, error, onRetry, onAddToCart, onViewDetails, onToggleFavorite, favorites, isLoadingMore, hasMore, onLoadMore, popularityMap }) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Découvrez nos produits populaires <span className="text-emerald-600">en direct</span></h2>
        <div className="text-sm text-gray-600">{products.length} produit{products.length !== 1 ? 's' : ''}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-4 rounded-lg shadow" style={{ height: 240 }} />
          ))
        ) : error ? (
          <div className="col-span-full text-center py-16 text-red-500">
            <div>Erreur lors du chargement des produits: {error}</div>
            <div className="mt-4">
              <button onClick={onRetry} className="px-4 py-2 bg-emerald-600 text-white rounded">Réessayer</button>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-500">Aucun produit populaires pour le moment.</div>
        ) : (
          products.map((p) => (
            <ProductCard key={p.id} produit={p} onAdd={onAddToCart} onViewDetails={onViewDetails} onToggleFavorite={onToggleFavorite} isFavorite={favorites.includes(p.id)} isPopular={Boolean(popularityMap[p.id] && popularityMap[p.id].isPopular)} />
          ))
        )}
      </div>

      <div className="mt-6 flex justify-center">
        {isLoading ? null : hasMore ? (
          <button onClick={onLoadMore} className="px-6 py-3 bg-emerald-600 text-white rounded-lg">Charger plus</button>
        ) : (
          <div className="text-gray-500">Plus de produits</div>
        )}
      </div>
    </section>
  );
} 