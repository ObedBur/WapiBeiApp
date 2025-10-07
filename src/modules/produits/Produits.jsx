import React from 'react';
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
  const [showPublishModal, setShowPublishModal] = React.useState(!!openPublish);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h4>
              <p className="text-2xl font-bold text-blue-600 mb-3">{product.price}€</p>
              
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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