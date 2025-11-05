import React from 'react';
import TestimonialCard from './TestimonialCard';
import { useNavigate } from 'react-router-dom';

export default function Testimonials({ data, loading, error, onRetry, currentIndex, onSetIndex }) {
  const navigate = useNavigate();
  
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white p-6 rounded-2xl h-56" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 col-span-full">
        <div className="text-red-600 mb-4">{error}</div>
        <button onClick={onRetry} className="px-4 py-2 bg-emerald-600 text-white rounded">Réessayer</button>
      </div>
    );
  }

  // Use backend data only; if empty, render an empty state
  const used = Array.isArray(data) ? data : [];

  if (used.length === 0) {
    return (
      <div className="py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Soyez le premier à partager votre expérience !</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Rejoignez notre communauté et partagez votre avis sur nos produits. 
            Votre témoignage aidera d'autres clients à faire les bons choix.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/avis')} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg">
              Laisser un avis
            </button>
            <button onClick={() => navigate('/marketplace')} className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all">
              Voir nos produits
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Ce que disent nos clients</h2>
        <p className="text-gray-500">Découvrez les avis et retours d'expérience de celles et ceux qui nous font confiance au quotidien.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {used.map((t, i) => (
          <div key={t.id} className={`transition-all duration-500 ${i === currentIndex ? 'scale-105 z-10' : 'scale-95 opacity-75'}`}>
            <TestimonialCard testimonial={t} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-8">
        {used.map((_, index) => (
          <button key={index} onClick={() => onSetIndex(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-emerald-600 w-8' : 'bg-gray-300'}`} />
        ))}
      </div>
    </>
  );
} 