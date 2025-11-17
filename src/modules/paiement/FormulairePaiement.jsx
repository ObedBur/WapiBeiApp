import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Phone, Loader, ChevronDown } from 'lucide-react';

const FormulairePaiement = ({ plan, onSuccess, onRetour }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'mobileMoney'
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState(''); // 'Airtel', 'Orange', 'MPesa'
  
  const [formData, setFormData] = useState({
    // Card fields
    nom: '',
    numeroCarte: '',
    expiration: '',
    cvc: '',
    // Mobile Money fields
    telephone: ''
  });

  const mobileMoneyProviders = [
    { id: 'Orange', name: 'Orange Money' },
    { id: 'Airtel', name: 'Airtel Money' },
    { id: 'MPesa', name: 'M-Pesa' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMobileMoneySelect = (providerId) => {
      setMobileMoneyProvider(providerId);
      // Reset phone number when changing provider for safety
      setFormData(prev => ({ ...prev, telephone: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simple validation logic
    let isValid = false;
    if (paymentMethod === 'card') {
        // Validation simple pour la carte
        isValid = formData.nom && formData.numeroCarte.length > 15 && formData.expiration && formData.cvc;
    } else if (paymentMethod === 'mobileMoney') {
        // Validation simple pour Mobile Money
        isValid = mobileMoneyProvider && formData.telephone.length >= 8;
    }

    // Simulation d'un appel API de SerdiPay
    setTimeout(() => {
      setIsLoading(false);
      
      if (isValid) {
        onSuccess({ 
            details: `Paiement SerdiPay réussi via ${paymentMethod === 'card' ? 'Carte' : mobileMoneyProvider}`, 
            planId: plan.id 
        });
      } else {
        console.error("Erreur de paiement simulée : informations manquantes ou invalides.");
        const errorContainer = document.getElementById('payment-error');
        if (errorContainer) {
            let alertMessage = "Erreur: Veuillez vérifier toutes les informations requises. (Simulation SerdiPay)";
            errorContainer.textContent = alertMessage;
            errorContainer.classList.remove('hidden');
            setTimeout(() => errorContainer.classList.add('hidden'), 3000);
        }
      }
    }, 1500);
  };

  // --- Rendu des champs de la carte ---
  const renderCardFields = () => (
    <div className="space-y-6">
      
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
    </div>
  );

  // --- Rendu des champs Mobile Money ---
  const renderMobileMoneyFields = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-800">Sélectionnez votre fournisseur</h4>
      
      {/* Sélecteur de fournisseur */}
      <div className="grid grid-cols-3 gap-3">
        {mobileMoneyProviders.map(provider => (
          <button
            key={provider.id}
            type="button"
            onClick={() => handleMobileMoneySelect(provider.id)}
            className={`flex items-center justify-center p-3 rounded-xl border-2 font-medium transition-all duration-200 ${
              mobileMoneyProvider === provider.id
                ? 'border-purple-600 bg-purple-50 text-purple-800 shadow-lg'
                : 'border-gray-300 bg-white text-gray-700 hover:border-purple-400'
            }`}
            disabled={isLoading}
          >
            {provider.name}
          </button>
        ))}
      </div>

      {/* Instructions */}
      {!mobileMoneyProvider && (
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm border border-yellow-200">
            Veuillez sélectionner votre opérateur (Orange Money, Airtel Money ou M-Pesa) ci-dessus.
        </div>
      )}

      {/* Champ Téléphone */}
      {mobileMoneyProvider && (
        <div>
          <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone ({mobileMoneyProvider})</label>
          <div className="relative">
            <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="tel"
              name="telephone"
              id="telephone"
              required
              value={formData.telephone}
              onChange={handleChange}
              maxLength="15"
              placeholder="+243 00 000 000"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Un message de confirmation vous sera envoyé sur ce numéro.
          </p>
        </div>
      )}

    </div>
  );

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
            <h2 className="text-3xl font-bold text-gray-900">Paiement Sécurisé SerdiPay</h2>
            <p className="text-gray-600">Choisissez votre méthode de paiement (Mobile Money ou Carte).</p>
          </div>
        </div>

        {/* Récapitulatif du plan */}
        <div className="mb-8 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <h3 className="text-xl font-semibold text-purple-800">{plan.nom}</h3>
            <p className="text-sm text-purple-600">Facturation {plan.dureeFinale}</p>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-purple-200">
                <span className="font-medium text-lg text-gray-700">Total à payer :</span>
                <span className="text-2xl font-bold text-purple-900">${plan.prixTotalFacture}</span>
            </div>
        </div>
        
        {/* Conteneur d'erreur (remplace alert) */}
        <div id="payment-error" className="hidden p-3 mb-4 text-sm font-medium text-red-800 bg-red-100 rounded-lg text-center" role="alert">
            {/* Le contenu est mis à jour par JavaScript */}
        </div>

        {/* --- Sélecteur de méthode de paiement --- */}
        <div className="mb-8 p-1 bg-gray-100 rounded-xl flex shadow-inner">
            <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    paymentMethod === 'card' 
                        ? 'bg-white text-purple-700 shadow-md ring-1 ring-purple-300' 
                        : 'text-gray-600 hover:bg-gray-200'
                }`}
                disabled={isLoading}
            >
                <CreditCard className="w-5 h-5" /> Carte Bancaire
            </button>
            <button
                type="button"
                onClick={() => setPaymentMethod('mobileMoney')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    paymentMethod === 'mobileMoney' 
                        ? 'bg-white text-purple-700 shadow-md ring-1 ring-purple-300' 
                        : 'text-gray-600 hover:bg-gray-200'
                }`}
                disabled={isLoading}
            >
                <Phone className="w-5 h-5" /> Mobile Money
            </button>
        </div>
        {/* ------------------------------------- */}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {paymentMethod === 'card' ? renderCardFields() : renderMobileMoneyFields()}

          {/* Bouton de paiement */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl flex items-center justify-center gap-2"
            disabled={isLoading || (paymentMethod === 'mobileMoney' && !mobileMoneyProvider)}
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Traitement SerdiPay...
              </>
            ) : (
              `Payer $${plan.prixTotalFacture}`
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">Paiement sécurisé par SerdiPay (simulé).</p>
      </div>
    </div>
  );
};

export default FormulairePaiement;