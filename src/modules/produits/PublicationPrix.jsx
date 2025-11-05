import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Award, Star, Check } from 'lucide-react';

// Assurez-vous que ces imports sont corrects pour votre projet
// fetchWithAuth et authService ne sont plus nécessaires car le formulaire est supprimé
// import { fetchWithAuth } from '../../utils/api'; 
// import authService from '../../services/auth.service';

// --- Définition des Plans (Améliorée avec un plan Standard) ---
const ALL_PLANS = [
  {
    id: 'standard',
    name: 'Standard',
    tag: 'Gratuit pour débuter',
    priceLabel: '0.00 $',
    priceValue: 0.00,
    icon: <Star className="w-6 h-6 text-green-500" />,
    features: [
      '<strong>Publication Standard</strong> — Votre produit apparaît dans les résultats de recherche classiques.',
      '<strong>Statistiques de base</strong> — Vues totales des 7 derniers jours.',
      '<strong>1 seule image</strong> par produit.',
      'Support par email (réponse sous 72h).'
    ],
    cta: 'Choisir le plan Standard',
  },
  {
    id: 'premium',
    name: 'Professionnel',
    tag: 'Recommandé !',
    priceLabel: '2.5 $',
    priceValue: 2.5,
    icon: <Award className="w-6 h-6 text-yellow-500" />,
    features: [
      '<strong>Mise en avant Premium</strong> — Votre produit est affiché en tête des résultats et dans les zones de mise en avant pour augmenter la visibilité.',
      '<strong>Statistiques détaillées</strong> — Accédez aux vues, clics et taux de conversion sur 30 jours pour optimiser vos annonces.',
      '<strong>Jusqu\'à 5 images</strong> par produit.',
      '<strong>Support prioritaire</strong> — Assistance dédiée avec réponse sous 24h pour les vendeurs Pro.'
    ],
    cta: 'Choisir le plan Pro',
  },
];

const FeatureIcon = ({ isPro }) => (
  <Check className={`h-5 w-5 ${isPro ? 'text-indigo-500' : 'text-green-500'} mr-2 flex-shrink-0`} />
);


export default function PublicationPrix() {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialisation du plan sélectionné
  const initialPlan = ALL_PLANS.find(p => p.id === 'premium') || ALL_PLANS[0]; 

  // --- États du composant ---
  // On ne gère plus les états du formulaire
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [isAnnual, setIsAnnual] = useState(false);
  
  // L'état 'message' peut être conservé si vous voulez afficher un feedback ici.
  const [message, setMessage] = useState(null); 


  // --- Gestionnaires d'événements ---

  // MODIFIÉ : Cette fonction navigue maintenant vers la page de publication
  const handleChoosePlan = (plan) => {
    // Si l'utilisateur clique sur le plan déjà sélectionné, on le laisse cliquer
    if (selectedPlan.id === plan.id) {
        // Rediriger immédiatement vers la page de publication avec le plan en paramètre
        navigate(`/publication?plan=${plan.id}`);
    } else {
        // Sélectionner le nouveau plan et l'utilisateur devra cliquer à nouveau
        setSelectedPlan(plan);
        setMessage({ type: 'info', text: `Vous avez sélectionné le plan ${plan.name}. Cliquez sur le bouton "Choisir le plan" pour continuer.` });
    }
  };

  // Pre-select plan from query param (simplification de l'effet)
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const planParam = params.get('plan');
      if (planParam) {
        const found = ALL_PLANS.find(p => p.id === planParam.toLowerCase() || p.name.toLowerCase().includes(planParam.toLowerCase()));
        if (found) setSelectedPlan(found);
      }
    } catch (e) { /* ignore */ }
  }, [location.search]);

  // Les fonctions handleSubmit, handleImageChange, etc. sont supprimées

  // Détermination du prix affiché basé sur le toggle annuel
  const getDisplayPrice = (plan) => {
    const basePrice = plan.priceValue;

    if (basePrice === 0) {
      return 'GRATUIT';
    }

    const finalPrice = isAnnual ? (basePrice * 10) : basePrice; 
    const period = isAnnual ? '/an' : '/pub.';
    return `${finalPrice.toFixed(2)} $ ${period}`;
  };

  const showAnnualToggle = selectedPlan.priceValue > 0;
  
  // --- Rendu JSX ---

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
      {/* SECTION 1: Titre et Introduction */}
      <div className="text-center mb-16">
        <span className="inline-block px-3 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full mb-3 uppercase tracking-wider">
          Augmentez votre Impact 📈
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
          Choisissez la Formule qui Démultiplie vos Ventes 
        </h1>
        <p className="text-lg text-gray-600 mt-5 max-w-3xl mx-auto">
          Découvrez nos options de publication : que vous débutiez ou cherchiez la visibilité maximale, nous avons le plan parfait.
        </p>
      </div>
      
      {/* Toggle Mensuel/Annuel (Affiché uniquement pour les plans payants) */}
      {showAnnualToggle && (
        <div className="flex justify-center mb-12 ">
          <div className="flex items-center space-x-4 bg-gray-100 p-1 rounded-full shadow-inner">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full font-semibold transition-colors ${
                !isAnnual ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Paiement par Publication
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full font-semibold transition-colors relative ${
                isAnnual ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Abonnement Annuel
              <span className="absolute -top-3 right-0 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full rotate-3">
                  -16%
              </span>
            </button>
          </div>
        </div>
      )}


      {/* SECTION 2: Cartes de Plans Améliorées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 mb-20 justify-items-center max-w-6xl mx-auto ">
        {ALL_PLANS.map((p) => {
            const isActive = selectedPlan.id === p.id;
            return (
                <div
                    key={p.id}
                    className={`w-full max-w-md 
                        border rounded-3xl p-8 sm:p-10 transition duration-300 ease-in-out cursor-pointer h-full flex flex-col justify-between
                        ${isActive
                            ? 'border-indigo-600 bg-white shadow-2xl ring-4 ring-indigo-200 scale-105'
                            : 'border-gray-200 bg-gray-50 shadow-lg hover:shadow-xl hover:scale-[1.02]' 
                        }
                    `}
                    onClick={() => setSelectedPlan(p)} // Changer la sélection au clic sur la carte
                >
                    <div>
                        <div className="flex items-center mb-5 ">
                            {p.icon}
                            <h3 className="text-2xl font-bold text-gray-900 ml-3">{p.name}</h3>
                        </div>
                        
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 ${p.id === 'premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {p.tag}
                        </span>

                        <div className="my-6">
                            <p className="text-4xl text-indigo-700 font-extrabold leading-none">
                                {getDisplayPrice(p)}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                {p.priceValue > 0 ? (isAnnual ? 'Facturé annuellement' : 'Par produit publié') : 'Toujours gratuit'}
                            </p>
                        </div>

                        <ul className="mt-8 space-y-4 text-gray-700">
                            {p.features.map((f, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <FeatureIcon isPro={p.id === 'premium'} />
                                <div className="text-sm text-gray-800 leading-snug" dangerouslySetInnerHTML={{ __html: f }} />
                            </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        // Le bouton déclenche maintenant la navigation
                        onClick={(e) => { e.stopPropagation(); handleChoosePlan(p); }}
                        className={`mt-8 w-full py-3 rounded-xl text-base font-semibold shadow-lg transition duration-300
                            ${isActive
                                ? 'bg-indigo-600 text-white shadow-indigo-500/50 hover:bg-indigo-700'
                                : 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50'
                            }
                        `}
                    >
                        {isActive ? `Continuer avec ${p.name}` : p.cta}
                    </button>
                </div>
            );
        })}
      </div>
    </div>
  );
}