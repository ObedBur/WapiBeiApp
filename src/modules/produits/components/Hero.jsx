import React from 'react';
import { Search, CheckCircle, ArrowRight, TrendingUp, Sparkles, Shield, Headphones, Star as Award } from '../../../components/Icons';

export default function Hero({ searchInput, setSearchInput, onSearch, setIsCompareOpen }) {
  return (
    <section className="relative pt-24">
      <div className="w-full bg-gradient-to-r from-green-600 to-emerald-500">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-28">
          <div className="relative rounded-2xl text-white p-8 lg:p-12 shadow-2xl overflow-hidden">
            <div className="mx-auto text-center max-w-3xl">
              <div className="inline-block bg-white/10 text-white/90 rounded-full px-4 py-1 mb-6">
                <span className="text-sm">🔥 Offres limitées jusqu'à -50%</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
                <span className="block">Comparez, publiez et</span>
                <span className="block text-yellow-300">économisez</span>
                <span className="block text-green-100 mt-2">partout en Afrique</span>
              </h1>
              <p className="mt-6 text-lg text-green-100/90">
                Découvrez les meilleurs produits alimentaires aux meilleurs prix. <span className="font-semibold text-yellow-200">Plus de 10,000 produits</span> disponibles avec <CheckCircle className="w-5 h-5 text-green-300" /> <span className="font-semibold text-yellow-200">livraison gratuite</span> dans toute l'Afrique.
              </p>

              <div className="mt-10 relative">
                <div className="mx-auto max-w-2xl">
                  <div className="relative bg-white rounded-full shadow-lg px-4 py-3 flex items-center">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                      aria-label="Rechercher des produits"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Rechercher un produit (ex: Riz, Huile, Tomates...)"
                      className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
                    />
                    <button
                      className="ml-4 bg-emerald-600 text-white px-5 py-2 rounded-full font-medium shadow-md"
                      onClick={onSearch}
                    >
                      Rechercher
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-6">
                <button onClick={() => setIsCompareOpen(true)} className="group border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white hover:text-emerald-600 transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg">Comparer les prix</div>
                    <div className="text-sm opacity-80">Économisez plus</div>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span className="text-sm">Livraison gratuite</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-300" />
                  <span className="text-sm">Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm">Qualité garantie</span>
                </div>
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-purple-300" />
                  <span className="text-sm">Support 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 