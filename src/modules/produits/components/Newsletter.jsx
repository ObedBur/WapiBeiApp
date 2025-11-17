import React from 'react';
import { Mail } from '../../../components/Icons';

export default function Newsletter() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const validateEmail = (e) => /\S+@\S+\.\S+/.test(e);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError('');
    setSuccess('');
    if (!validateEmail(email)) {
      setError("Adresse e-mail invalide");
      return;
    }
    setLoading(true);
    try {
      const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      const res = await fetch(`${BASE}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      let data = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = {};
      }
      if (!res.ok) throw new Error(data.message || 'Erreur serveur');
      setSuccess(data.message || "Merci ! Vous êtes abonné(e)");
      setEmail('');
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Mail className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-bold mb-6">Restez informé des meilleures offres</h2>
        <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">Recevez chaque semaine nos offres exclusives, nouveaux produits et conseils d'experts directement dans votre boîte mail.</p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex gap-4">
            <input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/20"
            />
            <button disabled={loading} className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-colors shadow-lg">
              {loading ? 'Envoi...' : "S'abonner"}
            </button>
          </div>
          <p className="text-sm text-emerald-200 mt-4">Pas de spam, désabonnement en un clic</p>
          {error && <div className="mt-3 text-sm text-red-200">{error}</div>}
          {success && <div className="mt-3 text-sm text-green-200">{success}</div>}
        </form>
      </div>
    </section>
  );
}


