import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DollarSign, Lock, Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import authService from '../../services/auth.service';

export default function Connexion() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(formData);
      const role = response?.user?.role || response?.role || null;

      if (role === 'admin' || role === 'vendeur') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Erreur lors de la connexion. Veuillez réessayer.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT SIDE – Always visible for a professional layout */}
        <div className="hidden md:flex relative bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-10 flex flex-col justify-center space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold">Bienvenue sur WapiBei</h2>
            <p className="text-emerald-100 mt-3 text-sm leading-relaxed">
              La plateforme moderne qui compare les prix des produits alimentaires partout en Afrique.
              Trouvez les meilleurs deals, économisez plus et achetez en toute sécurité.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 flex-shrink-0">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Comparez & économisez</h4>
                <p className="text-sm text-emerald-100">Accédez aux prix en temps réel et économisez jusqu'à 40%.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 flex-shrink-0">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Sécurité garantie</h4>
                <p className="text-sm text-emerald-100">Vos données et transactions sont protégées.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Rapide & intuitif</h4>
                <p className="text-sm text-emerald-100">Une expérience simple, fluide et optimisée.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE – Form */}
        <div className="p-10 bg-white">
          <h1 className="text-3xl font-bold text-gray-900">Connexion</h1>
          <p className="text-gray-600 mt-2 mb-6">Accédez à votre compte en toute sécurité</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-800">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="exemple@email.com"
                className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-800">Mot de passe</label>
                <Link to="/mot-de-passe-oublie" className="text-sm text-emerald-600 font-medium">
                  Oublié ?
                </Link>
              </div>

              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength="8"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-emerald-600 transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Pas encore de compte ?
            <Link to="/inscription" className="ml-1 text-emerald-600 font-semibold hover:underline">
              Créez-en un
            </Link>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Vous êtes vendeur ?
            <Link to="/inscription?role=vendeur" className="ml-1 text-orange-600 font-semibold hover:underline">
              Devenir vendeur
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
