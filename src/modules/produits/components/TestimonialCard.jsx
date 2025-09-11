import React from 'react';

export default function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-emerald-100">
      <img
        src={testimonial.avatar}
        alt={testimonial.name}
        className="w-16 h-16 rounded-full mb-4 object-cover border-2 border-emerald-200"
      />
      <div className="text-lg font-semibold text-gray-800 mb-2">{testimonial.name}</div>
      <div className="text-emerald-600 text-sm mb-3">{testimonial.location}</div>
      <p className="text-gray-600 text-base mb-2">"{testimonial.text}"</p>
    </div>
  );
} 