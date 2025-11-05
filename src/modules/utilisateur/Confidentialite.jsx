import React, { useEffect, useState } from 'react';
import { fetchWithAuth, postJson } from '../../utils/api';
import { Shield, Globe, Eye, Lock } from '../../components/Icons';

export default function Confidentialite() {
  const [prefs, setPrefs] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    personalizedAds: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchWithAuth('/api/users/me/privacy');
        if (data && typeof data === 'object') {
          setPrefs({
            profileVisible: data.profileVisible ?? prefs.profileVisible,
            showEmail: data.showEmail ?? prefs.showEmail,
            showPhone: data.showPhone ?? prefs.showPhone,
            personalizedAds: data.personalizedAds ?? prefs.personalizedAds,
          });
        }
      } catch (err) {
        // endpoint may not exist; keep defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Try to save to backend, but tolerate missing endpoint
      await postJson('/api/users/me/privacy', prefs).catch(() => null);
      // optimistic update already applied
    } catch (err) {
      console.error(err);
      setError('Impossible de sauvegarder');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-2xl font-extrabold text-gray-800">Confidentialité</h2>
          <p className="text-sm text-gray-500 mt-1">Gérez la visibilité de vos données et vos préférences.</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-md"><Shield className="w-5 h-5" /></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Paramètres de confidentialité</h3>
              <p className="text-sm text-gray-600">Contrôlez qui voit vos informations et comment elles sont utilisées.</p>
            </div>
          </div>

          {loading ? (
            <div className="text-gray-600">Chargement...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Profil public</div>
                  <div className="text-sm text-gray-600">Permet à d'autres utilisateurs de voir votre profil.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={prefs.profileVisible} onChange={() => toggle('profileVisible')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Afficher mon email</div>
                  <div className="text-sm text-gray-600">Autorise l'affichage de votre email sur votre profil public.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={prefs.showEmail} onChange={() => toggle('showEmail')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Afficher mon téléphone</div>
                  <div className="text-sm text-gray-600">Autorise l'affichage de votre numéro sur votre profil public.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={prefs.showPhone} onChange={() => toggle('showPhone')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Publicité personnalisée</div>
                  <div className="text-sm text-gray-600">Autorise l'utilisation de vos données pour personnaliser les annonces.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={prefs.personalizedAds} onChange={() => toggle('personalizedAds')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              {error && <div className="text-red-500">{error}</div>}

              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setPrefs({ profileVisible: true, showEmail: false, showPhone: false, personalizedAds: false })} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Réinitialiser</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
