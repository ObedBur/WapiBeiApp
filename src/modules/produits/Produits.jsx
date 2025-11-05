import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye } from '../../components/Icons';
import ProductModal, { PublishProductModal } from '../../components/ProductModal';
import EmptyState from '../../components/EmptyState';

// Inline fallbacks
const Package = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M21 16V8a2 2 0 00-1-1.73L13 3a2 2 0 00-2 0L4 6.27A2 2 0 003 8v8a2 2 0 001 1.73L11 21a2 2 0 002 0l8-4.27A2 2 0 0021 16z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Plus = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Edit = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M3 21v-3l11-11 3 3L6 21H3z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Trash2 = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M3 6h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M8 6v14a2 2 0 002 2h4a2 2 0 002-2V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
);

export default function Produits({ products = [], openPublish = false, onAddProduct }) {
  const navigate = useNavigate();
  const [showPublishModal, setShowPublishModal] = React.useState(!!openPublish);
  const [viewProduct, setViewProduct] = React.useState(null);
  const [title, setTitle] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [image, setImage] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleAddProduct = () => {
    // Open publish modal (instead of instantly creating) so user can enter details
    setTitle(''); setPrice(''); setImage(''); setDescription('');
    setShowPublishModal(true);
  };

  const handleSubmitNewProduct = (e) => {
    e && e.preventDefault && e.preventDefault();
    const newProduct = {
      id: Date.now(),
      name: title || 'Nouveau Produit',
      price: Number(price) || 0,
      image: image || 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: description || ''
    };
    onAddProduct && onAddProduct(newProduct);
    setShowPublishModal(false);
  };

  if (products.length === 0) {
    return (
      <div className="py-16">
        <EmptyState
          title="Aucun produit"
          description="Commencez par ajouter votre premier produit à votre boutique."
          actions={(
            <>
              <button onClick={handleAddProduct} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                <Plus className="w-5 h-5" />
                Ajouter un produit
              </button>
            </>
          )}
        >
          {showPublishModal && (
            <PublishProductModal
              isOpen={showPublishModal}
              onClose={() => setShowPublishModal(false)}
              onPublish={(p) => { onAddProduct && onAddProduct(p); setShowPublishModal(false); }}
            />
          )}
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">
          {products.length} produit{products.length > 1 ? 's' : ''}
        </h3>
        <button 
          onClick={handleAddProduct}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Publier vos produits */}
      <div>
        <button
          onClick={() => {
            try {
              const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
              fetch(`${BASE}/api/vendor-click`, { method: 'POST' }).catch(() => {});
            } catch (_) {}
            try { navigate('/publier'); } catch (_) { window.location.href = '/publier'; }
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold"
        >
          Publier vos produits
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <div className="p-3">
              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">{product.name}</h4>
              <p className="text-xl font-bold text-blue-600 mb-3">{product.price}€</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setViewProduct(product)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                >
                  Afficher
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bouton Publier placé sous la grille des produits */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => {
            try {
              const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
              fetch(`${BASE}/api/vendor-click`, { method: 'POST' }).catch(() => {});
            } catch (_) {}
            try { navigate('/publier'); } catch (_) { window.location.href = '/publier'; }
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
        >
          Publier vos produits
        </button>
      </div>

      {viewProduct && (
        <ProductModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
          onAdd={(p) => { onAddProduct && onAddProduct(p); setViewProduct(null); }}
        />
      )}
      {showPublishModal && (
        <PublishProductModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          onPublish={(p) => { onAddProduct && onAddProduct(p); setShowPublishModal(false); }}
        />
      )}
    </div>
  );
}