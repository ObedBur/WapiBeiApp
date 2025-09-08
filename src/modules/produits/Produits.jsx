import React, { useState, useRef, useEffect } from 'react';
import authService from '../../services/auth.service';

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

export default function Produits({ products = [], onAddProduct, openPublish = false }) {
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    if (openPublish) setShowModal(true);
  }, [openPublish]);
  const [form, setForm] = useState({ name: '', price: '', currency: 'FCFA', quantity: '', unit: '', city: '', country: '', description: '', photo: null });
  const fileInputRef = useRef(null);

  const handlePhoto = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setForm((s) => ({ ...s, photo: reader.result, file: f }));
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    // try to post to backend if user is seller
    const currentUser = authService.getCurrentUser ? authService.getCurrentUser() : null;
    const userId = currentUser?.id ?? currentUser?.user?.id ?? currentUser?.data?.id ?? currentUser?.userId ?? (typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}').id) : null) ?? null;

    const payload = {
      name: form.name,
      price: `${form.price} ${form.currency}`,
      quantity: form.quantity ? `${form.quantity} ${form.unit || ''}`.trim() : undefined,
      location: [form.city, form.country].filter(Boolean).join(', '),
      description: form.description,
      image: form.photo
    };

    if (userId) {
      try {
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('price', payload.price);
        if (form.quantity) fd.append('quantity', form.quantity);
        if (form.unit) fd.append('unit', form.unit);
        if (form.city) fd.append('city', form.city);
        if (form.country) fd.append('country', form.country);
        if (form.description) fd.append('description', form.description);
        if (form.file) fd.append('image', form.file);

        const res = await fetch(`${BASE}/api/sellers/${userId}/products`, { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Erreur création produit');
        const data = await res.json();
        onAddProduct && onAddProduct(data.product || { id: Date.now(), ...payload });
      } catch (err) {
        console.error('Error posting product', err);
        onAddProduct && onAddProduct({ id: Date.now(), ...payload });
      }
    } else {
      onAddProduct && onAddProduct({ id: Date.now(), ...payload });
    }

    setForm({ name: '', price: '', currency: 'FCFA', quantity: '', unit: '', city: '', country: '', description: '', photo: null, file: null });
    setShowModal(false);
  };

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun produit trouvé</h3>
        <p className="text-gray-500 mb-4">Vous n'avez pas encore publié de produit.</p>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-md">Publier un produit</button>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden transform transition-all">
              <div className="flex items-center justify-between p-5 border-b">
                <div>
                  <h3 className="text-xl font-semibold">Publier un produit</h3>
                  <p className="text-sm text-gray-500">Ajoutez les détails de votre produit pour le rendre visible aux acheteurs.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom du produit</label>
                    <input className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-3" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Riz 5kg" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prix</label>
                      <input className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" value={form.price} onChange={(e)=>setForm(f=>({...f,price:e.target.value}))} placeholder="12000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Devise</label>
                      <select className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" value={form.currency} onChange={(e)=>setForm(f=>({...f,currency:e.target.value}))}>
                        <option>FCFA</option>
                        <option>USD</option>
                        <option>EUR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantité</label>
                      <input className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" value={form.quantity} onChange={(e)=>setForm(f=>({...f,quantity:e.target.value}))} placeholder="5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Unité</label>
                      <input className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" value={form.unit} onChange={(e)=>setForm(f=>({...f,unit:e.target.value}))} placeholder="kg, L, paquet" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ville / Pays</label>
                      <div className="flex gap-2">
                        <input className="mt-1 block w-1/2 rounded-md border-gray-200 shadow-sm p-2" value={form.city} onChange={(e)=>setForm(f=>({...f,city:e.target.value}))} placeholder="Ville" />
                        <input className="mt-1 block w-1/2 rounded-md border-gray-200 shadow-sm p-2" value={form.country} onChange={(e)=>setForm(f=>({...f,country:e.target.value}))} placeholder="Pays" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-3" value={form.description} onChange={(e)=>setForm(f=>({...f,description:e.target.value}))} rows={4} placeholder="Détails du produit..."></textarea>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Photo</label>
                    <div className="mt-2 flex items-center justify-center w-full h-44 rounded-md border-2 border-dashed border-gray-200 p-4">
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                      {form.photo ? (
                        <img src={resolveImageUrl(form.photo)} alt="preview" className="max-h-40 object-contain" />
                      ) : (
                        <div className="text-center text-gray-400">
                          <div className="mb-3">Déposez l'image ici</div>
                          <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} className="px-4 py-2 bg-white border rounded shadow">Choisir une image</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700">Récapitulatif</h4>
                    <div className="mt-2 text-sm text-gray-600">
                      <div><strong>Nom:</strong> {form.name || '—'}</div>
                      <div><strong>Prix:</strong> {form.price ? `${form.price} ${form.currency}` : '—'}</div>
                      <div><strong>Quantité:</strong> {form.quantity ? `${form.quantity} ${form.unit}` : '—'}</div>
                      <div><strong>Localisation:</strong> {form.city || form.country ? `${form.city} ${form.country}` : '—'}</div>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-end gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md border">Annuler</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Publier</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((p) => (
          <div key={p.id} className="border p-4 rounded flex gap-4">
            {p.image ? (
              <img src={resolveImageUrl(p.image)} alt={p.name} className="w-28 h-28 object-cover rounded" />
            ) : (
              <div className="w-28 h-28 bg-gray-100 rounded flex items-center justify-center text-gray-400">No image</div>
            )}
            <div className="flex-1">
              <div className="font-bold text-lg">{p.name}</div>
              <div className="text-sm text-gray-600">{p.price}</div>
              {p.location && <div className="text-sm text-gray-500">{p.location}</div>}
              {p.quantity && <div className="mt-1 text-sm text-gray-500">Quantité: {p.quantity}</div>}
              <div className="mt-2 text-gray-700">{p.description}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-md">Publier un produit</button>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden transform transition-all">
              <div className="flex items-center justify-between p-5 border-b">
                <div>
                  <h3 className="text-xl font-semibold">Publier un produit</h3>
                  <p className="text-sm text-gray-500">Ajoutez les détails de votre produit pour le rendre visible aux acheteurs.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom du produit</label>
                    <input className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-3" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Riz 5kg" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prix</label>
                      <input className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" value={form.price} onChange={(e)=>setForm(f=>({...f,price:e.target.value}))} placeholder="12000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Devise</label>
                      <select className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" value={form.currency} onChange={(e)=>setForm(f=>({...f,currency:e.target.value}))}>
                        <option>FCFA</option>
                        <option>USD</option>
                        <option>EUR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantité</label>
                      <input className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" value={form.quantity} onChange={(e)=>setForm(f=>({...f,quantity:e.target.value}))} placeholder="5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Unité</label>
                      <input className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2" value={form.unit} onChange={(e)=>setForm(f=>({...f,unit:e.target.value}))} placeholder="kg, L, paquet" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ville / Pays</label>
                      <div className="flex gap-2">
                        <input className="mt-1 block w-1/2 rounded-md border-gray-200 shadow-sm p-2" value={form.city} onChange={(e)=>setForm(f=>({...f,city:e.target.value}))} placeholder="Ville" />
                        <input className="mt-1 block w-1/2 rounded-md border-gray-200 shadow-sm p-2" value={form.country} onChange={(e)=>setForm(f=>({...f,country:e.target.value}))} placeholder="Pays" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-3" value={form.description} onChange={(e)=>setForm(f=>({...f,description:e.target.value}))} rows={4} placeholder="Détails du produit..."></textarea>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Photo</label>
                    <div className="mt-2 flex items-center justify-center w-full h-44 rounded-md border-2 border-dashed border-gray-200 p-4">
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                      {form.photo ? (
                        <img src={resolveImageUrl(form.photo)} alt="preview" className="max-h-40 object-contain" />
                      ) : (
                        <div className="text-center text-gray-400">
                          <div className="mb-3">Déposez l'image ici</div>
                          <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} className="px-4 py-2 bg-white border rounded shadow">Choisir une image</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700">Récapitulatif</h4>
                    <div className="mt-2 text-sm text-gray-600">
                      <div><strong>Nom:</strong> {form.name || '—'}</div>
                      <div><strong>Prix:</strong> {form.price ? `${form.price} ${form.currency}` : '—'}</div>
                      <div><strong>Quantité:</strong> {form.quantity ? `${form.quantity} ${form.unit}` : '—'}</div>
                      <div><strong>Localisation:</strong> {form.city || form.country ? `${form.city} ${form.country}` : '—'}</div>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-end gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md border">Annuler</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Publier</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
