import React from 'react';
import { ArrowRight } from './Icons';

export default function EmptyState({
  icon,
  title = 'Aucun élément',
  description = '',
  actions = null,
  centered = true,
  className = '',
  children,
}) {
  return (
    <div className={`${centered ? 'text-center' : ''} ${className}`}> 
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
          {icon || (
            <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          )}

        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
        {description ? <p className="text-gray-600 mb-6 leading-relaxed">{description}</p> : null}

        {actions ? (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">{actions}</div>
        ) : null}

        {children}
      </div>
    </div>
  );
}


