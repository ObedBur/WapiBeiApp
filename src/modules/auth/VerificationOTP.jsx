import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/auth.service';

export default function VerificationOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = new URLSearchParams(location.search).get('userId');
  const otpFromUrl = new URLSearchParams(location.search).get('otp');

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Retour au champ précédent lors de la suppression
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Veuillez entrer les 6 chiffres du code');
      return;
    }

    if (attempts >= maxAttempts) {
      setError('Nombre maximum de tentatives atteint. Veuillez demander un nouveau code.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyOTP(userId, otpValue);
      navigate('/connexion', { replace: true });
    } catch (err) {
      setAttempts(prev => prev + 1);
      setError('Code incorrect. Il vous reste ' + (maxAttempts - attempts - 1) + ' tentatives.');
      // Effacer le code entré
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      console.error('Erreur de vérification:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      // Simulation d'une requête API
      // TODO: Implémenter la fonction de renvoi d'OTP
      // await authService.resendOTP(userId);
      setTimeLeft(300); // Réinitialiser le timer
      setAttempts(0); // Réinitialiser les tentatives
      setOtp(['', '', '', '', '', '']); // Effacer les champs
      setError('');
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error('Erreur de renvoi:', err);
      setError('Erreur lors de l\'envoi du code. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(0);
    };
  }, []);

  // Si un OTP est fourni dans l'URL (pour tests), pré-remplir les inputs
  useEffect(() => {
    if (otpFromUrl && /^\d{6}$/.test(otpFromUrl)) {
      const provided = otpFromUrl.split('');
      setOtp(provided.concat(Array(6 - provided.length).fill('')));
      // Focus sur le dernier chiffre
      inputRefs.current[Math.min(provided.length - 1, 5)]?.focus();
    }
  }, [otpFromUrl]);

  // Vérifier si l'userId est présent
  if (!userId) {
    return (
      <div className="auth-container">
        <div className="error-message">
          Session expirée. Veuillez recommencer le processus d'inscription.
        </div>
        <button onClick={() => navigate('/inscription')} className="btn-primary">
          Retour à l'inscription
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Vérification de votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Veuillez entrer le code de vérification envoyé à votre adresse email
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="flex justify-center space-x-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : undefined}
                maxLength={1}
                autoFocus={index === 0}
                disabled={isLoading}
                className="w-12 h-12 text-center text-xl border-2 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                aria-label={`Chiffre ${index + 1} du code OTP`}
              />
            ))}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || attempts >= maxAttempts}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Vérification...
                </span>
              ) : (
                'Vérifier le code'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          {timeLeft > 0 ? (
            <div className="text-sm text-gray-600">
              Temps restant : 
              <span className="font-medium text-gray-900">
                {' '}{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          ) : (
            <button 
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Envoi en cours...' : 'Renvoyer le code'}
            </button>
          )}
        </div>

        <div className="mt-4 text-center">
          <button 
            onClick={() => navigate('/connexion')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}


