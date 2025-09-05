
import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from './Icons';
import placeholderImg from '../assets/wapibei.png';

function ProductCard({ produit, onAdd, onViewDetails }) {
  const imgSrc = produit.image || placeholderImg;

  return (
    <article className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <img 
          loading="lazy" 
          src={imgSrc} 
          alt={`${produit.nom} — ${produit.category || ''}`} 
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
        />
        <span className="absolute bottom-3 right-3 bg-primary text-white px-3 py-1 rounded-lg font-semibold">
          {produit.prix}
        </span>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{produit.nom}</h3>
          <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
            <span className="text-green-700 font-medium mr-1">
              {produit.rating?.toFixed?.(1) || '—'}
            </span>
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-2">{produit.category}</p>
        <p className="text-gray-600 text-sm mb-4">{produit.description}</p>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onViewDetails && onViewDetails(produit)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200"
          >
            Voir
          </button>
          <button 
            onClick={() => onAdd && onAdd(produit)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200"
          >
            Ajouter
          </button>
          <Link 
            to={`/produit/${produit.id}`}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
          >
            Fiche
          </Link>
        </div>
      </div>
    </article>
  );
}

export default React.memo(ProductCard);
