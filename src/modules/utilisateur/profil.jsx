import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Save, X } from "lucide-react";
import authService from '../../services/auth.service';
import { fetchWithAuth } from '../../utils/api';
import { ProfilePhotoModal } from '../../components/ProductModal';

export default function Profil({ formData, setFormData }) {
  const current = authService.getCurrentUser ? authService.getCurrentUser() : null;
  const [serverUser, setServerUser] = useState(null);
  const user = formData || (current ? (current.user || current) : null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const BASE = import.meta.env.VITE_API_BASE || '';
        const url = `${BASE.replace(/\/$/, '')}/api/users/me`;
        const data = await fetchWithAuth(url);
        if (!mounted) return;
        if (data) setServerUser(data);
      } catch (e) {
        // ignore — fallback to local user data
        // console.warn('Could not fetch server user', e);
      }
    };
    if (current) load();
    return () => { mounted = false; };
  }, []);

  const pickAvatar = (u) => {
    return u?.avatar || u?.avatar_url || u?.profilePhoto || u?.profile_image || u?.photo || u?.photo_url || u?.image || '';
  };

  const resolveUrl = (src) => {
    if (!src) return '';
    if (/^https?:\/\//.test(src)) return src;
    const BASE = import.meta.env.VITE_API_BASE || '';
    const base = BASE.replace(/\/$/, '');
    return `${base}${src.startsWith('/') ? '' : '/'}${src}`;
  };

  const data = {
    photo: pickAvatar(serverUser) || pickAvatar(user),
    name: user?.name || user?.fullName || user?.fullname || user?.displayName || user?.username || (`${user?.nom || ''} ${user?.prenom || ''}`).trim() || '',
    email: user?.email || user?.user?.email || '',
    phone: user?.phone || user?.phone_number || user?.telephone || user?.contact || user?.mobile || '',
    location: user?.location || user?.ville || (user?.city ? `${user.city}${user?.country ? ', ' + user.country : ''}` : '') || '',
    website: user?.website || user?.site_web || user?.url || user?.website_url || user?.websiteUrl || '',
    bio: user?.bio || user?.description || user?.about || user?.profile_description || '',

  };

  // Local editable state derived from server/user data
  const [formState, setFormState] = useState({ ...data });

  useEffect(() => {
    // update local form when server/user data changes
    setFormState({ ...data });
  }, [data.name, data.email, data.phone, data.location, data.website, data.bio, data.avatar]);

  const handleChange = (key, value) => setFormState((s) => ({ ...s, [key]: value }));

  const handleCancel = () => setFormState({ ...data });

  const handleSave = async () => {
    try {
      const BASE = import.meta.env.VITE_API_BASE || '';
      const url = `${BASE.replace(/\/$/, '')}/api/users/me`;
      const res = await fetchWithAuth(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formState) });
      // update local server copy
      if (res) setServerUser(res);
      alert('Profil enregistré');
    } catch (e) {
      console.error('Save profile error', e);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  const onUploaded = (res) => {
    // res may be updated user object or { success, url }
    if (res && typeof res === 'object') {
      if (res.url || res.photo || res.avatar) {
        const photoUrl = res.url || res.photo || res.avatar;
        setServerUser((s) => ({ ...(s || {}), photo: photoUrl, avatar: photoUrl }));
        setFormState((s) => ({ ...s, avatar: photoUrl }));
      } else {
        // assume full user returned
        setServerUser(res);
        setFormState({ ...formState, name: res.name || formState.name, email: res.email || formState.email, bio: res.bio || formState.bio, website: res.website || formState.website });
      }
    }
  };

  const set = (partial) => {
    // update formState and also inform parent if provided
    setFormState((s) => ({ ...s, ...partial }));
    if (setFormData) setFormData({ ...(formData || user || {}), ...partial });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-8"
      >
        {/* Header */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden shadow-md">
              <img
                src={data.avatar}
                alt="Profile"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <button onClick={() => setPhotoModalOpen(true)} className="absolute bottom-2 right-2 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 shadow-md transition" aria-label="Changer la photo">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{formState.name || 'Profil'}</h3>
            <p className="text-gray-500">{formState.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Nom complet", key: "name", type: "text" },
            { label: "Email", key: "email", type: "email" },
            { label: "Téléphone", key: "phone", type: "tel" },
            { label: "Localisation", key: "location", type: "text" },
          ].map((field) => (
            <div key={field.key} className="relative">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                {field.label}
              </label>
              <input
                type={field.type}
                value={formState[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Site web
          </label>
          <input
            type="url"
            value={formState.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Biographie
          </label>
          <textarea
            value={formState.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:opacity-90 shadow-md transition"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
        </div>
      </motion.div>
      <ProfilePhotoModal isOpen={photoModalOpen} onClose={() => setPhotoModalOpen(false)} onUploaded={onUploaded} />
    </>
  );
}
