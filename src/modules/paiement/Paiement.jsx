import React, { useState, useMemo } from 'react';
import { ArrowLeft, Check, Calendar, CreditCard, Loader, Smile } from 'lucide-react';

// --- Dépendances et Mocks pour l'environnement unique (SINGLE FILE MANDATE) ---

// Mock de useNavigate pour simuler la navigation en réinitialisant l'état
const mockUseNavigate = () => {
  return () => {
    // Dans un environnement réel, cela redirigerait. Ici, nous allons
    // simplement réinitialiser l'état du composant principal si nécessaire.
    console.log("Navigation simulée vers la page d'accueil.");
  };
};

// Facteur de réduction pour l'abonnement annuel
const REDUCTION_ANNUELLE = 0.05;

// --- Composant FormulairePaiement (Inclus) ---
const FormulairePaiement = ({ plan, onSuccess, onRetour }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    numeroCarte: '',
    expiration: '',
    cvc: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation d'un appel API de paiement
    setTimeout(() => {
      setIsLoading(false);
      // Logique de validation simple (juste pour l'exemple)
      if (formData.nom && formData.numeroCarte.length > 15) {
        onSuccess({ details: 'Paiement effectué', planId: plan.id });
      } else {
        console.error("Erreur de paiement simulée : informations manquantes.");
        // Remplacer l'alert() par une interface utilisateur de modal dans une vraie application
        const alertMessage = "Erreur: Veuillez vérifier les informations de paiement. (Simulation)";
        const errorContainer = document.getElementById('payment-error');
        if (errorContainer) {
            errorContainer.textContent = alertMessage;
            errorContainer.classList.remove('hidden');
            setTimeout(() => errorContainer.classList.add('hidden'), 3000);
        } else {
            console.warn(alertMessage);
        }
      }
    }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-100">
        
        {/* En-tête de l'étape */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onRetour} 
            className="p-3 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors shadow-md"
            disabled={isLoading}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Finalisez votre achat</h2>
            <p className="text-gray-600">Entrez vos informations de carte bancaire.</p>
          </div>
        </div>

        {/* Récapitulatif du plan */}
        <div className="mb-8 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <h3 className="text-xl font-semibold text-purple-800">{plan.nom}</h3>
            <p className="text-sm text-purple-600">Facturation {plan.dureeFinale}</p>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-purple-200">
                <span className="font-medium text-lg text-gray-700">Total à payer aujourd'hui :</span>
                <span className="text-2xl font-bold text-purple-900">${plan.prixTotalFacture}</span>
            </div>
        </div>
        
        {/* Conteneur d'erreur (remplace alert) */}
        <div id="payment-error" className="hidden p-3 mb-4 text-sm font-medium text-red-800 bg-red-100 rounded-lg text-center" role="alert">
            {/* Le contenu est mis à jour par JavaScript */}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Nom sur la carte */}
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">Nom sur la carte</label>
            <input
              type="text"
              name="nom"
              id="nom"
              required
              value={formData.nom}
              onChange={handleChange}
              placeholder="Jean Dupont"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
              disabled={isLoading}
            />
          </div>

          {/* Numéro de carte */}
          <div>
            <label htmlFor="numeroCarte" className="block text-sm font-medium text-gray-700 mb-1">Numéro de carte</label>
            <div className="relative">
              <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                name="numeroCarte"
                id="numeroCarte"
                required
                value={formData.numeroCarte}
                onChange={handleChange}
                maxLength="16"
                placeholder="0000 0000 0000 0000"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Exp. et CVC */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration (MM/AA)</label>
              <input
                type="text"
                name="expiration"
                id="expiration"
                required
                value={formData.expiration}
                onChange={handleChange}
                maxLength="5"
                placeholder="12/25"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                disabled={isLoading}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
              <input
                type="text"
                name="cvc"
                id="cvc"
                required
                value={formData.cvc}
                onChange={handleChange}
                maxLength="3"
                placeholder="123"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Bouton de paiement */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Traitement...
              </>
            ) : (
              `Payer $${plan.prixTotalFacture}`
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">Paiement sécurisé par Stripe (simulé).</p>
      </div>
    </div>
  );
};

// --- Composant ConfirmationPaiement (Inclus) ---
const ConfirmationPaiement = ({ plan, onRetourAccueil }) => {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border-4 border-green-400">
        
        {/* Icône de succès */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-green-100 rounded-full">
            <Smile className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Paiement Réussi!</h2>
        <p className="text-xl text-gray-600 mb-8">Félicitations, votre abonnement est actif.</p>

        {/* Détails de l'abonnement */}
        <div className="p-4 bg-gray-50 rounded-xl mb-8 border border-gray-200">
            <p className="text-lg font-semibold text-gray-800 mb-1">{plan.nom} ({plan.dureeFinale})</p>
            <p className="text-4xl font-extrabold text-green-600 mb-2">${plan.prixTotalFacture}</p>
            <p className="text-sm text-gray-500">Facturé aujourd'hui. Prochain renouvellement automatique.</p>
        </div>

        {/* Bouton de retour */}
        <button
          onClick={onRetourAccueil}
          className="w-full py-3 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
        >
          Accéder à mon tableau de bord
        </button>
      </div>
    </div>
  );
};

// --- Composant Principal Paiement (Renommé App) ---
export default function App() {
  // L'utilisation de mockUseNavigate() est pour se conformer à la règle du fichier unique
  const navigate = mockUseNavigate(); 
  
  const [etape, setEtape] = useState('plan'); // 'plan', 'formulaire', 'confirmation'
  const [planSelectionne, setPlanSelectionne] = useState(null);
  const [dureeSelectionnee, setDureeSelectionnee] = useState('mensuel'); // 'mensuel' ou 'annuel'

  // Définition du plan UNIQUE avec le prix MENSUEL de base
  const plansBase = useMemo(() => ([
    {
      id: 'pro',
      nom: 'Plan Pro',
      PRIX_MENSUEL: 5, // Prix unique de base en $
      description: 'Lancez votre boutique WapiBei avec toutes les fonctionnalités pro.',
      caracteristiques: [
        'Produits illimités',
        'Support prioritaire (chat)',
        'Analytics avancées',
        'Promotions et coupons',
        'Durée: 30 jours'
      ],
      populaire: true
    }
  ]), []); // Maintenant contient un seul plan

  // --- Calcul des Prix (Mensuel et Annuel) ---
  const plans = useMemo(() => {
    return plansBase.map(plan => {
      const prixMensuelBase = plan.PRIX_MENSUEL;
      
      // Calcul du prix annuel
      const prixAnnuelBase = 12 * prixMensuelBase;
      const prixAnnuelApresReduc = prixAnnuelBase * (1 - REDUCTION_ANNUELLE);
      
      // Prix Annuel Moyen Mensuel (pour affichage)
      const prixMensuelAnnuel = prixAnnuelApresReduc / 12;

      return {
        ...plan,
        // Données mensuelles
        prixMensuel: prixMensuelBase.toFixed(2),
        prixTotalFactureMensuel: prixMensuelBase.toFixed(2), // Facturé 1 mois
        // Données annuelles
        prixAnnuel: prixAnnuelApresReduc.toFixed(2), // Prix total facturé 1 an
        prixMensuelAnnuel: prixMensuelAnnuel.toFixed(2), // Prix par mois avec engagement annuel
        reductionPourcentage: (REDUCTION_ANNUELLE * 100).toFixed(0)
      };
    });
  }, [plansBase]);

  // Trouve le plan unique pour l'affichage
  const planCourant = plans[0];

  // Détermine les prix et labels à afficher selon la durée sélectionnée
  const getPrixAffiche = (plan) => {
    if (dureeSelectionnee === 'annuel') {
      return {
        prix: plan.prixMensuelAnnuel,
        dureeLabel: '/ mois (Facturation Annuelle)',
        totalFacture: plan.prixAnnuel,
        duree: 'Annuel'
      };
    }
    return {
      prix: plan.prixMensuel,
      dureeLabel: '/ mois',
      totalFacture: plan.prixTotalFactureMensuel,
      duree: 'Mensuel'
    };
  };

  const handlePlanSelection = (plan) => {
    const prixInfo = getPrixAffiche(plan);
    
    // On passe toutes les informations nécessaires au FormulairePaiement
    setPlanSelectionne({ 
        ...plan, 
        prixAffiche: prixInfo.prix, 
        dureeAffichage: prixInfo.dureeLabel,
        prixTotalFacture: prixInfo.totalFacture,
        dureeFinale: prixInfo.duree
    });
    setEtape('formulaire');
  };

  const handlePaiementSuccess = (donnees) => {
    setEtape('confirmation');
  };

  const handleRetourAccueil = () => {
    // Simule le retour à l'accueil en réinitialisant l'état
    navigate('/');
    setEtape('plan');
    setPlanSelectionne(null);
    setDureeSelectionnee('mensuel');
  };

  const handleRetourPlans = () => {
    setPlanSelectionne(null);
    setEtape('plan');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 font-sans">
      
      {/* Header avec bouton retour */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={etape === 'plan' ? handleRetourAccueil : handleRetourPlans}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-700 transition-colors font-medium p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
            {etape === 'plan' ? 'Retour Accueil' : 'Retour aux plans'}
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900">
            WapiBei <span className="text-purple-600">Paiement</span>
          </h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Contenu principal */}
      <main className="pb-16">
        {/* ÉTAPE 1: Sélection du plan */}
        {etape === 'plan' && (
          <div className="py-16 px-4">
            <div className="max-w-xl mx-auto">
              {/* Titre section */}
              <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                  Choisissez votre plan
                </h2>
                <p className="text-xl text-gray-600">
                  Lancez votre boutique et vendez vos produits facilement.
                </p>
                
                {/* --- Sélecteur Mensuel/Annuel --- */}
                <div className="mt-10 flex justify-center relative">
                  <div className="p-1 bg-gray-200 rounded-full flex items-center relative shadow-inner">
                      
                      {/* Badge de réduction (Annuel) */}
                      <span className="absolute -top-7 right-0 left-0 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md transform -translate-y-1 animate-pulse opacity-90">
                          Économisez {planCourant.reductionPourcentage}% avec l'abonnement annuel !
                      </span>
                      
                      <button
                          onClick={() => setDureeSelectionnee('mensuel')}
                          className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 z-10 flex items-center gap-2 ${
                              dureeSelectionnee === 'mensuel'
                                  ? 'bg-white text-purple-700 shadow-xl ring-2 ring-purple-500/50'
                                  : 'text-gray-600 hover:text-purple-600'
                          }`}
                      >
                          <Calendar className="w-4 h-4" /> Mensuel
                      </button>
                      <button
                          onClick={() => setDureeSelectionnee('annuel')}
                          className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 z-10 flex items-center gap-2 ${
                              dureeSelectionnee === 'annuel'
                                  ? 'bg-white text-purple-700 shadow-xl ring-2 ring-purple-500/50'
                                  : 'text-gray-600 hover:text-purple-600'
                          }`}
                      >
                          <Calendar className="w-4 h-4" /> Annuel
                      </button>
                  </div>
                </div>
                {/* ---------------------------------- */}
              </div>

              {/* Plans Grid (Un seul plan affiché) */}
              <div className="grid grid-cols-1 max-w-lg mx-auto">
                {plans.map((plan) => {
                  const { prix, dureeLabel, totalFacture, duree } = getPrixAffiche(plan);
                  const isAnnuel = dureeSelectionnee === 'annuel';
                  
                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-3xl p-8 transition-all duration-300 transform ${
                        plan.populaire ? 'shadow-2xl ring-4 ring-purple-500/70 bg-white' : 'shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-gray-50'
                      } border-2 ${
                        isAnnuel && plan.populaire ? 'border-pink-500' : 'border-gray-200'
                      }`}
                    >
                      {/* Badge Populaire / Annuel */}
                      {plan.populaire && (
                        <div className="absolute top-0 right-0 m-4">
                          <span className={`bg-gradient-to-r ${isAnnuel ? 'from-pink-500 to-red-500' : 'from-purple-600 to-indigo-600'} text-white px-3 py-1 rounded-full text-xs font-bold shadow-md`}>
                            {isAnnuel ? `MEILLEURE OFFRE (${plan.reductionPourcentage}% OFF)` : 'POPULAIRE'}
                          </span>
                        </div>
                      )}

                      <div>
                        {/* Titre et description */}
                        <h3 className="text-3xl font-extrabold text-gray-900 mb-2">{plan.nom}</h3>
                        <p className="text-gray-600 mb-6 min-h-[40px]">{plan.description}</p>

                        {/* Prix */}
                        <div className="mb-8">
                          <div className="flex items-end">
                            <span className="text-6xl font-extrabold text-gray-900">${prix}</span>
                            <span className="text-gray-600 ml-2 mb-1">{dureeLabel}</span>
                          </div>
                          
                          {isAnnuel && (
                              <p className="text-sm text-gray-500 mt-1">Facturé ${totalFacture} pour 1 an.</p>
                          )}
                        </div>

                        {/* Caractéristiques */}
                        <ul className="space-y-3 mb-8">
                          {plan.caracteristiques.map((carac, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                              <span className="text-gray-700">{carac}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Bouton */}
                        <button
                          onClick={() => handlePlanSelection(plan)}
                          className={`w-full py-3 rounded-xl font-bold transition-all duration-300 shadow-lg 
                            ${plan.populaire 
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
                              : 'bg-white text-purple-600 border-2 border-purple-300 hover:bg-purple-50'
                            }`}
                        >
                          Choisir le plan {duree}
                        </button>
                      </div>
                    </div>
                  )})}
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2: Formulaire de paiement */}
        {etape === 'formulaire' && planSelectionne && (
          <FormulairePaiement 
            plan={planSelectionne}
            onSuccess={handlePaiementSuccess}
            onRetour={handleRetourPlans}
          />
        )}

        {/* ÉTAPE 3: Confirmation */}
        {etape === 'confirmation' && planSelectionne && (
          <ConfirmationPaiement 
            plan={planSelectionne}
            onRetourAccueil={handleRetourAccueil}
          />
        )}
      </main>
    </div>
  );}