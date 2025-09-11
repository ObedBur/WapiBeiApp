import React, { useEffect, useRef, useState } from 'react';
import { fetchWithAuth } from '../utils/api';

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
            src={product.image} 
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


