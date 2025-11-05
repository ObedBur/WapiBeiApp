import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from '../../utils/api';

export default function Vendeurs() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth(`${BASE}/api/sellers`);
        if (!cancelled) setSellers(Array.isArray(data) ? data : (data.sellers || data.data || []));
      } catch (e) {
        if (!cancelled) setSellers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="py-20 text-center">Chargement des vendeurs…</div>;

  if (!sellers || sellers.length === 0) return <div className="py-20 text-center">Aucun vendeur trouvé.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tous les vendeurs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((s) => (
          <div key={s.id || s._id} className="bg-white rounded-xl p-4 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                {s.avatar || s.photo ? (
                  <img src={String(s.avatar || s.photo).startsWith('/uploads') ? `${BASE}${s.avatar || s.photo}` : (s.avatar || s.photo)} alt={s.name || s.nom} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400">👨‍🌾</div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{s.name || s.nom || s.email || 'Vendeur'}</div>
                <div className="text-sm text-gray-500">{s.ville || s.city || ''}</div>
              </div>
              <div>
                <Link to={`/vendeur/${s.id || s._id}`} className="text-emerald-600 font-medium">Voir</Link>
              </div>
            </div>
            {s.description && <div className="mt-3 text-sm text-gray-600 line-clamp-3">{s.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}


