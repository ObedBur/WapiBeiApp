import React from 'react';
import { CheckCircle, ArrowRight, Download, Share2, TrendingUp, User, ShoppingBag } from 'lucide-react';

/**
 * Composant d'affichage de la confirmation de paiement.
 * * @param {object} props
 * @param {object} props.plan - Les détails du plan acheté (ex: { id: 'pro', nom: 'Plan Pro', prix: '49.99€/mois' })
 * @param {function} props.onRetourAccueil - Fonction de rappel pour la navigation vers le tableau de bord
 */
export default function ConfirmationPaiement({ plan, onRetourAccueil }) {
  // Utilitaire pour formater la date en français
  const formatDate = (date) => date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const dateFacturation = formatDate(new Date());
  // Ajout de 30 jours pour le renouvellement
  const dateRenouvellement = formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  
  // Génération d'un numéro de commande aléatoire pour la démo
  const orderNumber = `#WB-2024-${Math.random().toString(36).substring(7).toUpperCase()}`;

  // Fonction pour simuler le téléchargement de la facture (remplace alert)
  const handleDownloadInvoice = () => {
    console.log(`Tentative de téléchargement de la facture ${orderNumber} pour le plan ${plan.nom}`);
    // Ici, vous intégreriez la logique de téléchargement réelle (ex: appel API)
  };

  const NextStepItem = ({ icon: Icon, title, description, stepNumber }) => (
    <div className="flex items-start gap-4">
      {/* Indicateur d'étape (Timeline Style) */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold shadow-md">
          {stepNumber}
        </div>
        {/* Ligne de connexion entre les étapes */}
        {stepNumber < 3 && (
          <div className="w-px h-12 bg-purple-200 mt-1"></div>
        )}
      </div>
      
      {/* Contenu de l'étape */}
      <div className="pt-1 pb-4">
        <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 sm:p-8">
      {/* Conteneur principal avec style moderne */}
      <div className="max-w-3xl w-full mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-2xl shadow-green-100 mt-10">
        
        {/* En-tête et animation de succès */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            {/* Animation de succès améliorée */}
            <div className="relative w-28 h-28">
              {/* Vague externe */}
              <div className="absolute inset-0 rounded-full bg-green-200 animate-pulse opacity-50"></div>
              {/* Icône principale */}
              <div className="relative flex items-center justify-center w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full shadow-xl transform scale-100 transition duration-300 hover:scale-105">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2 leading-tight">
            Paiement confirmé !
          </h1>
          <p className="text-xl text-gray-500 mb-4">
            Merci pour votre confiance. Votre nouveau plan est actif.
          </p>
          <p className="text-md text-gray-700 font-medium bg-green-50 px-4 py-2 inline-block rounded-full">
            Plan <span className="font-bold text-green-700">{plan?.nom || 'Non Spécifié'}</span> activé
          </p>
        </div>

        {/* Disposition en grille pour les détails et les prochaines étapes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Détails de la facturation */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" /> Détails de votre abonnement
            </h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center border-b border-gray-100 py-2">
                <span className="text-gray-600">Montant total</span>
                <span className="text-xl font-extrabold text-green-700">{plan?.prix || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-gray-100 py-2">
                <span className="text-gray-600">Durée</span>
                <span className="text-gray-900 font-semibold">Mensuelle (30 jours)</span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-100 py-2">
                <span className="text-gray-600">Date de facturation</span>
                <span className="text-gray-900 font-semibold">{dateFacturation}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-600">Prochain renouvellement</span>
                <span className="text-gray-900 font-semibold">{dateRenouvellement}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">N° de commande:</span> {orderNumber}
              </p>
            </div>
          </div>

          {/* Prochaines étapes (Timeline Style) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-purple-600" /> Vos premiers pas
            </h2>
            
            <div className="space-y-4">
              <NextStepItem
                stepNumber={1}
                title="Accédez à votre tableau de bord"
                description={`Vous pouvez maintenant publier jusqu'à ${plan?.id === 'basic' ? '10' : plan?.id === 'pro' ? '100' : 'illimités'} produits.`}
              />
              <NextStepItem
                stepNumber={2}
                title="Complétez votre profil vendeur"
                description="Ajoutez une photo et une description professionnelle pour attirer plus d'acheteurs."
              />
              <NextStepItem
                stepNumber={3}
                title="Publiez vos premiers produits"
                description="Commencez à vendre et développez votre boutique WapiBei dès aujourd'hui."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={onRetourAccueil}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-200 transform hover:scale-[1.01] active:scale-100"
          >
            <ArrowRight className="w-5 h-5" />
            Aller au tableau de bord
          </button>

          <button
            onClick={handleDownloadInvoice}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-md transform hover:scale-[1.01] active:scale-100"
          >
            <Download className="w-5 h-5" />
            Télécharger la facture
          </button>
        </div>

        {/* Support Footer */}
        <div className="bg-gray-100 rounded-xl p-6 text-center shadow-inner">
          <h3 className="font-bold text-gray-900 mb-2">Besoin d'aide ou de support ?</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Notre équipe est disponible 24/7 pour toute question concernant votre nouveau plan.
          </p>
          <a 
            href="#" 
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center justify-center gap-1"
            onClick={(e) => e.preventDefault()} // Empêche la navigation réelle
          >
            Contacter le support en direct
            <Share2 className="w-4 h-4 ml-1" />
          </a>
        </div>

      </div>
    </div>
  );
}