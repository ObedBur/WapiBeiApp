import React, { useState, useEffect } from 'react';
import ConversationList from './ConversationList';
import ChatArea from './ChatArea';

import { useToast, useMediaQuery } from './hooks';
import { postJson, fetchWithAuth } from '../../utils/api';

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function Messagerie() {
  const { toasts, showToast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Shared state
  const [showSettings, setShowSettings] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedConv, setSelectedConv] = useState(null);
  // start modal fields
  const [startNameOrEmail, setStartNameOrEmail] = useState('');
  const [startTitle, setStartTitle] = useState('');
  const [startPartnerId, setStartPartnerId] = useState(null);
  const [startLoading, setStartLoading] = useState(false);

  // Listen to events from ConversationList (progressive integration)
  useEffect(() => {
    const onOpenConv = (e) => {
      try {
        const id = e?.detail?.id;
        if (id) setSelectedConv(id);
      } catch (err) {}
    };
    const onOpenStart = () => setShowStartModal(true);
    const onOpenMessagerie = async () => {
      // don't overwrite fields if modal already open
      if (showStartModal) return;
      try {
        const raw = localStorage.getItem('messagerie_open_with');
        if (!raw) { setShowStartModal(true); return; }
        // remove key early to avoid re-triggering later
        try { localStorage.removeItem('messagerie_open_with'); } catch (e) {}
        const partner = JSON.parse(raw);
        if (!partner) { setShowStartModal(true); return; }
        const partnerId = partner.id || partner.partner_id || partner.userId || null;
        // Prefill modal fields and show it (user can confirm or change)
        setStartPartnerId(partnerId);
        setStartNameOrEmail(partner.name || partner.email || '');
        setStartTitle('');
        setShowStartModal(true);
      } catch (e) {
        setShowStartModal(true);
      }
    };
    window.addEventListener('open-conversation', onOpenConv);
    window.addEventListener('open-start-modal', onOpenStart);
    window.addEventListener('open-messagerie', onOpenMessagerie);
    return () => {
      window.removeEventListener('open-conversation', onOpenConv);
      window.removeEventListener('open-start-modal', onOpenStart);
      window.removeEventListener('open-messagerie', onOpenMessagerie);
    };
  }, [showStartModal]);

    return (
    <div className="flex h-screen bg-gray-100">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-2 rounded shadow-lg text-white ${t.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}>
            {t.message}
                                  </div>
                                ))}
                            </div>

      <ConversationList selectedConv={selectedConv} />
      <ChatArea selectedConv={selectedConv} />
      {/* MessageInput removed — ChatArea contains input to avoid duplicate inputs */}

      {/* Start modal handling (kept minimal for progressive migration) */}
      {showStartModal && (
        <div onClick={() => { setShowStartModal(false); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="font-semibold text-lg mb-4">Démarrer une conversation</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom ou e-mail du contact</label>
                <input value={startNameOrEmail} onChange={(e) => { setStartNameOrEmail(e.target.value); setStartPartnerId(null); }} className="w-full mt-1 border rounded px-3 py-2" placeholder="Nom ou e-mail" />
              </div>
                  <div>
                <label className="block text-sm font-medium text-gray-700">Titre / Motif</label>
                <input value={startTitle} onChange={(e) => setStartTitle(e.target.value)} className="w-full mt-1 border rounded px-3 py-2" placeholder="Ex: Question sur le produit X" />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => { setShowStartModal(false); setStartNameOrEmail(''); setStartTitle(''); setStartPartnerId(null); }} className="px-4 py-2 border rounded">Fermer</button>
              <button
                onClick={async () => {
                  if (!startNameOrEmail?.trim()) return showToast && showToast('Veuillez saisir un nom ou un e-mail', 'warning');
                  setStartLoading(true);
                  try {
                    let partnerId = startPartnerId;
                    if (!partnerId) {
                      // try to find user by email or name
                      const q = encodeURIComponent(startNameOrEmail.trim());
                      try {
                        const users = await fetchWithAuth(`${BASE}/api/users?query=${q}`);
                        if (Array.isArray(users) && users.length > 0) partnerId = users[0].id;
                      } catch (e) {
                        // ignore — will error below if no partnerId
                      }
                    }
                    if (!partnerId) {
                      showToast && showToast('Contact introuvable — veuillez vérifier le nom ou l\'email', 'error');
                      setStartLoading(false);
                      return;
                    }
                    const conv = await postJson(`${BASE}/api/conversations`, { partner_id: Number(partnerId), title: startTitle || null });
                    if (conv && conv.id) {
                      setSelectedConv(conv.id);
                      setShowStartModal(false);
                      setStartNameOrEmail('');
                      setStartTitle('');
                      setStartPartnerId(null);
                      try { localStorage.removeItem('messagerie_open_with'); } catch (e) {}
                      showToast && showToast('Conversation créée', 'success');
                    } else {
                      showToast && showToast('Impossible de créer la conversation', 'error');
                    }
                  } catch (err) {
                    console.error('Start conversation error', err);
                    if (err && err.status === 401 && err.body?.message === 'Token expiré') {
                      // close modal and ask user to reconnect
                      try { setShowStartModal(false); } catch (e) {}
                      showToast && showToast('Session expirée — reconnectez-vous', 'warning');
                      return;
                    }
                    showToast && showToast('Erreur lors du démarrage', 'error');
                  } finally {
                    setStartLoading(false);
                  }
                }}
                disabled={startLoading}
                className={`px-4 py-2 rounded text-white ${startLoading ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {startLoading ? 'Création...' : 'Démarrer la conversation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
