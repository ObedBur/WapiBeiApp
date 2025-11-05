import React from 'react';
import { fetchWithAuth } from '../utils/api';
import authService from '../services/auth.service';

export default function AdminSubscribers() {
  const [subs, setSubs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
        const data = await fetchWithAuth(`${BASE}/api/subscribers`);
        if (!mounted) return;
        setSubs(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); }
      finally { mounted && setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const handleExport = () => {
    const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
    window.location.href = `${BASE}/api/subscribers/export`;
  };

  const handleClear = async () => {
    if (!confirm('Supprimer tous les abonnés ?')) return;
    const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
    await fetch(`${BASE}/api/subscribers`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${authService.getCurrentUser()?.token}` } });
    setSubs([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Abonnés newsletter</h2>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-4 py-2 bg-emerald-600 text-white rounded">Exporter CSV</button>
          <button onClick={handleClear} className="px-4 py-2 bg-red-50 text-red-600 rounded">Vider</button>
        </div>
      </div>
      {loading ? <div>Chargement...</div> : (
        <div className="bg-white rounded shadow p-4">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr><th>Email</th><th>Date</th></tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.email}><td className="py-2">{s.email}</td><td className="py-2 text-gray-500">{s.subscribedAt || ''}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


