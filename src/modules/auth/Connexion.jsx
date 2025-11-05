import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';

export default function Connexion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await authService.login(formData);
      // If user is admin/editor redirect to admin dashboard
      const role = response?.user?.role || response?.role || null;
      if (role === 'admin' || role === 'vendeur') {
        navigate('/admin');
      } else {
        // Redirection vers la page d'accueil après connexion réussie
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Connexion</h2>
      {error && (
        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Entrez votre email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Entrez votre mot de passe"
            minLength="8"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium disabled:opacity-50"
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      <div className="mt-6 text-center space-y-2">
        <Link 
          to="/mot-de-passe-oublie" 
          className="block text-primary hover:text-primary/80 text-sm"
        >
          Mot de passe oublié ?
        </Link>
        <Link 
          to="/inscription" 
          className="block text-gray-600 hover:text-gray-800 text-sm"
        >
          Pas encore de compte ? <span className="text-primary">S'inscrire</span>
        </Link>
      </div>
    </div>
  );
}


