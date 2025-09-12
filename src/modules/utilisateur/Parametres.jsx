import React, { useState } from 'react';
import { User, Mail, Lock, Bell, Eye, Globe, LogOut } from '../../components/Icons';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';

// Inline fallbacks for icons not present in Icons.jsx
const Save = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 21v-8H7v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Camera = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><rect x="3" y="7" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 7l1-2h6l1 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
);
const MapPin = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M12 11.5a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 21s6-4.5 6-9.5A6 6 0 0012 5a6 6 0 00-6 6C6 16.5 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Phone = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M22 16.92V21a1 1 0 01-1.11 1 19 19 0 01-8.63-3.07 19 19 0 01-6-6A19 19 0 013 3.11 1 1 0 014 2h4.09a1 1 0 011 .75c.12.66.33 1.3.61 1.9a1 1 0 01-.24 1.05L8.91 8.91" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Shield = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M12 2l7 3v6c0 5-4 9-7 11-3-2-7-6-7-11V5l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

export default function Parametres() {
  const [activeSection, setActiveSection] = useState('profile');
  const [formData, setFormData] = useState({
    name: 'Sophie Martin',
    email: 'sophie.martin@example.com',
    phone: '+33 6 12 34 56 78',
    location: 'Paris, France',
    website: 'https://atelier-sophie.fr',
    bio: "Passionnée de mode et d'accessoires artisanaux, je crée des pièces uniques depuis plus de 5 ans.",
    notifications: {
      email: true,
      push: true,
      marketing: false
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showPhone: false
    }
  });

  const sections = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Shield }
  ];

  const handleSave = () => {
    console.log('Saving settings:', formData);
    // API call would go here
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
            <img
              src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Photo de profil</h3>
          <p className="text-gray-600">Cliquez sur l'icône pour changer votre photo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({...formData, website: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Biographie</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-yellow-800 mb-2">
          <Shield className="w-5 h-5" />
          <span className="font-medium">Sécurité du compte</span>
        </div>
        <p className="text-yellow-700 text-sm">
          Protégez votre compte en utilisant un mot de passe fort et en activant l'authentification à deux facteurs.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
          <input
            type="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
          <input
            type="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
          <input
            type="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Authentification à deux facteurs</h4>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <div className="font-medium text-gray-900">2FA désactivée</div>
            <div className="text-sm text-gray-600">Ajoutez une couche de sécurité supplémentaire</div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Activer
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Préférences de notification</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-medium text-gray-900">Notifications par email</div>
              <div className="text-sm text-gray-600">Recevez des emails pour les commandes et messages</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications.email}
                onChange={(e) => setFormData({
                  ...formData,
                  notifications: {...formData.notifications, email: e.target.checked}
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-medium text-gray-900">Notifications push</div>
              <div className="text-sm text-gray-600">Recevez des notifications sur votre appareil</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications.push}
                onChange={(e) => setFormData({
                  ...formData,
                  notifications: {...formData.notifications, push: e.target.checked}
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-medium text-gray-900">Emails marketing</div>
              <div className="text-sm text-gray-600">Recevez des offres et actualités</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifications.marketing}
                onChange={(e) => setFormData({
                  ...formData,
                  notifications: {...formData.notifications, marketing: e.target.checked}
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de confidentialité</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-medium text-gray-900">Profil public</div>
              <div className="text-sm text-gray-600">Votre profil est visible par tous les utilisateurs</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.privacy.profileVisible}
                onChange={(e) => setFormData({
                  ...formData,
                  privacy: {...formData.privacy, profileVisible: e.target.checked}
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-medium text-gray-900">Afficher mon email</div>
              <div className="text-sm text-gray-600">Votre email est visible par tous les utilisateurs</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.privacy.showEmail}
                onChange={(e) => setFormData({
                  ...formData,
                  privacy: {...formData.privacy, showEmail: e.target.checked}
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-medium text-gray-900">Afficher mon téléphone</div>
              <div className="text-sm text-gray-600">Votre téléphone est visible par tous les utilisateurs</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.privacy.showPhone}
                onChange={(e) => setFormData({
                  ...formData,
                  privacy: {...formData.privacy, showPhone: e.target.checked}
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    // reload the page to reset app state immediately
    window.location.reload();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-2xl font-extrabold text-gray-800">Paramètres du compte</h2>
          <p className="text-sm text-gray-500 mt-1">Gérez vos préférences et paramètres de compte</p>
        </div>

        <div className="p-4 grid gap-3">
          {sections.map((section) => {
            const IconComp = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => { if (section.id === 'profile') { navigate('/profil'); } else if (section.id === 'security') { navigate('/securite'); } else if (section.id === 'notifications') { navigate('/notifications'); } else if (section.id === 'privacy') { navigate('/confidentialite'); } else { setActiveSection(section.id); } }}
                className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition ${
                  activeSection === section.id ? 'bg-gray-50' : ''
                }`}
              >
                <span className="p-2 bg-gray-100 rounded-md"><IconComp className="w-5 h-5" /></span>
                <div className="text-left">
                  <div className="font-medium text-gray-800">{section.label}</div>
                  <div className="text-sm text-gray-500">Configurez vos préférences</div>
                </div>
              </button>
            );
          })}

          <div className="mt-2 border-t pt-3">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition"><LogOut className="w-5 h-5" /> Se déconnecter</button>
          </div>
        </div>
      </div>
    </div>
  );
}


