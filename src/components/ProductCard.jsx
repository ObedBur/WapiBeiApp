import React from 'react';
import { Star, MapPin, Tag, Plus, Eye } from './Icons';
import placeholderImg from '../assets/wapibei.png';

export function ProductCard({ product, produit, view = 'grid', onView, onAdd, resolveImageUrl, formatPrice, sellersById = {}, onViewSellers, onAddToCart, onOpenContactModal, onOpenSellerModal }) {
  const prod = product || produit || {};
  const name = prod.name || prod.nom || '';
  const city = prod.city || prod.ville || '';
  const category = prod.category || '';
  const description = prod.description || prod.description || '';
  const priceDisplay = formatPrice ? formatPrice(prod.price || prod.prix) : (prod.price || prod.prix || '');
  const rawPriceField = String(prod.prix || prod.price || '');
  // Prefer explicit currency field, fall back to detecting in price string, default to 'FC'
  const currencySuffix = prod.currency || (rawPriceField.includes('USD') ? 'USD' : rawPriceField.includes('EUR') ? 'EUR' : 'FC');
  const sellerLabel = prod.seller_id ? (sellersById[prod.seller_id]?.name || 'Vendeur inconnu') : 'Vendeur inconnu';

  return (
    <article key={prod.id} className={`group bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-300 ${view === 'list' ? 'max-w-[4.5rem]' : ''}`}>
      <div className={view === 'grid' ? 'flex flex-col' : 'flex items-center gap-2'}>
        <div className="relative overflow-hidden">
          <img
            src={resolveImageUrl ? resolveImageUrl(prod.image || prod.image_url || prod.imageUrl) : (prod.image || prod.image_url || prod.imageUrl)}
            alt={name}
            className={`${view === 'grid' ? 'w-full h-20' : 'w-12 h-20'} object-cover group-hover:scale-105 transition-transform duration-300`}
          />
          <div className="absolute top-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-xs font-medium">{(prod.rating && typeof prod.rating.toFixed === 'function') ? prod.rating.toFixed(1) : (prod.rating ?? '—')}</span>
            </div>
          </div>
          {prod.availability === 'out_of_stock' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">Épuisé</span>
            </div>
          )}
        </div>

        <div className="p-1 flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">{name}</h3>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <MapPin className="w-3 h-3" />
              <span>{city}</span>
              <span>•</span>
              <Tag className="w-3 h-3" />
              <span>{category}</span>
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>

            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold text-emerald-600">
                {priceDisplay} {currencySuffix}
              </div>
              <div className="text-xs text-gray-500">
                {sellerLabel}
              </div>
            </div>

            {prod.availability && (
              <div className="mb-3">
                {prod.availability === 'in_stock' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">En stock</span>
                )}
                {prod.availability === 'low_stock' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Stock limité</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={() => {
                // prefer explicit prop names passed by parent (Marketplace / ProductsGrid / Accueil)
                if (typeof onViewSellers === 'function') return onViewSellers(prod);
                if (typeof onViewDetails === 'function') return onViewDetails(prod);
                if (typeof onView === 'function') return onView(prod);
                return undefined;
              }}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Voir vendeurs
            </button>
            <button
              onClick={() => {
                if (typeof onAddToCart === 'function') return onAddToCart(prod);
                if (typeof onAdd === 'function') return onAdd(prod);
                return undefined;
              }}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              disabled={prod.availability === 'out_of_stock'}
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
export default React.memo(ProductCard);