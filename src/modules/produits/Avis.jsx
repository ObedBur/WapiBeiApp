import React, { useEffect, useState, useRef } from 'react';
import { fetchJson } from '../../utils/api';

export default function Avis() {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const BASE = import.meta.env.VITE_API_BASE || '';
        const data = await fetchJson(`${BASE}/api/testimonials`);
        if (!mounted) return;
        setAvis(Array.isArray(data) ? data : (data.testimonials || data.data || []));
      } catch (e) {
        if (!mounted) return;
        setError(e.message || 'Impossible de charger les avis');
        setAvis([]);
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const count = avis.length;
  const avgRating = avis.reduce((s, a) => s + (Number(a.rating) || 0), 0) / (count || 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const form = new FormData(e.target);
    const payload = {
      name: (form.get('name') || '').trim(),
      location: (form.get('location') || '').trim(),
      rating: Number(form.get('rating') || 5),
      message: (form.get('message') || '').trim(),
      email: (form.get('email') || '').trim() || null,
    };
    if (!payload.name || !payload.message) {
      try { window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Veuillez renseigner votre nom et votre avis.' } })); } catch(e){}
      return;
    }
    setSubmitting(true);
    try {
      const BASE = import.meta.env.VITE_API_BASE || '';
      const res = await fetchJson(`${BASE}/api/testimonials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      // If backend returns created item, use it; otherwise build one
      const created = res && (res.testimonial || res.data || res) ? (res.testimonial || res.data || res) : { id: Date.now(), name: payload.name, location: payload.location, text: payload.message, rating: payload.rating, createdAt: new Date().toISOString() };
      setAvis((prev) => [created, ...prev]);
      try { window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: 'Merci — votre avis a été publié.' } })); } catch(e){}
      e.target.reset();
      nameRef.current && nameRef.current.focus();
    } catch (err) {
      console.error('Failed to submit testimonial', err);
      try { window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message: 'Erreur lors de l\'envoi. Veuillez réessayer.' } })); } catch(e){}
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900">Ce que disent nos utilisateurs</h1>
            <p className="text-gray-600 mt-2">Retours authentiques de notre communauté. Lisez, partagez et contribuez.</p>
          </div>

          <div className="flex items-center gap-6 mb-6">
            <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg font-semibold">{count} avis</div>
            <div className="flex items-center gap-2">
              <div className="text-yellow-500 font-semibold">{(avgRating||0).toFixed(1)}</div>
              <div className="text-sm text-gray-500">moyenne</div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white p-6 rounded-2xl h-40" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : avis.length === 0 ? (
            <div className="py-12 text-center text-gray-600 bg-white rounded-2xl p-8">Aucun avis pour le moment. Soyez le premier !</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {avis.map((a) => (
                <article key={a.id || a._id} className="bg-white p-6 rounded-2xl shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">{(a.name||'U').charAt(0).toUpperCase()}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{a.name || a.nom || 'Utilisateur'}</div>
                          <div className="text-sm text-gray-500">{a.location || a.ville || ''}</div>
                        </div>
                        <div className="text-sm text-yellow-500">{Array.from({ length: Math.min(5, Math.round(a.rating || 5)) }).map((_, i) => '★').join('')}</div>
                      </div>
                      <p className="mt-3 text-gray-700 leading-relaxed">{a.text || a.message || a.comment || ''}</p>
                      <div className="text-xs text-gray-400 mt-3">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="w-full max-w-md sticky top-28 self-start">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-lg font-semibold mb-3">Laisser un avis</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="name" ref={nameRef} placeholder="Votre nom" className="w-full px-4 py-2 border rounded-lg" />
              <input name="location" placeholder="Ville" className="w-full px-4 py-2 border rounded-lg" />
              <input name="email" placeholder="Email (optionnel)" className="w-full px-4 py-2 border rounded-lg" />
              <label className="text-sm text-gray-600">Note</label>
              <select name="rating" defaultValue="5" className="w-full px-4 py-2 border rounded-lg">
                <option value="5">5 — Excellent</option>
                <option value="4">4 — Très bien</option>
                <option value="3">3 — Bien</option>
                <option value="2">2 — Moyen</option>
                <option value="1">1 — Mauvais</option>
              </select>
              <textarea name="message" placeholder="Votre avis" rows={4} className="w-full px-4 py-2 border rounded-lg" />
              <div className="flex justify-end">
                <button type="submit" disabled={submitting} className={`px-6 py-2 rounded-lg font-semibold ${submitting ? 'bg-gray-300 text-gray-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                  {submitting ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}


