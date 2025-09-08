import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from "react";
import authService from '../../services/auth.service';

// Hook pour les toasts
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = `${Date.now()}-${++idRef.current}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  return { toasts, showToast };
};

// Hook pour détecter la taille d'écran
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  
  return matches;
};

// Hook personnalisé pour WebSocket
const useWebSocket = (currentUserId, onMessage) => {
  const ws = useRef(null);
  const reconnectRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  // send helper will be set when ws opens
  const sendRef = useRef((payload) => {});

  useEffect(() => {
    const enabled = import.meta.env.VITE_ENABLE_WS === 'true';
    if (!enabled) {
      setConnectionStatus('Disabled');
      return;
    }

    if (!currentUserId) {
      setConnectionStatus('Disconnected');
      return;
    }

    let cancelled = false;

    const connectWS = () => {
      if (cancelled) return;
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const base = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_BASE || 'http://localhost:5000';
        const wsBase = base.replace(/^https?:/, protocol).replace(/\/$/, '');
        const wsPath = (import.meta.env.VITE_WS_PATH || `/messages/${currentUserId}`).replace(/^\//, '');
        const url = `${wsBase}/${wsPath}`;

        ws.current = new WebSocket(url);
        console.debug('WS: connecting to', url);

        ws.current.onopen = () => {
          reconnectRef.current = 0;
          setConnectionStatus('Connected');
          // set send helper
          sendRef.current = (p) => {
            try {
              if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify(p));
              }
            } catch (e) { /* ignore */ }
          };
          console.debug('WebSocket connected');
        };

        ws.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            onMessage(message);
          } catch (e) {
            console.warn('WS parse error', e);
          }
        };

        ws.current.onclose = () => {
          if (cancelled) return;
          setConnectionStatus('Disconnected');
          sendRef.current = () => {};
          console.warn('WebSocket disconnected');
          reconnectRef.current += 1;
          const delay = Math.min(3000 * Math.pow(2, reconnectRef.current - 1), 30000);
          reconnectTimerRef.current = setTimeout(connectWS, delay);
        };

        ws.current.onerror = (err) => {
          console.warn('WebSocket error', err);
          setConnectionStatus('Error');
        };
      } catch (err) {
        console.warn('WebSocket connection failed:', err);
        reconnectRef.current += 1;
        const delay = Math.min(3000 * Math.pow(2, reconnectRef.current - 1), 30000);
        reconnectTimerRef.current = setTimeout(connectWS, delay);
      }
    };

    connectWS();

    return () => {
      cancelled = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (ws.current) {
        try { ws.current.close(); } catch (e) {}
      }
    };
  }, [currentUserId, onMessage]);

  const send = useCallback((payload) => sendRef.current(payload), []);
  return [connectionStatus, send];
};

// Composant Toast
const ToastContainer = ({ toasts }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {toasts.map(toast => (
      <div
        key={toast.id}
        className={`px-4 py-2 rounded shadow-lg text-white transform transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500' : 
          toast.type === 'error' ? 'bg-red-500' : 
          toast.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
        }`}
      >
        {toast.message}
      </div>
    ))}
  </div>
);

// Composant Skeleton pour les conversations
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

// Composant Skeleton pour les messages
const MessageSkeleton = ({ isOwnMessage = false }) => (
  <div className={`mb-3 flex animate-pulse ${isOwnMessage ? "justify-end" : "justify-start"}`}>
    <div className={`px-3 py-2 rounded-lg max-w-xs ${isOwnMessage ? "bg-gray-300" : "bg-gray-200"}`}>
      <div className="h-4 bg-gray-400 rounded w-32 mb-1"></div>
      <div className="h-3 bg-gray-400 rounded w-16"></div>
    </div>
  </div>
);

// Composant de recherche avec debouncing
const SearchBar = ({ value, onChange, placeholder, className = "" }) => {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
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
      <svg className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
};

// Composant principal Messagerie amélioré
export default function Messagerie() {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [newlyAddedIds, setNewlyAddedIds] = useState([]);
  const [usersById, setUsersById] = useState({});
  const textareaRef = useRef(null);

  // Nettoyage et normalisation du texte (supprime les caractères de contrôle RTL/ZW)
  const normalizeText = useCallback((text) => {
    if (typeof text !== 'string') return text;
    try {
      return text.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '');
    } catch (e) {
      return text;
    }
  }, []);

  const fetchUserIfNeeded = useCallback(async (userId) => {
    if (!userId) return null;
    if (usersById[userId]) return usersById[userId];
    try {
      const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";
      const res = await fetch(`${apiBase}/api/sellers/${userId}`);
      if (!res.ok) return null;
      const data = await res.json();
      setUsersById(prev => ({ ...prev, [userId]: data }));
      return data;
    } catch (e) {
      return null;
    }
  }, [usersById]);

  // Instrumentation: log when important state setters are called
  // We'll wrap the common setters to log their calls.
  const logSetNewMessage = (val) => {
    console.debug('Messagerie:setNewMessage', { length: (val || '').length, snippet: (val || '').slice(0,50) });
    const cleaned = normalizeText(val);
    // Update state
    setNewMessage(cleaned);
    // Restore caret/focus to end (or keep selection) after DOM update
    setTimeout(() => {
      try {
        const el = textareaRef.current;
        if (el) {
          const pos = cleaned.length;
          el.focus();
          el.setSelectionRange(pos, pos);
        }
      } catch (e) { /* ignore */ }
    }, 0);
  };

  const logSetAttachmentPreview = (val) => {
    console.debug('Messagerie:setAttachmentPreview', { type: val?.type, name: val?.name });
    setAttachmentPreview(val);
  };

  const logSetReplyToMessage = (val) => {
    console.debug('Messagerie:setReplyToMessage', { id: val?.id });
    setReplyToMessage(val);
  };
  
  // Nouveaux états pour les améliorations
  const [conversationSearchQuery, setConversationSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, name, unread
  const [filterBy, setFilterBy] = useState('all'); // all, unread, favorites
  const [showMobileConversations, setShowMobileConversations] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  
  const searchTimerRef = useRef(null);
  const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  const msgContainerRef = useRef(null);
  const lastMsgRef = useRef(null);
  
  const { toasts, showToast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Current user
  const rawUser = authService.getCurrentUser();
  const currentUserId = rawUser?.id ?? rawUser?.user?.id ?? rawUser?.data?.id ?? rawUser?.userId ?? null;
  const token = rawUser?.token ?? rawUser?.accessToken ?? null;
  
  // WebSocket pour les messages en temps réel
  const handleNewMessage = useCallback((message) => {
    // typing events
    if (message && message.type === 'typing') {
      const { conversationId, user, typing } = message;
      if (conversationId !== selectedConv) return; // only show for current conv
      setTypingUsers(prev => {
        const exists = prev.some(u => u.id === user.id);
        if (typing && !exists) return [...prev, user];
        if (!typing && exists) return prev.filter(u => u.id !== user.id);
        return prev;
      });
      return;
    }

    // Nouveau message reçu via WebSocket
    if (message && message.conversationId === selectedConv) {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        setNewlyAddedIds(ids => (ids || []).concat(message.id));
        setTimeout(() => setNewlyAddedIds(ids => (ids || []).filter(id => id !== message.id)), 600);
        return [...prev, message];
      });
    }

    // Mettre à jour le compteur de messages non lus
    setUnreadCounts(prev => ({
      ...prev,
      [message.conversationId]: (prev[message.conversationId] || 0) + 1
    }));

    // Mettre à jour la conversation avec le dernier message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === message.conversationId 
          ? { ...conv, lastMessage: message.content, lastMessageAt: message.createdAt }
          : conv
      )
    );

    showToast('Nouveau message reçu', 'info');
  }, [selectedConv, showToast]);
  
  const [wsStatus, wsSend] = useWebSocket(currentUserId, handleNewMessage);
  
  // Typing indicator (via WS)
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  
  // Initialize textarea height when conversation changes
  useLayoutEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      try {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 160) + 'px';
      } catch (e) { /* ignore */ }
    }
  }, [selectedConv]);
  
  useEffect(() => {
    // handle typing events arriving via WS - handled in handleNewMessage if message.type === 'typing'
  }, []);

  // send typing events via wsSend when user types
  useEffect(() => {
    if (!wsSend || !selectedConv) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    // notify typing true
    const user = authService.getCurrentUser();
    const name = user?.user?.nom || user?.nom || user?.user?.prenom || user?.prenom || (user?.user?.email || user?.email) || 'Vous';
    wsSend({ type: 'typing', conversationId: selectedConv, user: { id: currentUserId, name }, typing: true });
    // send stop after 1.5s inactivity
    typingTimeoutRef.current = setTimeout(() => {
      wsSend({ type: 'typing', conversationId: selectedConv, user: { id: currentUserId, name }, typing: false });
    }, 1500);
    return () => { if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); };
  }, [newMessage, wsSend, selectedConv, currentUserId]);
  
  // Helper to build headers
  const buildHeaders = useCallback((extra = {}) => {
    const current = authService.getCurrentUser();
    const latestToken = current?.token ?? current?.accessToken ?? null;
    const h = { "Content-Type": "application/json", ...extra };
    if (latestToken) h.Authorization = `Bearer ${latestToken}`;
    return h;
  }, []);

  // Theme & personalization
  const [showSettings, setShowSettings] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(localStorage.getItem('wb_primary') || '#10B981');
  const [bubbleRadius, setBubbleRadius] = useState(Number(localStorage.getItem('wb_bubble_radius') || 12));
  useEffect(() => { localStorage.setItem('wb_primary', primaryColor); }, [primaryColor]);
  useEffect(() => { localStorage.setItem('wb_bubble_radius', String(bubbleRadius)); }, [bubbleRadius]);
  
  // Charger les conversations avec retry
  const loadConversations = useCallback(async (retryCount = 0) => {
    setLoadError(null);
    setConversationsLoading(true);
    
    try {
      const res = await fetch(`${BASE}/api/conversations`, { headers: buildHeaders() });
      if (!res.ok) {
        if (res.status === 401) {
          setConversations([]);
          setLoadError('Non autorisé — connectez-vous');
          showToast('Session expirée, veuillez vous reconnecter', 'warning');
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const convs = Array.isArray(data) ? data : [];
      setConversations(convs);
      setFilteredConversations(convs);
      // Auto-select first conversation if none selected
      if (!selectedConv && convs.length > 0) {
        setSelectedConv(convs[0].id);
        setTimeout(() => { try { openConversation?.(convs[0].id); } catch (e) {} }, 0);
      }
      showToast('Conversations chargées', 'success');
    } catch (err) {
      console.error("Erreur chargement conversations:", err);
      setConversations([]);
      setLoadError('Erreur chargement conversations');
      
      // Retry automatique avec backoff exponentiel
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        showToast(`Nouvelle tentative dans ${delay/1000}s...`, 'warning');
        setTimeout(() => loadConversations(retryCount + 1), delay);
      } else {
        showToast('Impossible de charger les conversations', 'error');
      }
    } finally {
      setConversationsLoading(false);
    }
  }, [BASE, buildHeaders, showToast]);
  
  useEffect(() => {
    if (token) loadConversations();
  }, [token, loadConversations]);
  
  // Filtrage et tri des conversations
  const processedConversations = useMemo(() => {
    let filtered = [...conversations];
    
    // Recherche par nom/contenu
    if (conversationSearchQuery) {
      const query = conversationSearchQuery.toLowerCase();
      filtered = filtered.filter(conv => 
        (conv.partnerName || conv.title || '').toLowerCase().includes(query) ||
        (conv.lastMessage || '').toLowerCase().includes(query)
      );
    }
    
    // Filtrage par statut
    if (filterBy === 'unread') {
      filtered = filtered.filter(conv => unreadCounts[conv.id] > 0);
    } else if (filterBy === 'favorites') {
      filtered = filtered.filter(conv => conv.isFavorite);
    }
    
    // Tri
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
  
  // Search users avec debouncing amélioré
  const searchUsers = useCallback(async (q) => {
    if (!q) {
      setUserResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`${BASE}/api/users?query=${encodeURIComponent(q)}`, { headers: buildHeaders() });
      if (!res.ok) {
        setUserResults([]);
        showToast('Erreur lors de la recherche', 'error');
        return;
      }
        const data = await res.json();
      setUserResults(Array.isArray(data) ? data : []);
      } catch (err) {
      console.error('User search error', err);
      setUserResults([]);
      showToast('Erreur de connexion', 'error');
    } finally {
      setSearchLoading(false);
    }
  }, [BASE, buildHeaders, showToast]);
  
  // Start conversation
  const startConversation = useCallback(async () => {
    const partner = selectedUser?.id;
    if (!partner) {
      showToast('Veuillez sélectionner un contact', 'warning');
      return;
    }
    
    try {
      const res = await fetch(`${BASE}/api/conversations`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ partner_id: Number(partner), title: newTitle || null }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const conv = await res.json();
      
      const display = selectedUser?.name || `${selectedUser?.nom || ''} ${selectedUser?.prenom || ''}`.trim() || selectedUser?.email || null;
      const enriched = { ...conv, partnerName: display };
      setConversations(prev => [enriched, ...prev]);
      setShowStartModal(false);
      setUserSearchQuery('');
      setUserResults([]);
      setSelectedUser(null);
      setNewTitle('');
      setSelectedConv(conv.id);
      
      if (isMobile) {
        setShowMobileConversations(false);
      }
      
      showToast('Conversation créée', 'success');
      setTimeout(() => openConversation(conv.id), 50);
    } catch (e) {
      console.error('Error creating conversation', e);
      showToast('Impossible de démarrer la conversation', 'error');
    }
  }, [selectedUser, newTitle, BASE, buildHeaders, showToast, isMobile]);
  
  // Scroll helper
  const scrollToBottom = useCallback((behavior = "smooth") => {
    try {
      if (lastMsgRef.current) {
        lastMsgRef.current.scrollIntoView({ behavior, block: "end" });
      } else if (msgContainerRef.current) {
        msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight;
      }
    } catch (e) {
      // noop
    }
  }, []);

  // Open conversation avec gestion d'erreur
  const openConversation = useCallback(async (convId) => {
    setSelectedConv(convId);
    setLoading(true);
    setMessages([]);
    setLoadError(null);
    
    // Marquer comme lu
    setUnreadCounts(prev => ({ ...prev, [convId]: 0 }));
    
    if (isMobile) {
      setShowMobileConversations(false);
    }
    
    try {
      const res = await fetch(`${BASE}/api/messages/${convId}`, { headers: buildHeaders() });
      if (!res.ok) {
        if (res.status === 401) {
          setMessages([]);
          setLoadError('Non autorisé — connectez-vous');
          showToast('Session expirée', 'warning');
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      setTimeout(() => scrollToBottom("auto"), 50);
    } catch (err) {
      console.error("Erreur chargement messages:", err);
      setMessages([]);
      setLoadError('Erreur chargement messages');
      showToast('Impossible de charger les messages', 'error');
    } finally {
      setLoading(false);
    }
  }, [BASE, buildHeaders, showToast, scrollToBottom, isMobile]);
  
  // Send message avec retry
  const sendMessage = useCallback(async (retryCount = 0) => {
    if (!newMessage.trim() || !selectedConv || isSending) return;
    if (!currentUserId) {
      showToast("Veuillez vous connecter pour envoyer un message", 'warning');
      return;
    }

    setIsSending(true);

    const tmpId = `tmp-${Date.now()}`;
    const replyToId = replyToMessage?.id ?? null;
    const optimistic = {
      id: tmpId,
      conversationId: selectedConv,
      senderId: currentUserId,
      content: newMessage,
      createdAt: new Date().toISOString(),
      replyTo: replyToId,
      _optimistic: true,
    };

    // Optimistic update
    setMessages(prev => [...prev, optimistic]);
    setNewMessage("");
    // clear reply UI immediately (but remember for retry)
    const savedReply = replyToId;
    setReplyToMessage(null);
    setTimeout(() => scrollToBottom("smooth"), 50);

    try {
      const res = await fetch(`${BASE}/api/messages`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({
          conversationId: selectedConv,
          senderId: currentUserId,
          content: optimistic.content,
          createdAt: optimistic.createdAt,
          replyTo: replyToId,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Non autorisé');
        throw new Error(`Erreur envoi message: ${res.status}`);
      }

      const saved = await res.json();
      setMessages(prev => prev.map(m => m.id === tmpId ? saved : m));
      showToast('Message envoyé', 'success');
      setTimeout(() => scrollToBottom("smooth"), 50);
    } catch (err) {
      console.error("Erreur envoi:", err);
      setMessages(prev => prev.filter(m => m.id !== tmpId));

      // Retry automatique: restore message and replyTo
      if (retryCount < 2) {
        showToast(`Nouvelle tentative d'envoi...`, 'warning');
        setTimeout(() => {
          setNewMessage(optimistic.content);
          if (savedReply) setReplyToMessage({ id: savedReply, content: '(message référencé)' });
          sendMessage(retryCount + 1);
        }, 1000);
      } else {
        showToast("Échec de l'envoi du message", 'error');
        setNewMessage(optimistic.content); // Restore message
        if (savedReply) setReplyToMessage({ id: savedReply, content: '(message référencé)' });
      }
    } finally {
      setIsSending(false);
    }
  }, [newMessage, selectedConv, currentUserId, isSending, BASE, buildHeaders, showToast, scrollToBottom, replyToMessage]);
  
  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, scrollToBottom]);

  
  // Prefetch sender user info when messages change
  useEffect(() => {
    const ids = Array.from(new Set(messages.map(m => m.senderId).filter(Boolean)));
    ids.forEach(id => fetchUserIfNeeded(id));
  }, [messages, fetchUserIfNeeded]);
  
  // Handle external open requests
  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem('messagerie_open_with');
        if (!raw) return;
        const partner = JSON.parse(raw);
        if (!partner) return;
        setShowStartModal(true);
        setSelectedUser(partner);
        setUserSearchQuery(partner.name || '');
        localStorage.removeItem('messagerie_open_with');
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('open-messagerie', handler);
    return () => window.removeEventListener('open-messagerie', handler);
  }, []);
  
  // Sidebar des conversations
  const ConversationsSidebar = () => (
    <aside className={`${isMobile ? (showMobileConversations ? 'block' : 'hidden') : 'block'} ${
      isMobile ? 'w-full' : 'w-1/3'
    } border-r bg-gray-50 p-4 overflow-y-auto flex flex-col`}>
      {/* Header avec recherche */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h2 className="font-bold text-lg">📨 Messagerie</h2>
          {wsStatus === 'Connected' && <div className="w-2 h-2 bg-green-500 rounded-full" title="En ligne"></div>}
          {wsStatus === 'Disconnected' && <div className="w-2 h-2 bg-red-500 rounded-full" title="Hors ligne"></div>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(true)} className="text-sm px-3 py-1 border rounded">Apparence</button>
          <button 
            onClick={() => setShowStartModal(true)} 
            className="text-sm bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
          >
            Nouvelle
          </button>
        </div>
      </div>
      
      {/* Barre de recherche */}
      <SearchBar
        value={conversationSearchQuery}
        onChange={setConversationSearchQuery}
        placeholder="Rechercher une conversation..."
        className="mb-3"
      />
      
      {/* Filtres et tri */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <select 
          value={filterBy} 
          onChange={(e) => setFilterBy(e.target.value)}
          className="border rounded px-2 py-1 text-xs"
        >
          <option value="all">Toutes</option>
          <option value="unread">Non lues</option>
          <option value="favorites">Favorites</option>
        </select>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded px-2 py-1 text-xs"
        >
          <option value="recent">Récentes</option>
          <option value="name">Nom</option>
          <option value="unread">Non lues</option>
        </select>
      </div>
      
      {loadError && <div className="text-red-600 text-sm mb-2">{loadError}</div>}
      
      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversationsLoading ? (
          Array(5).fill().map((_, i) => <ConversationSkeleton key={i} />)
        ) : processedConversations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {conversationSearchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
          </p>
        ) : (
          processedConversations.map((c) => (
            <div
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`p-3 rounded cursor-pointer mb-2 transition-colors relative ${
                selectedConv === c.id ? "bg-emerald-100 border-l-4 border-emerald-600" : "hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold truncate flex-1">
                  {c.partnerName || c.title || "Vendeur"}
                </div>
                {unreadCounts[c.id] > 0 && (
                  <span className="bg-emerald-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {unreadCounts[c.id]}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 truncate mt-1">
                {c.lastMessage || "Pas de message"}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {c.lastMessageAt && new Date(c.lastMessageAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
      </aside>
  );
  
  // Zone de chat principal
  const ChatArea = () => {
    return (
      <main className={`${isMobile ? (showMobileConversations ? 'hidden' : 'block') : 'block'} flex-1 flex flex-col`}>
        {selectedConv ? (
          <>
            {/* Header conversation */}
            <div className="border-b p-3 flex items-center justify-between bg-white">
              <div className="flex items-center space-x-3">
                {isMobile && (
                  <button onClick={() => setShowMobileConversations(true)} className="text-gray-600 hover:text-gray-800">← Retour</button>
                )}
                <h3 className="font-bold">{processedConversations.find(c => c.id === selectedConv)?.partnerName || 'Conversation'}</h3>
              </div>
              <button
                onClick={() => { setSelectedConv(null); if (isMobile) setShowMobileConversations(true); }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ✖ Fermer
              </button>
            </div>

            {/* Messages */}
            <div ref={msgContainerRef} className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {loading ? (
                <div className="space-y-4">{Array(3).fill().map((_, i) => <MessageSkeleton key={i} isOwnMessage={i % 2 === 0} />)}</div>
              ) : messages.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Aucun message pour l'instant</p>
              ) : (
                messages.map((m, idx) => {
                  const isMine = m.senderId === currentUserId;
                  const isLast = idx === messages.length - 1;
                  const avatar = usersById[m.senderId]?.avatar || null;
                  const displayName = usersById[m.senderId]?.name || usersById[m.senderId]?.nom || 'U';
                  return (
                    <div key={m.id} className={`mb-3 flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex items-end space-x-3">
                        {!isMine && (
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm text-gray-600">
                            {avatar ? (
                              <img src={(avatar || '').startsWith('/uploads') ? `${BASE}${avatar}` : avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span>{String(displayName).charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        )}

                        <div
                          className={`px-3 py-2 rounded-lg max-w-xs lg:max-w-md xl:max-w-lg ${isMine ? 'bg-emerald-600 text-white' : 'bg-white shadow-sm'} ${m._optimistic ? 'opacity-75' : ''} ${newlyAddedIds.includes(m.id) ? 'msg-pop' : ''}`}
                          ref={isLast ? lastMsgRef : null}
                        >
                          {m.replyTo && (
                            <div className="mb-2 p-2 rounded border-l-4 border-gray-200 bg-gray-50 text-sm text-gray-600">
                              <em>En réponse à :</em>
                              <div className="truncate">{(messages.find(x => x.id === m.replyTo) || {}).content || '—'}</div>
                            </div>
                          )}

                          <div className="whitespace-pre-wrap break-words" dir="auto" style={{ unicodeBidi: 'plaintext', direction: 'ltr' }}>{normalizeText(m.content)}</div>
                          <div className={`text-[10px] mt-1 ${isMine ? 'text-emerald-100' : 'text-gray-500'}`}>
                            {new Date(m.createdAt).toLocaleTimeString()} {m._optimistic && ' • Envoi...'}
                          </div>

                          {/* Reactions */}
                          <div className="mt-2 flex items-center space-x-2">
                            <div className="flex items-center space-x-2">
                              {m.reactions && Object.entries(m.reactions).map(([emoji, count]) => (
                                <div key={emoji} className="text-sm px-2 py-1 bg-gray-100 rounded-full flex items-center space-x-1">
                                  <span>{emoji}</span>
                                  <span className="text-xs text-gray-600">{count}</span>
                                </div>
                              ))}
                            </div>

                            <div className="ml-2 flex items-center space-x-1">
                              <button onClick={() => setReplyToMessage(m)} className="text-xs text-gray-500 hover:text-gray-700">Répondre</button>
                              <button onClick={async () => {
                                const emoji = prompt('Entrez un emoji à ajouter (ex: 👍 ❤️)');
                                if (!emoji) return;
                                try {
                                  const res = await fetch(`${BASE}/api/messages/${m.id}/reactions`, { method: 'POST', headers: buildHeaders(), body: JSON.stringify({ emoji, action: 'add' }) });
                                  if (!res.ok) throw new Error('reaction failed');
                                  const rres = await fetch(`${BASE}/api/messages/${m.id}/reactions`, { headers: buildHeaders() });
                                  if (rres.ok) {
                                    const data = await rres.json();
                                    const map = {};
                                    (data || []).forEach(d => map[d.emoji] = d.count);
                                    setMessages(prev => prev.map(mm => mm.id === m.id ? { ...mm, reactions: map } : mm));
                                  }
                                } catch (e) { console.error('Reaction error', e); }
                              }} className="text-xs text-gray-500 hover:text-gray-700">Réagir</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">{typingUsers.map(u => u.name).join(', ')} est en train d'écrire...</div>
              )}
            </div>

            {/* Zone de saisie */}
            <div className="border-t bg-white p-3">
              {/* Bandeau réponse */}
              {replyToMessage && (
                <div className="mb-2 flex items-start justify-between rounded-md border-l-4 border-emerald-500 bg-emerald-50 p-2">
                  <div className="text-sm text-gray-700 pr-2">
                    <span className="font-medium">En réponse à: </span>
                    <span className="line-clamp-1 break-words">
                      {replyToMessage.content || 'Message'}
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyToMessage(null)}
                    className="ml-2 shrink-0 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Fermer
                  </button>
                </div>
              )}

              {/* Aperçu pièce jointe (si implémenté plus tard) */}
              {attachmentPreview && (
                <div className="mb-2 flex items-center justify-between rounded-md border bg-gray-50 p-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {attachmentPreview?.type?.startsWith('image/') ? (
                      <img
                        src={attachmentPreview.url}
                        alt={attachmentPreview.name || 'aperçu'}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
                        Fichier
                      </div>
                    )}
                    <div className="truncate text-sm text-gray-700">
                      {attachmentPreview.name || 'Pièce jointe'}
                    </div>
                  </div>
                  <button
                    onClick={() => { logSetAttachmentPreview(null); setAttachmentFile(null); }}
                    className="ml-2 shrink-0 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Supprimer
                  </button>
                </div>
              )}

              <div className="flex items-end gap-2">
                {/* Bouton pièce jointe */}
                <div>
                  <input
                    id="wb-file"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setAttachmentFile(file);
                      const url = URL.createObjectURL(file);
                      logSetAttachmentPreview({ url, type: file.type, name: file.name });
                    }}
                    accept="image/*,application/pdf"
                  />
                  <label
                    htmlFor="wb-file"
                    className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border text-gray-600 hover:bg-gray-50"
                    title="Ajouter une pièce jointe"
                  >
                    📎
                  </label>
                </div>

                {/* Zone de texte */}
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => logSetNewMessage(e.target.value)}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = 'auto';
                      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(0);
                      }
                    }}
                    autoFocus={!!selectedConv}
                    rows={1}
                    placeholder="Écrire un message..."
                    className="max-h-40 w-full resize-none rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 caret-emerald-600 text-gray-900 placeholder-gray-400"
                    style={{ minHeight: '40px', direction: 'ltr', unicodeBidi: 'plaintext' }}
                    dir="auto"
                    inputMode="text"
                    spellCheck={true}
                  />
                </div>

                {/* Bouton envoyer */}
                <button
                  onClick={() => sendMessage(0)}
                  disabled={!newMessage.trim() || isSending}
                  className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-white transition-colors ${
                    newMessage.trim() && !isSending
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  title="Envoyer"
                >
                  {isSending ? '...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center flex-1 text-gray-400 p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-medium mb-2">Sélectionnez une conversation</h3>
                <p className="text-sm">Choisissez une conversation pour commencer à discuter</p>
              </div>
            </div>
            {/* Zone de saisie désactivée quand aucune conversation */}
            <div className="border-t bg-white p-3 opacity-60">
              <div className="flex items-end gap-2">
                <label className="inline-flex h-10 w-10 items-center justify-center rounded-md border text-gray-400" title="Pièce jointe">
                  📎
                </label>
                <div className="flex-1">
                  <textarea
                    value={''}
                    disabled
                    rows={1}
                    placeholder="Sélectionnez une conversation pour écrire..."
                    className="max-h-40 w-full resize-none rounded-lg border px-3 py-2 bg-gray-100"
                  />
                </div>
                <button
                  disabled
                  className="inline-flex h-10 items-center justify-center rounded-md px-4 text-white bg-gray-400 cursor-not-allowed"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    );
  };
  
  return (
    <div className="flex h-screen bg-gray-100" style={{ ['--wb-primary']: primaryColor, ['--wb-bubble-radius']: `${bubbleRadius}px` }}>
      <ToastContainer toasts={toasts} />
      
      <ConversationsSidebar />
      <ChatArea />
      {/* message animation styles */}
      <style>{`@keyframes msgPop { from { transform: translateY(6px) scale(0.98); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } } .msg-pop { animation: msgPop 360ms cubic-bezier(.2,.9,.25,1); }`}</style>
      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40"><div className="bg-white p-4 rounded shadow max-w-sm w-full"><h3 className="font-bold mb-2">Apparence</h3><div className="mb-2"><label className="block text-sm">Couleur principale</label><input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} /></div><div className="mb-2"><label className="block text-sm">Rayon bulles</label><input type="range" min="4" max="24" value={bubbleRadius} onChange={(e) => setBubbleRadius(Number(e.target.value))} /></div><div className="flex justify-end space-x-2"><button onClick={() => setShowSettings(false)} className="px-3 py-1 border rounded">Fermer</button></div></div></div>
      )}
      
      {/* Modal nouvelle conversation */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-lg mb-4">Démarrer une conversation</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher un contact
              </label>
              <SearchBar
                value={userSearchQuery}
                onChange={(q) => {
                  setUserSearchQuery(q);
                  setSelectedUser(null);
                  if (!q.trim()) {
                    setUserResults([]);
                    return;
                  }
                  if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
                  searchTimerRef.current = setTimeout(() => searchUsers(q.trim()), 300);
                }}
                placeholder="Nom, prénom ou email"
              />
              
              {searchLoading && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin"></div>
                  <span>Recherche...</span>
                </div>
              )}
            </div>

            {/* Résultats de recherche */}
            {userResults.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Résultats de recherche
                </label>
                <ul className="border rounded-lg max-h-40 overflow-y-auto bg-gray-50">
                  {userResults.map((u) => (
                    <li 
                      key={u.id} 
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 transition-colors"
                      onClick={() => {
                        setSelectedUser(u);
                        const displayName = `${u.nom || ''} ${u.prenom || ''}`.trim();
                        setUserSearchQuery(displayName + (u.email ? ` (${u.email})` : ''));
                        setUserResults([]);
                      }}
                    >
                      <div className="font-medium text-gray-900">
                        {`${u.nom || ''} ${u.prenom || ''}`.trim() || 'Utilisateur'}
                      </div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                      {u.role && <div className="text-xs text-gray-400 capitalize">{u.role}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Utilisateur sélectionné */}
            {selectedUser && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact sélectionné
                </label>
                <div className="p-3 border rounded-lg bg-emerald-50 border-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedUser?.name || `${selectedUser?.nom || ''} ${selectedUser?.prenom || ''}`.trim() || selectedUser?.email}
                    </div>
                    {selectedUser?.email && (
                      <div className="text-sm text-gray-600">{selectedUser.email}</div>
                    )}
                  </div>
                  <button 
                    onClick={() => { 
                      setSelectedUser(null); 
                      setUserSearchQuery(''); 
                    }} 
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )}
            
            {/* Titre optionnel */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre (optionnel)
              </label>
              <input
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)} 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ex: Discussion produit X"
              />
            </div>
            
            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowStartModal(false);
                  setSelectedUser(null);
                  setUserSearchQuery('');
                  setUserResults([]);
                  setNewTitle('');
                  try { 
                    localStorage.removeItem('messagerie_open_with'); 
                  } catch (e) {}
                }} 
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  await startConversation();
                  try { 
                    localStorage.removeItem('messagerie_open_with'); 
                  } catch (e) {}
                }}
                disabled={!selectedUser}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  selectedUser 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Démarrer la conversation
              </button>
            </div>
          </div>
          </div>
        )}
    </div>
  );
}