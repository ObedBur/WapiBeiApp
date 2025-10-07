import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchWithAuth } from '../../utils/api';
import { useToast, useMediaQuery } from './hooks';

const ConversationSkeleton = () => (
  <div className="p-3 mb-2 animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const SearchBar = ({ value, onChange, placeholder, className = '' }) => {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onChange(newValue), 300);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      />
      <svg
        className="absolute left-2 top-2.5 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
};

export default function ConversationList() {
  const { showToast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [conversationSearchQuery, setConversationSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showMobileConversations, setShowMobileConversations] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});

  // bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  // bulk delete modal state
  const [bulkDeletePending, setBulkDeletePending] = useState(false);
  const [bulkDeleteInProgress, setBulkDeleteInProgress] = useState(false);
  // single delete state
  const [deletePendingId, setDeletePendingId] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  const loadConversations = useCallback(async () => {
    setLoadError(null);
    setConversationsLoading(true);
    try {
      const data = await fetchWithAuth(`${BASE}/api/conversations`);
      const convs = Array.isArray(data) ? data : [];
      setConversations(convs);
      showToast && showToast('Conversations chargées', 'success');
    } catch (err) {
      if (err?.status === 401) {
        setConversations([]);
        setLoadError('Non autorisé — connectez-vous');
        showToast && showToast('Session expirée, veuillez vous reconnecter', 'warning');
        return;
      }
      setLoadError('Erreur de chargement');
    } finally {
      setConversationsLoading(false);
    }
  }, [BASE, showToast]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const processedConversations = useMemo(() => {
    let filtered = [...conversations];
    if (conversationSearchQuery) {
      const q = conversationSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (conv) =>
          (conv.partnerName || conv.title || '').toLowerCase().includes(q) ||
          (conv.lastMessage || '').toLowerCase().includes(q)
      );
    }
    if (filterBy === 'unread') filtered = filtered.filter((conv) => (unreadCounts[conv.id] || 0) > 0);
    else if (filterBy === 'favorites') filtered = filtered.filter((conv) => conv.isFavorite);

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.partnerName || a.title || '').localeCompare(b.partnerName || b.title || '');
        case 'unread':
          return (unreadCounts[b.id] || 0) - (unreadCounts[a.id] || 0);
        case 'recent':
        default:
          return new Date(b.lastMessageAt || b.createdAt || 0) - new Date(a.lastMessageAt || a.createdAt || 0);
      }
    });

    return filtered;
  }, [conversations, conversationSearchQuery, filterBy, sortBy, unreadCounts]);

  const openConversation = (id) => {
    try {
      window.dispatchEvent(new CustomEvent('open-conversation', { detail: { id } }));
      if (isMobile) setShowMobileConversations(false);
    } catch (e) {}
  };

  // selection helpers
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectAllChecked(false);
  };

  const handleSelectAll = (checked) => {
    setSelectAllChecked(checked);
    if (checked) {
      setSelectedIds(processedConversations.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  // bulk delete flow
  const requestBulkDelete = () => {
    if (!selectedIds || selectedIds.length === 0) return;
    setBulkDeletePending(true);
  };

  const cancelBulkDelete = () => setBulkDeletePending(false);

  const confirmBulkDelete = useCallback(async () => {
    if (!selectedIds || selectedIds.length === 0) return;
    setBulkDeleteInProgress(true);
    const prev = conversations;
    // optimistic update
    setConversations((s) => s.filter((c) => !selectedIds.includes(c.id)));
    try {
      // call delete per id and tolerate 404 (treat as already deleted)
      const results = await Promise.allSettled(
        selectedIds.map((id) => fetchWithAuth(`${BASE}/api/conversations/${id}`, { method: 'DELETE' }))
      );
      const fatal = results.find((r) => r.status === 'rejected' && (!r.reason || r.reason.status !== 404));
      if (fatal) {
        // rollback
        setConversations(prev);
        console.error('Bulk delete error', fatal.reason || fatal);
        showToast && showToast('Échec de la suppression en masse', 'error');
      } else {
        showToast && showToast('Conversations supprimées', 'success');
        clearSelection();
      }
    } catch (err) {
      setConversations(prev);
      console.error('Bulk delete error', err);
      showToast && showToast('Échec de la suppression en masse', 'error');
    } finally {
      setBulkDeleteInProgress(false);
      setBulkDeletePending(false);
    }
  }, [selectedIds, conversations, BASE, showToast]);

  return (
    <aside
      className={`${isMobile ? (showMobileConversations ? 'block' : 'hidden') : 'block'} ${
        isMobile ? 'w-full' : 'w-1/3'
      } border-r bg-gray-50 p-4 overflow-y-auto flex flex-col`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h2 className="font-bold text-lg">📨 Messagerie</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowMobileConversations(true)} className="text-sm px-3 py-1 border rounded">
            Apparence
          </button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-start-modal'))} className="text-sm bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">
            Nouvelle
          </button>
        </div>
      </div>

      {/* Bulk selection toolbar */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <div className="flex items-center space-x-2">
          <label className="inline-flex items-center space-x-2">
            <input type="checkbox" checked={selectAllChecked} onChange={(e) => handleSelectAll(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm text-gray-700">Sélectionner</span>
          </label>
          {selectedIds.length > 0 && <span className="text-sm text-gray-600">{selectedIds.length} sélectionné(s)</span>}
        </div>
        <div className="flex items-center space-x-2">
          <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)} className="border rounded px-2 py-1 text-xs">
            <option value="all">Toutes</option>
            <option value="unread">Non lues</option>
            <option value="favorites">Favorites</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded px-2 py-1 text-xs">
            <option value="recent">Récentes</option>
            <option value="name">Nom</option>
            <option value="unread">Non lues</option>
          </select>

          <button
            onClick={requestBulkDelete}
            disabled={selectedIds.length === 0}
            className={`px-3 py-1 rounded text-white ${selectedIds.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            Supprimer la sélection
          </button>
        </div>
      </div>

      <SearchBar
        value={conversationSearchQuery}
        onChange={setConversationSearchQuery}
        placeholder="Rechercher une conversation..."
        className="mb-3"
      />

      <div className="flex-1 overflow-y-auto">
        {conversationsLoading ? (
          Array(5)
            .fill()
            .map((_, i) => <ConversationSkeleton key={i} />)
        ) : processedConversations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{conversationSearchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}</p>
        ) : (
          processedConversations.map((c) => (
            <div
              key={c.id}
              className={`p-3 rounded mb-2 transition-colors relative ${''}`}
            >
              <div className="flex items-center justify-between">
                <div onClick={() => openConversation(c.id)} className="font-semibold truncate flex-1 cursor-pointer">{c.partnerName || c.title || 'Vendeur'}</div>
                <div className="flex items-center space-x-2">
                  {unreadCounts[c.id] > 0 && (
                    <span className="bg-emerald-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">{unreadCounts[c.id]}</span>
                  )}
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(c.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelect(c.id); setSelectAllChecked(false); }}
                    className="w-4 h-4"
                    title="Sélectionner"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeletePendingId(c.id); }}
                    title="Supprimer"
                    className="text-gray-500 hover:text-red-600 text-sm px-2 py-1 rounded"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div onClick={() => openConversation(c.id)} className="text-xs text-gray-500 truncate mt-1 cursor-pointer">{c.lastMessage || 'Pas de message'}</div>
              <div onClick={() => openConversation(c.id)} className="text-xs text-gray-400 mt-1 cursor-pointer">{c.lastMessageAt && new Date(c.lastMessageAt).toLocaleDateString()}</div>
            </div>
          ))
        )}
      </div>

      {/* Single deletion modal */}
      {deletePendingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-md shadow-lg max-w-sm w-full p-4">
            <h3 className="font-semibold text-lg mb-2">Supprimer la conversation</h3>
            <p className="text-sm text-gray-700 mb-4">Voulez-vous vraiment supprimer définitivement cette conversation ?</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setDeletePendingId(null)} className="px-3 py-1 border rounded">Annuler</button>
              <button
                onClick={async () => {
                  setDeleteInProgress(true);
                  const prev = conversations;
                  setConversations((s) => s.filter((c) => c.id !== deletePendingId));
                  try {
                    await fetchWithAuth(`${BASE}/api/conversations/${deletePendingId}`, { method: 'DELETE' });
                    showToast && showToast('Conversation supprimée', 'success');
                  } catch (err) {
                    if (!err || err.status !== 404) {
                      setConversations(prev);
                      console.error('Delete error', err);
                      showToast && showToast('Impossible de supprimer la conversation', 'error');
                    } else {
                      // 404 treated as success
                      showToast && showToast('Conversation supprimée', 'success');
                    }
                  } finally {
                    setDeleteInProgress(false);
                    setDeletePendingId(null);
                  }
                }}
                disabled={deleteInProgress}
                className={`px-3 py-1 rounded text-white ${deleteInProgress ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {deleteInProgress ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete confirmation modal */}
      {bulkDeletePending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-md shadow-lg max-w-sm w-full p-4">
            <h3 className="font-semibold text-lg mb-2">Supprimer les conversations</h3>
            <p className="text-sm text-gray-700 mb-4">Voulez-vous vraiment supprimer définitivement {selectedIds.length} conversation(s) ?</p>
            <div className="flex justify-end space-x-2">
              <button onClick={cancelBulkDelete} className="px-3 py-1 border rounded">Annuler</button>
              <button
                onClick={confirmBulkDelete}
                disabled={bulkDeleteInProgress}
                className={`px-3 py-1 rounded text-white ${bulkDeleteInProgress ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {bulkDeleteInProgress ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
} 