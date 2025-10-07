import React from 'react';
import placeholderImg from '../../../assets/wapibei.png';

export default function TestimonialCard({ testimonial = {} }) {
  const name = testimonial.name || testimonial.author || 'Client satisfait';
  const location = testimonial.location || testimonial.city || '';
  const text = testimonial.text || testimonial.body || testimonial.content || testimonial.review || '';
  const avatar = testimonial.avatar || placeholderImg;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-emerald-100">
      <img
        src={avatar}
        alt={name}
        className="w-16 h-16 rounded-full mb-4 object-cover border-2 border-emerald-200"
      />
      <div className="text-lg font-semibold text-gray-800 mb-2">{name}</div>
      {location ? <div className="text-emerald-600 text-sm mb-3">{location}</div> : null}
      <p className="text-gray-600 text-base mb-2">{text ? `"${text}"` : '"Aucun texte disponible"'}</p>
    </div>
  );
}