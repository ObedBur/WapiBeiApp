import React from 'react';
import { Link } from 'react-router-dom';

export default function LoginButton({ onClick, className = '' }) {
  return (
    <Link
      to="/connexion"
      onClick={onClick}
      className={`
        px-5 py-2.5 
        rounded-full font-semibold 
        bg-emerald-600 text-white 
        shadow-md 
        hover:bg-emerald-700 hover:shadow-lg 
        active:scale-95 
        transition-all duration-200
        ${className}
      `}
    >
      Connexion
    </Link>
  );
}
