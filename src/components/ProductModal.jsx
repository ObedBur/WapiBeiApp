import React, { useEffect, useRef, useState } from 'react';
import { fetchWithAuth } from '../utils/api';
import authService from '../services/auth.service';
import { Upload, X, Package, DollarSign, MapPin, Phone } from "lucide-react";
import { Star, Eye, Plus, Tag } from './Icons';


export default function ProductModal({ product, onClose, onAdd }) {
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!product) return undefined;
    previouslyFocused.current = document.activeElement;
    const modal = modalRef.current;
    const selector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusables = modal ? Array.from(modal.querySelectorAll(selector)) : [];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    first?.focus();

    function handleKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose && onClose();
      }
      if (e.key === 'Tab' && focusables.length) {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      try { previouslyFocused.current?.focus && previouslyFocused.current.focus(); } catch (e) {}
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      aria-hidden={false}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        role="dialog" 
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:w-1/2">
          <img 
            src={(product.image && String(product.image).startsWith('/uploads')) ? ((import.meta.env.VITE_API_BASE || 'http://localhost:5000') + product.image) : product.image}
            alt={product.nom} 
            className="w-full h-64 md:h-full object-cover"
          />
        </div>
        <div className="p-6 md:w-1/2 overflow-y-auto">
          <div className="flex justify-between items-start">
            <h2 id="product-modal-title" className="text-2xl font-bold text-gray-800">{product.nom}</h2>
            <button 
              className="text-gray-400 hover:text-gray-500 text-2xl" 
              onClick={onClose} 
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">{product.category}</p>
          <p className="text-gray-600 mt-4">{product.description}</p>
          <p className="text-2xl font-bold text-primary mt-4">{product.prix}</p>
          
          <div className="flex space-x-3 mt-6">
            <button 
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200"
              onClick={() => onAdd && onAdd(product)}
              aria-label={`Ajouter ${product.nom} au panier`}
            >
              Ajouter au panier
            </button>
            <button 
              className="px-6 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
              onClick={onClose}
              aria-label="Fermer la fenêtre"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Product card component used by marketplace list views


// Blog modal component moved from Accueil.jsx to centralize modals
export function BlogModal({ isOpen, post, isLoading, error, onClose }) {
  const ref = React.useRef(null);
  const [fetchedPost, setFetchedPost] = useState(null);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    let mounted = true;
    previouslyFocused.current = document.activeElement;
    if (post && post.slug) {
      (async () => {
        setLoadingLocal(true);
        setLocalError(null);
        try {
          const endpoint = `${(import.meta.env.VITE_API_BASE || '')}/api/blogs/${encodeURIComponent(post.slug)}`;
          const data = await fetchWithAuth(endpoint);
          if (!mounted) return;
          // Map common fields
          const mapped = {
            title: data.title || post.title,
            body: data.body || data.content || data.description || post.body || post.content || post.excerpt || '',
            coverImage: data.coverImage || data.cover_url || post.coverImage || post.cover_url,
            author: data.author || post.author || 'Équipe WapiBei',
            date: data.published_at || data.date || post.date || post.published_at,
            slug: post.slug,
          };
          setFetchedPost(mapped);
        } catch (e) {
          console.warn('Blog fetch failed, using fallback', e);
          setLocalError(e.message || 'Erreur chargement article');
          setFetchedPost(null);
        } finally {
          mounted && setLoadingLocal(false);
        }
      })();
    }
    // existing focus trap logic
    const modal = ref.current;
    const selector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusables = modal ? Array.from(modal.querySelectorAll(selector)) : [];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();
    function handleKey(e) {
      if (e.key === 'Escape') { onClose && onClose(); }
      if (e.key === 'Tab' && focusables.length) {
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
        else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); try { previouslyFocused.current?.focus && previouslyFocused.current.focus(); } catch (e) {} ; mounted = false; };
  }, [isOpen, post, onClose]);

  if (!isOpen) return null;

  const display = fetchedPost || post;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="blog-modal-title" className="relative max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-auto max-h-[90vh] p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600">✖</button>
        {loadingLocal || isLoading ? (
          <div>Chargement...</div>
        ) : localError ? (
          <div className="text-red-600">{localError}</div>
        ) : display ? (
          <div>
            <h2 id="blog-modal-title" className="text-2xl font-bold mb-2">{display.title}</h2>
            <div className="text-sm text-gray-500 mb-4">{display.author} • {display.date}</div>
            {display.coverImage && <img src={display.coverImage} alt={display.title} className="w-full h-56 object-cover rounded-lg mb-4" />}
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: display.body || '' }} />
          </div>
        ) : (
          <div className="text-gray-500">Article indisponible.</div>
        )}
      </div>
    </div>
  );
}

export function ProfilePhotoModal({ isOpen, onClose, onUploaded }) {
  const ref = React.useRef(null);
  const [file, setFile] = React.useState(null);
  const [preview, setPreview] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreview(null);
      setError(null);
      setUploading(false);
      return undefined;
    }
    let mounted = true;
    return () => { mounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleUpload() {
    if (!file) return setError('Veuillez sélectionner une image');
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('photo', file);
      const BASE = import.meta.env.VITE_API_BASE || '';
      const url = `${BASE.replace(/\/$/, '')}/api/users/me/photo`;
      const res = await fetchWithAuth(url, { method: 'POST', body: form });
      // res expected to be updated user object or an object { success: true, url: '...' }
      if (onUploaded) onUploaded(res);
      onClose && onClose();
    } catch (e) {
      console.error('Upload failed', e);
      setError(e.message || 'Échec de l\'upload');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div ref={ref} className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full z-10" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Changer la photo de profil</h3>
          <button onClick={onClose} className="text-gray-600">✖</button>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Sélectionner une image</label>
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; setFile(f || null); setPreview(f ? URL.createObjectURL(f) : null); setError(null); }} />

          {preview && (
            <div className="w-40 h-40 rounded-full overflow-hidden"><img src={preview} alt="preview" className="w-full h-full object-cover" /></div>
          )}

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border">Annuler</button>
            <button onClick={handleUpload} disabled={uploading} className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-60">{uploading ? 'Upload...' : 'Uploader'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}


export function PublishProductModal({ isOpen, onClose, onPublish, initial = {} }) {
  const ref = React.useRef(null);
  const [name, setName] = React.useState(initial.name || "");
  const [description, setDescription] = React.useState(initial.description || "");
  const [category, setCategory] = React.useState(initial.category || "");
  const [price, setPrice] = React.useState(initial.price || "");
  const [currency, setCurrency] = React.useState(initial.currency || "FC");
  const [quantity, setQuantity] = React.useState(initial.quantity || "");
  const [unit, setUnit] = React.useState(initial.unit || "kg");
  const [city, setCity] = React.useState(initial.city || "");
  const [country, setCountry] = React.useState(initial.country || "");
  const [neighborhood, setNeighborhood] = React.useState(initial.neighborhood || "");
  const [contact, setContact] = React.useState(initial.contact || "");
  const [imageFiles, setImageFiles] = React.useState([]);
  const [previews, setPreviews] = React.useState(initial.imageUrls || []);

  if (!isOpen) return null;

  // Image handlers
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const nextFiles = [...imageFiles, ...files];
    setImageFiles(nextFiles);

    const nextPreviews = [...previews, ...files.map((f) => URL.createObjectURL(f))];
    setPreviews(nextPreviews);
  };

  const handleRemoveFile = (idx) => {
    setImageFiles((s) => s.filter((_, i) => i !== idx));
    setPreviews((s) => s.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // build product payload for optimistic/local fallback
    const localProduct = {
      id: Date.now(),
      nom: name,
      description,
      category,
      prix: `${price} ${currency}`,
      price,
      currency,
      quantity,
      unit,
      city,
      country,
      neighborhood,
      contact,
      image: previews[0] || "",
      images: previews,
    };

    // attempt to send to backend
    try {
      const user = authService.getCurrentUser && authService.getCurrentUser();
      const sellerId = user?.id || user?.user?.id || null;
      if (!sellerId) {
        // not authenticated: fallback to local publish
        onPublish && onPublish(localProduct);
        onClose && onClose();
        return;
      }

      const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
      const url = `${BASE.replace(/\/$/, '')}/api/sellers/${sellerId}/products`;
      const form = new FormData();
      form.append('name', name || '');
      form.append('price', price || '');
      form.append('currency', currency || '');
      form.append('quantity', quantity || '');
      form.append('unit', unit || '');
      form.append('city', city || '');
      form.append('country', country || '');
      form.append('description', description || '');
      form.append('category', category || '');
      form.append('neighborhood', neighborhood || '');
      form.append('contact', contact || '');
      // attach first file as `image` if any
      if (imageFiles && imageFiles.length) {
        form.append('image', imageFiles[0]);
      }

      const res = await fetchWithAuth(url, { method: 'POST', body: form });
      // fetchWithAuth returns parsed JSON from fetchJson
      const serverProduct = (res && res.product) ? res.product : localProduct;
      onPublish && onPublish(serverProduct);
      onClose && onClose();
    } catch (err) {
      console.error('Failed to publish product', err);
      // fallback to local publish so user doesn't lose data
      onPublish && onPublish(localProduct);
      onClose && onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <form
        ref={ref}
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-3xl z-10 overflow-auto max-h-[90vh] shadow-2xl border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-transparent bg-clip-text flex items-center gap-2">
            <Package className="w-6 h-6" /> Publier un produit
          </h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-red-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Inputs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nom du produit" value={name} onChange={setName} required />
          <Input label="Catégorie" value={category} onChange={setCategory} required />
          
          <div>
            <label className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="w-4 h-4" /> Prix
            </label>
            <div className="flex gap-2 mt-1">
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                type="number"
                step="0.01"
                className="flex-1 px-3 py-2 border rounded-xl dark:bg-gray-800"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 border rounded-xl dark:bg-gray-800"
              >
                <option>FC</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Quantité</label>
            <div className="flex gap-2 mt-1">
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                type="number"
                className="flex-1 px-3 py-2 border rounded-xl dark:bg-gray-800"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="px-3 py-2 border rounded-xl dark:bg-gray-800"
              >
                <option>kg</option>
                <option>litre</option>
                <option>pièce</option>
                <option>carton</option>
              </select>
            </div>
          </div>

          <Input label="Ville" value={city} onChange={setCity} required />
          <Input label="Pays" value={country} onChange={setCountry} required />
          <Input label="Quartier (optionnel)" value={neighborhood} onChange={setNeighborhood} />

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full px-3 py-2 border rounded-xl dark:bg-gray-800"
            />
          </div>

          {/* File upload */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Photos</label>
            <label className="mt-2 flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 text-center cursor-pointer hover:border-emerald-400">
              <Upload className="w-10 h-10 text-emerald-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Glisser-déposer ou cliquer pour choisir vos images
              </span>
              <input type="file" accept="image/*" multiple onChange={handleFilesChange} className="hidden" />
            </label>

            {/* Preview gallery */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {previews.map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden border">
                  <img src={url} alt={`preview-${i}`} className="w-full h-28 object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(i)}
                    className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600 shadow"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {previews.length === 0 && <div className="col-span-3 text-sm text-gray-500">Aucune image</div>}
            </div>
          </div>

          <Input
            label="Contact vendeur (téléphone/email)"
            value={contact}
            onChange={setContact}
            placeholder="+243 ... ou email"
            icon={<Phone className="w-4 h-4" />}
          />
        </div>

        {/* Product preview */}
        {name && price && previews.length > 0 && (
          <div className="mt-6 p-4 border rounded-xl bg-gray-50 dark:bg-gray-800">
            <h4 className="font-medium mb-2">Aperçu produit :</h4>
            <div className="flex gap-4">
              <img src={previews[0]} alt="preview" className="w-24 h-24 rounded-xl object-cover" />
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-emerald-600">{price} {currency}</p>
                <p className="text-sm text-gray-500">{city}, {country}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border">
            Annuler
          </button>
          <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium shadow hover:scale-105 transition">
            Publier ✔️
          </button>
        </div>
      </form>
    </div>
  );
}

// Reusable Input component
function Input({ label, value, onChange, required, placeholder, icon }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center mt-1 border rounded-xl px-3 py-2 dark:bg-gray-800">
        {icon && <span className="mr-2 text-gray-500">{icon}</span>}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none"
        />
      </div>
    </div>
  );
}



