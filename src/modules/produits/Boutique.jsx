import React, { useState, useRef, useEffect } from 'react';
import authService from '../../services/auth.service';

export default function Boutique({ boutique = null, onCreate, onEdit, onManage, owner = false }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', logo: null, shortDescription: '', location: '' });
  const fileRef = useRef(null);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [loading, setLoading] = useState(false);
  const currentUser = authService.getCurrentUser ? authService.getCurrentUser() : null;
  const userId = currentUser?.id ?? currentUser?.user?.id ?? currentUser?.data?.id ?? currentUser?.userId ?? (typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}').id) : null) ?? null;
  const [showSavedLoader, setShowSavedLoader] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [createdBoutique, setCreatedBoutique] = useState(null);

  const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  const resolveImageUrl = (src) => {
    if (!src) return null;
    try {
      if (typeof src !== 'string') return src;
      if (src.startsWith('blob:')) return src;
      if (/^https?:\/\//i.test(src)) return src;
      if (src.startsWith('/uploads')) return `${BASE}${src}`;
      return src;
    } catch (e) {
      return src;
    }
  };

  const handleLogo = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    // store the File object for FormData upload and also generate preview
    setForm((s) => ({ ...s, logo: f, preview: URL.createObjectURL(f) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    const payload = {
      name: form.name || '',
      shortDescription: form.shortDescription || '',
      location: form.location || '',
      logo: form.preview || (typeof form.logo === 'string' ? form.logo : null)
    };
    setLoading(true);
    if (!userId) {
      setToastMessage('Vous devez être connecté pour créer une boutique.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
      setLoading(false);
      return;
    }
    let success = false;
    let successMsg = '';
    try {
      // Build FormData when file is present
      const fd = new FormData();
      fd.append('name', form.name || '');
      fd.append('shortDescription', form.shortDescription || '');
      fd.append('location', form.location || '');
      if (form.logo && form.logo instanceof File) {
        fd.append('logo', form.logo);
      } else if (form.logo && typeof form.logo === 'string') {
        // existing URL or base64 string fallback
        fd.append('logo', form.logo);
      }

      if (modalMode === 'create') {
        // POST
        const res = await fetch(`${BASE}/api/sellers/${userId}/boutique`, { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Erreur création boutique');
        const data = await res.json();
        onCreate && onCreate(data.boutique || payload);
        // show visual confirmation on HTTP 201
        const created = data.boutique || payload;
        // flag if logo is a blob preview so we can revoke it later
        if (created && typeof created.logo === 'string' && created.logo.startsWith('blob:')) created._isPreview = true;
        setCreatedBoutique(created);
        setShowConfirmation(true);
        success = true; successMsg = 'Boutique créée avec succès';
      } else {
        const res = await fetch(`${BASE}/api/sellers/${userId}/boutique`, { method: 'PUT', body: fd });
        if (!res.ok) throw new Error('Erreur mise à jour boutique');
        const data = await res.json();
        onEdit && onEdit(data.boutique || payload);
        success = true; successMsg = 'Boutique mise à jour';
      }
    } catch (err) {
      console.error(err);
      // fallback to local update
      if (modalMode === 'create') {
        const newBoutique = { id: Date.now(), ...payload };
        onCreate && onCreate(newBoutique);
      } else {
        const updated = { ...(boutique || {}), ...payload };
        onEdit && onEdit(updated);
      }
    } finally {
      setLoading(false);
    }

    // Close modal, show a short saved loader then a toast
    // (Do not revoke preview here to avoid blob-not-found when image still rendered)
    setForm({ name: '', logo: null, preview: null, shortDescription: '', location: '' });
    setShowModal(false);

    if (success) {
      setShowSavedLoader(true);
      setTimeout(() => {
        setShowSavedLoader(false);
        setToastMessage(successMsg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3500);
      }, 900);
    } else {
      setToastMessage('Erreur lors de la sauvegarde.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    }
    // keep createdBoutique modal visible even after closing form so user sees confirmation
    if (!success) {
      setCreatedBoutique(null);
      setShowConfirmation(false);
    }
  };

  if (!boutique) {
    return (
      <div className="text-center py-10">
        <h3 className="text-2xl font-extrabold mb-3">Vous n’avez pas encore créé de boutique.</h3>
        <p className="text-gray-500 mb-6">Créez votre boutique pour commencer à publier des produits et toucher des clients.</p>
        {owner ? (
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold shadow">+ Créer ma boutique</button>
        ) : (
          <div className="text-gray-500">Le vendeur n’a pas encore de boutique.</div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">
              <div className="relative bg-gradient-to-r from-emerald-600 to-teal-500 p-6">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">Créer ma boutique</h3>
                    <p className="mt-1 opacity-90">Renseignez les informations principales pour lancer votre boutique.</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-white text-2xl leading-none">×</button>
                </div>
                <div className="absolute -bottom-8 left-6">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
                    {(form.preview || (form.logo && typeof form.logo === 'string')) ? (
                      <img src={resolveImageUrl(form.preview || form.logo)} alt="logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-emerald-600 font-bold">B</span>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 pt-14 grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom de la boutique</label>
                    <input className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm p-3" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Boutique de Mamadou" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Localisation</label>
                    <input className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm p-3" value={form.location} onChange={(e)=>setForm(f=>({...f,location:e.target.value}))} placeholder="Ville, Pays" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description courte</label>
                    <textarea className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm p-3" value={form.shortDescription} onChange={(e)=>setForm(f=>({...f,shortDescription:e.target.value}))} rows={3} placeholder="Une phrase qui présente votre boutique"></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Logo / image</label>
                    <div className="mt-2">
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                      <div className="h-36 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center p-3 bg-gray-50">
                        {(form.preview || (form.logo && typeof form.logo === 'string')) ? (
                          <img src={resolveImageUrl(form.preview || form.logo)} alt="preview" className="max-h-28 object-contain rounded" />
                        ) : (
                          <div className="text-center text-gray-500">
                            <div className="mb-2">Logo de la boutique</div>
                            <button type="button" onClick={() => fileRef.current && fileRef.current.click()} className="px-4 py-2 bg-white border rounded shadow">Choisir un logo</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border">Annuler</button>
                  <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold shadow hover:bg-emerald-700 disabled:opacity-50">{loading ? 'En cours...' : (modalMode === 'create' ? 'Créer ma boutique' : 'Enregistrer les modifications')}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-emerald-50 to-white p-4 flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-200">
            {boutique.logo ? <img src={resolveImageUrl(boutique.logo)} alt={boutique.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">B</div>}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-extrabold text-gray-800">{boutique.name}</div>
              <div className="text-sm text-gray-500 mt-1">{boutique.location}</div>
            </div>
            <div className="flex items-center gap-2">
              {owner && (
                <>
                  <button onClick={() => { setModalMode('edit'); setForm({ name: boutique.name || '', logo: boutique.logo || null, shortDescription: boutique.shortDescription || '', location: boutique.location || '' }); setShowModal(true); }} className="px-3 py-1 rounded-md border border-gray-200 bg-white text-gray-700 hover:shadow">Modifier</button>
                  <button onClick={() => onManage && onManage()} className="px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">Gérer produits</button>
                </>
              )}
            </div>
          </div>
          <p className="mt-3 text-gray-700">{boutique.shortDescription}</p>
        </div>
      </div>
    </div>
    {showSavedLoader && (
      <div className="fixed inset-0 z-60 flex items-center justify-center pointer-events-none">
        <div className="bg-white/90 p-6 rounded-lg shadow-lg flex items-center gap-4">
          <svg className="animate-spin h-6 w-6 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          <div className="text-gray-700">Sauvegarde en cours...</div>
        </div>
      </div>
    )}

    {showToast && (
      <div className="fixed bottom-6 right-6 z-70">
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg">{toastMessage}</div>
      </div>
    )}

    {showConfirmation && createdBoutique && (
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40 px-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Boutique créée</h3>
          <p className="text-gray-700 mb-4">Votre boutique "{createdBoutique.name || 'Ma boutique'}" a été créée avec succès.</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => { try { if (createdBoutique && typeof createdBoutique.logo === 'string' && createdBoutique.logo.startsWith('blob:')) URL.revokeObjectURL(createdBoutique.logo); } catch(e) {} if (onManage) { onManage(); } else { if (typeof window !== 'undefined') window.location.reload(); } setShowConfirmation(false); setCreatedBoutique(null); }} className="px-4 py-2 rounded-lg border">Fermer</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
