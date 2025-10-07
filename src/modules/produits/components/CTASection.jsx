import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Award, Users } from '../../../components/Icons';

function DevenirVendeurButton() {
  const navigate = useNavigate();
  const handleClick = async (e) => {
    e.preventDefault();
    try {
      // POST click to backend to increment counter (best-effort)
      const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      fetch(`${BASE}/api/vendor-click`, { method: 'POST' }).catch(() => {});
    } finally {
      // redirect to inscription page with role=vendeur
      navigate('/inscription?role=vendeur');
    }
  };

  return (
    <button onClick={handleClick} className="group inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 gap-3 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1">
      <Award className="w-6 h-6" />
      <div className="text-left">
        <div>Devenir vendeur</div>
        <div className="text-sm text-emerald-200">Commission 0% le 1er mois</div>
      </div>
      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}

export default function CTASection() {
  const [stats, setStats] = React.useState({ 
    savingsPercent: null, 
    activeUsers: null, 
    satisfactionPercent: null, 
    ordersPerDay: null 
  });
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
        const res = await fetch(`${BASE}/api/public-stats`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        
        // Use ONLY real data from backend - no fallbacks
        setStats({
          savingsPercent: json.savingsPercent || 0,
          activeUsers: json.activeUsers || 0,
          satisfactionPercent: json.satisfactionPercent || 0,
          ordersPerDay: json.ordersPerDay || 0,
        });
      } catch (e) {
        console.warn('Failed to fetch stats from backend:', e);
        if (!mounted) return;
        // Keep stats as null - no fallback mock data
        setStats({
          savingsPercent: null,
          activeUsers: null,
          satisfactionPercent: null,
          ordersPerDay: null,
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const display = {
    savings: stats.savingsPercent != null ? `${stats.savingsPercent}%` : (isLoading ? '...' : '0%'),
    users: stats.activeUsers != null ? `${stats.activeUsers.toLocaleString('fr-FR')}` : (isLoading ? '...' : '0'),
    satisfaction: stats.satisfactionPercent != null ? `${stats.satisfactionPercent}%` : (isLoading ? '...' : '0%'),
    orders: stats.ordersPerDay != null ? `${stats.ordersPerDay.toLocaleString('fr-FR')}` : (isLoading ? '...' : '0'),
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <ArrowRight className="w-4 h-4" />
              Rejoignez-nous maintenant
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Prêt à révolutionner
              <span className="block text-emerald-400">vos achats ?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Rejoignez plus de 10,000 utilisateurs qui économisent déjà avec WapiBei. Commencez dès aujourd'hui et découvrez une nouvelle façon d'acheter.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <DevenirVendeurButton />

              <Link to="/inscription" className="group inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white hover:text-gray-900 transition-all duration-300 gap-3 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1">
                <Users className="w-6 h-6" />
                <div className="text-left">
                  <div>Créer un compte</div>
                  <div className="text-sm opacity-80">Gratuit à vie</div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                  <div className="w-8 h-8 text-emerald-400 mb-3">📈</div>
                  <h3 className="font-bold mb-2">Économies moyennes</h3>
                  <p className="text-2xl font-bold text-emerald-400">{display.savings}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                  <div className="w-8 h-8 text-blue-400 mb-3">👥</div>
                  <h3 className="font-bold mb-2">Utilisateurs actifs</h3>
                  <p className="text-2xl font-bold text-blue-400">{display.users}</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                  <div className="w-8 h-8 text-purple-400 mb-3">📊</div>
                  <h3 className="font-bold mb-2">Satisfaction client</h3>
                  <p className="text-2xl font-bold text-purple-400">{display.satisfaction}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                  <div className="w-8 h-8 text-yellow-400 mb-3">⚡</div>
                  <h3 className="font-bold mb-2">Commandes/jour</h3>
                  <p className="text-2xl font-bold text-yellow-400">{display.orders}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


