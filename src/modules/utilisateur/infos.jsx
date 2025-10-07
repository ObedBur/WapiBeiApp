import React from 'react';
import { User, Mail, Globe } from '../../components/Icons';

// Inline small icons used in this component
const MapPin = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M12 11.5a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 21s6-4.5 6-9.5A6 6 0 0012 5a6 6 0 00-6 6C6 16.5 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Calendar = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
);
const Award = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M8 21l4-3 4 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
);
const Shield = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M12 2l7 3v6c0 5-4 9-7 11-3-2-7-6-7-11V5l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

export default function Infos({ seller = {} }) {
  if (!seller) return null;
  const joinDate = seller?.date_inscription ? new Date(seller.date_inscription) : new Date();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Informations de contact
          </h4>
          <div className="space-y-3">
            {seller.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <a href={`mailto:${seller.email}`} className="text-gray-700 font-medium">{seller.email}</a>
              </div>
            )}
            {seller.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{seller.location}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">Membre depuis {joinDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
            </div>
            {seller.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-gray-500" />
                <a href={seller.website} target="_blank" rel="noreferrer" className="text-gray-700">{seller.website}</a>
              </div>
            )}
          </div>
        </div>

        {/* Badges / Achievements */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Badges et certifications
          </h4>
          <div className="space-y-3">
            {seller.verified && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">Profil vérifié</div>
                  <div className="text-sm text-blue-700">Identité confirmée</div>
                </div>
              </div>
            )}
            {seller.isPremium && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-900">Vendeur Premium</div>
                  <div className="text-sm text-yellow-700">Accès aux fonctionnalités avancées</div>
                </div>
              </div>
            )}
            {!seller.verified && !seller.isPremium && (
              <div className="text-sm text-gray-600">Aucun badge</div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Statistiques de vente</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{seller.ordersCount || 0}</div>
            <div className="text-sm text-gray-600">Commandes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{seller.rating ?? 4.5}/5</div>
            <div className="text-sm text-gray-600">Note moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{seller.followersCount || 0}</div>
            <div className="text-sm text-gray-600">Abonnés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{seller.responseTime || '< 2h'}</div>
            <div className="text-sm text-gray-600">Temps de réponse</div>
          </div>
        </div>
      </div>
    </div>
  );
}