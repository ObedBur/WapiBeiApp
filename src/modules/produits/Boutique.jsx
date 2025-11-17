import React, { useState } from 'react';
import { Star } from '../../components/Icons';
import { fetchWithAuth } from '../../utils/api';
import authService from '../../services/auth.service';
import { useNavigate } from 'react-router-dom';

// Inline icon fallbacks (small, focused)
const Store = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M3 9l1-4h16l1 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 9v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Edit = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M3 21v-3l11-11 3 3L6 21H3z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Save = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 21v-8H7v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const X = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const MapPin = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M12 11.5a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 21s6-4.5 6-9.5A6 6 0 0012 5a6 6 0 00-6 6C6 16.5 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Clock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
);
const Package = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M21 16V8a2 2 0 00-1-1.73L13 3a2 2 0 00-2 0L4 6.27A2 2 0 003 8v8a2 2 0 001 1.73L11 21a2 2 0 002 0l8-4.27A2 2 0 0021 16z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

export default function Boutique({ boutique, owner = false, onCreate, onEdit, onManage }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: boutique?.name || '',
    description: boutique?.description || '',
    address: boutique?.address || '',
    hours: boutique?.hours || '9h-18h',
    category: boutique?.category || 'Mode'
  });

  const [logoFile, setLogoFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [toast, setToast] = useState({ visible: false, type: 'info', message: '' });
  const navigate = useNavigate();

  const showToast = (message, type = 'info', ms = 3000) => {
    setToast({ visible: true, type, message });
    setTimeout(() => setToast({ visible: false, type: 'info', message: '' }), ms);
  };

  const handleSave = async () => {
    // client-side validation
    if (!formData.name || !formData.name.trim()) return setSaveError('Le nom de la boutique est requis.');
    if (formData.name.length > 100) return setSaveError('Le nom doit contenir au maximum 100 caractères.');
    if (!formData.description || !formData.description.trim()) return setSaveError('La description est requise.');
    if (formData.description.length > 2000) return setSaveError('La description est trop longue (max 2000 caractères).');
    // logo validation
    if (logoFile) {
      const maxBytes = 2 * 1024 * 1024; // 2MB
      if (!logoFile.type.startsWith('image/')) return setSaveError('Le logo doit être une image.');
      if (logoFile.size > maxBytes) return setSaveError('Le logo est trop volumineux (max 2MB).');
    }
    setSaveError(null);
    setIsSaving(true);
    setSaveSuccess(null);

    // attempt to call backend if we have seller id and auth
    const current = authService.getCurrentUser && authService.getCurrentUser();
    const sellerId = current?.id || current?.user?.id || null;

    try {
      if (!sellerId) {
        // no authenticated user: fallback to local callback
        const newBoutique = { id: boutique?.id || Date.now(), ...formData };
        onCreate?.(newBoutique);
        setSaveSuccess('Boutique sauvegardée localement. Connectez-vous pour la sauvegarder sur le serveur.');
        showToast('Boutique sauvegardée localement', 'info');
        setIsEditing(false);
        return;
      }

      const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      const url = `${BASE.replace(/\/$/, '')}/api/sellers/${sellerId}/boutique`;
      const form = new FormData();
      form.append('name', formData.name || '');
      form.append('shortDescription', formData.description || '');
      form.append('location', formData.address || '');
      if (logoFile) form.append('logo', logoFile);

      // choose POST (create) or PUT (update)
      const method = boutique ? 'PUT' : 'POST';
      const res = await fetchWithAuth(url, { method, body: form });
      // fetchWithAuth -> fetchJson returns parsed json or throws
      // if successful, call parent callbacks
      const body = res;
      const created = body && body.boutique ? body.boutique : { name: formData.name, shortDescription: formData.description, location: formData.address };
      if (boutique) onEdit?.(created); else onCreate?.(created);
      const msg = boutique ? 'Boutique mise à jour' : 'Boutique créée';
      setSaveSuccess(msg);
      showToast(msg, 'success');
      setIsEditing(false);
      // redirect to products page after short delay
      setTimeout(() => {
        try { navigate('/produits'); } catch (e) { try { window.location.reload(); } catch (err) {} }
      }, 900);
    } catch (e) {
      console.error('Failed saving boutique', e);
      setSaveError(e.message || 'Erreur lors de la sauvegarde');
      showToast(e.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: boutique?.name || '',
      description: boutique?.description || '',
      address: boutique?.address || '',
      hours: boutique?.hours || '9h-18h',
      category: boutique?.category || 'Mode'
    });
    setIsEditing(false);
  };

  if (!boutique && !owner) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Store className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune boutique</h3>
        <p className="text-gray-600">Ce vendeur n'a pas encore créé sa boutique.</p>
      </div>
    );
  }

  if (!boutique && owner) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Store className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Créer votre boutique</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Créez votre boutique pour commencer à vendre vos produits et attirer des clients.
        </p>
        
        <div className="max-w-md mx-auto space-y-4">
          <input
            type="text"
            placeholder="Nom de votre boutique"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            placeholder="Description de votre boutique"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
            <div className="text-sm text-gray-500">Logo (optionnel)</div>
          </div>
          <button 
            onClick={handleSave}
            disabled={!formData.name.trim() || isSaving}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Sauvegarde...' : 'Créer ma boutique'}
          </button>
          {saveError && <div className="text-sm text-red-600">{saveError}</div>}
          {saveSuccess && <div className="text-sm text-green-600">{saveSuccess}</div>}
          {toast.visible && (
            <div className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}>
              {toast.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Boutique Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-300 focus:border-blue-500 outline-none"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">{boutique.name}</h1>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>4.8 (127 avis)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>45 produits</span>
                </div>
              </div>
            </div>
          </div>
          
          {owner && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            ) : (
              <p className="text-gray-600 leading-relaxed">
                {boutique.description || "Aucune description disponible."}
              </p>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Informations</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Adresse"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <span>{boutique.address || "Adresse non renseignée"}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.hours}
                      onChange={(e) => setFormData({...formData, hours: e.target.value})}
                      placeholder="Horaires"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <span>{boutique.hours || "Horaires non renseignés"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {owner && !isEditing && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button 
              onClick={onManage}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Gérer mes produits
            </button>
          </div>
        )}
      </div>
    </div>
  );
}