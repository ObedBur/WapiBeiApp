import React from 'react';

export default function ProductModal({ product, onClose, onAdd }) {
  if (!product) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        role="dialog" 
        aria-modal="true" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:w-1/2">
          <img 
            src={product.image} 
            alt={product.nom} 
            className="w-full h-64 md:h-full object-cover"
          />
        </div>
        <div className="p-6 md:w-1/2 overflow-y-auto">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-800">{product.nom}</h2>
            <button 
              className="text-gray-400 hover:text-gray-500 text-2xl" 
              onClick={onClose} 
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">{product.category}</p>
          <p className="text-gray-600 mt-4">{product.description}</p>
          <p className="text-2xl font-bold text-primary mt-4">{product.prix}</p>
          
          <div className="flex space-x-3 mt-6">
            <button 
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200"
              onClick={() => onAdd && onAdd(product)}
            >
              Ajouter au panier
            </button>
            <button 
              className="px-6 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


