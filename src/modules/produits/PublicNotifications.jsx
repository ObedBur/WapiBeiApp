import React, { useEffect, useState } from 'react';
import { Bell, User, ArrowRight, Star, Tag } from '../../components/Icons';

export default function PublicNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      const response = await fetch(`${BASE}/api/public-notifications`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur lors du chargement des notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'nouveau_produit':
        return <Tag className="w-6 h-6 text-emerald-600" />;
      case 'offre_speciale':
        return <Star className="w-6 h-6 text-yellow-600" />;
      case 'maintenance':
        return <Bell className="w-6 h-6 text-blue-600" />;
      default:
        return <Bell className="w-6 h-6 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'nouveau_produit':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'offre_speciale':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'maintenance':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
            <Bell className="w-8 h-8 text-emerald-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chargement des notifications...</h2>
          <p className="text-gray-600">Récupération des dernières annonces</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Bell className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={loadNotifications}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
          <Bell className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Notifications Publiques</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Restez informé des dernières nouveautés, offres spéciales et annonces importantes de notre plateforme
        </p>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Aucune notification pour le moment</h3>
          <p className="text-gray-600 mb-6">
            Nous vous informerons dès qu'il y aura de nouvelles annonces importantes
          </p>
          <button 
            onClick={loadNotifications}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Actualiser
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm opacity-75">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(notification.created_at)}
                    </div>
                  </div>
                  <p className="text-sm mb-4 leading-relaxed">
                    {notification.content}
                  </p>
                  {notification.action_url && (
                    <a
                      href={notification.action_url}
                      className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                    >
                      En savoir plus
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Ne ratez aucune nouveauté !
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Abonnez-vous à notre newsletter pour recevoir directement dans votre boîte mail 
            les dernières offres et annonces importantes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg">
              S'abonner à la newsletter
            </button>
            <button 
              onClick={() => window.history.back()}
              className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
