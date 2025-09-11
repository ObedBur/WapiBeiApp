import React from 'react';
import TestimonialCard from './TestimonialCard';

export default function Testimonials({ data, loading, error, onRetry, currentIndex, onSetIndex }) {
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

  if (!data || data.length === 0) {
    return <div className="text-center py-12 col-span-full text-gray-500">Aucun témoignage disponible pour le moment.</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {data.map((t, i) => (
          <div key={t.id} className={`transition-all duration-500 ${i === currentIndex ? 'scale-105 z-10' : 'scale-95 opacity-75'}`}>
            <TestimonialCard testimonial={t} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-8">
        {data.map((_, index) => (
          <button key={index} onClick={() => onSetIndex(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-emerald-600 w-8' : 'bg-gray-300'}`} />
        ))}
      </div>
    </>
  );
} 