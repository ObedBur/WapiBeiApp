import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../utils/api';
import authService from '../../services/auth.service';
import { Bell, CheckCircle, Info, X } from '../../components/Icons';

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/api/notifications');
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await fetchWithAuth(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications((n) => n.map((x) => (x.id === id ? { ...x, is_read: 1 } : x)));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await Promise.all(notifications.filter(n=>!n.is_read).map(n => fetchWithAuth(`/api/notifications/${n.id}/read`, { method: 'POST' })));
      setNotifications((n) => n.map(x => ({ ...x, is_read: 1 })));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-md"><Bell className="w-5 h-5" /></div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800">Notifications</h2>
              <p className="text-sm text-gray-500 mt-1">Gérez vos alertes et messages</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={loadNotifications} className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Rafraîchir</button>
            <button onClick={markAllRead} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Tout marquer lu</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {loading && <div className="text-gray-600">Chargement...</div>}
          {error && <div className="text-red-500">{error}</div>}

          {!loading && !notifications.length && (
            <div className="text-center py-10">
              <div className="mx-auto w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center">
                <Info className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune notification</h3>
              <p className="text-sm text-gray-600 mt-2">Vous n'avez reçu aucune notification pour le moment.</p>
            </div>
          )}

          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className={`p-4 rounded-xl flex items-start justify-between ${n.is_read ? 'bg-gray-50' : 'bg-emerald-50 border border-emerald-100'}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center border border-gray-200">🔔</div>
                    <div>
                      <div className="font-medium text-gray-900">{n.title}</div>
                      <div className="text-sm text-gray-600">{n.body}</div>
                      <div className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {!n.is_read && <button onClick={() => markRead(n.id)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg">Marquer lu</button>}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
