import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import authService from '../../services/auth.service';
import { fetchWithAuth, postJson } from '../../utils/api';
import { useToast, useMediaQuery, useWebSocket } from './hooks';

export default function ChatArea({ selectedConv: selectedConvProp = null }) {
  const [selectedConv, setSelectedConv] = useState(selectedConvProp);
  useEffect(() => { if (selectedConvProp) setSelectedConv(selectedConvProp); }, [selectedConvProp]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  const textareaRef = useRef(null);
  const msgContainerRef = useRef(null);
  const lastMsgRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const prevUrlRef = useRef(null);

  const { toasts, showToast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const rawUser = authService.getCurrentUser();
  const currentUserId =
    rawUser?.id ?? rawUser?.user?.id ?? rawUser?.data?.id ?? rawUser?.userId ?? null;

  const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) {
        try { URL.revokeObjectURL(prevUrlRef.current); } catch (e) {}
        prevUrlRef.current = null;
      }
    };
  }, []);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_MIMES = ['image/', 'application/pdf'];

  const handleFileSelection = (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      const msg = `Fichier trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024} Mo)`;
      setUploadError(msg);
      showToast && showToast(msg, 'error');
      return;
    }
    const ok = ALLOWED_MIMES.some((m) => file.type.startsWith(m));
    if (!ok) {
      const msg = 'Type de fichier non autorisé (images et PDF seulement)';
      setUploadError(msg);
      showToast && showToast(msg, 'error');
      return;
    }
    setUploadError(null);
    if (prevUrlRef.current) { try { URL.revokeObjectURL(prevUrlRef.current); } catch (e) {} prevUrlRef.current = null; }
    const url = URL.createObjectURL(file);
    prevUrlRef.current = url;
    setAttachmentFile(file);
    setAttachmentPreview({ url, type: file.type, name: file.name });
  };

  // WebSocket handler
  const handleNewMessage = useCallback(
    (message) => {
      if (!message) return;
      if (message.type === 'typing') {
        const { conversationId, user, typing } = message;
        if (conversationId !== selectedConv) return;
        setTypingUsers((prev) => {
          const exists = prev.some((u) => u.id === user.id);
          if (typing && !exists) return [...prev, user];
          if (!typing && exists) return prev.filter((u) => u.id !== user.id);
          return prev;
        });
        return;
      }

      if (message.conversationId === selectedConv) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        showToast && showToast('Nouveau message reçu', 'info');
      }
    },
    [selectedConv, showToast]
  );

  const [wsStatus, wsSend] = useWebSocket(currentUserId, handleNewMessage);

  // Open conversation on event
  useEffect(() => {
    const handler = (e) => {
      try {
        const id = e?.detail?.id;
        if (id) openConversation(id);
      } catch (err) {}
    };
    window.addEventListener('open-conversation', handler);
    return () => window.removeEventListener('open-conversation', handler);
  }, []);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    try {
      if (lastMsgRef.current) lastMsgRef.current.scrollIntoView({ behavior, block: 'end' });
      else if (msgContainerRef.current) msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight;
    } catch (e) {}
  }, []);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      try {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 160) + 'px';
      } catch (e) {}
    }
  }, [selectedConv]);

  const openConversation = useCallback(
    async (convId) => {
      setSelectedConv(convId);
      setLoading(true);
      setMessages([]);

      try {
        const data = await fetchWithAuth(`${BASE}/api/messages/${convId}`);
        setMessages(Array.isArray(data) ? data : []);
        setTimeout(() => scrollToBottom('auto'), 50);
      } catch (err) {
        if (err?.status === 401) {
          setMessages([]);
          showToast && showToast('Session expirée', 'warning');
          return;
        }
        console.error('Erreur chargement messages', err);
      } finally {
        setLoading(false);
      }
    },
    [BASE, scrollToBottom, showToast]
  );

  // typing events via ws
  useEffect(() => {
    if (!wsSend || !selectedConv) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    const user = authService.getCurrentUser();
    const name =
      user?.user?.nom || user?.nom || user?.user?.prenom || user?.prenom || user?.email || 'Vous';
    wsSend({ type: 'typing', conversationId: selectedConv, user: { id: currentUserId, name }, typing: true });
    typingTimeoutRef.current = setTimeout(() => {
      wsSend({ type: 'typing', conversationId: selectedConv, user: { id: currentUserId, name }, typing: false });
    }, 1500);
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [newMessage, wsSend, selectedConv, currentUserId]);

  const normalizeText = useCallback((text) => {
    if (typeof text !== 'string') return text;
    try { return text.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, ''); } catch (e) { return text; }
  }, []);

  // send message content (used by external MessageInput via event)
  const sendMessageContent = useCallback(
    async (content, retryCount = 0) => {
      if (!content || !content.trim() || !selectedConv || isSending) return;
      if (!currentUserId) { showToast && showToast('Veuillez vous connecter pour envoyer un message', 'warning'); return; }
      setIsSending(true);

      const tmpId = `tmp-${Date.now()}`;
      const replyToId = replyToMessage?.id ?? null;
      const optimistic = {
        id: tmpId,
        conversationId: selectedConv,
        senderId: currentUserId,
        content,
        createdAt: new Date().toISOString(),
        replyTo: replyToId,
        _optimistic: true,
      };

      setMessages((prev) => [...prev, optimistic]);
      // do not clear external input here
      const savedReply = replyToId;
      setReplyToMessage(null);
      setTimeout(() => scrollToBottom('smooth'), 50);

      try {
        const saved = await postJson(`${BASE}/api/messages`, {
          conversationId: selectedConv,
          senderId: currentUserId,
          content: optimistic.content,
          createdAt: optimistic.createdAt,
          replyTo: replyToId,
        });
        setMessages((prev) => prev.map((m) => (m.id === tmpId ? saved : m)));
        showToast && showToast('Message envoyé', 'success');
        setTimeout(() => scrollToBottom('smooth'), 50);
      } catch (err) {
        console.error('Erreur envoi:', err);
        setMessages((prev) => prev.filter((m) => m.id !== tmpId));
        if (retryCount < 2) {
          showToast && showToast(`Nouvelle tentative d'envoi...`, 'warning');
          setTimeout(() => {
            // emit event to set input value back
            window.dispatchEvent(new CustomEvent('set-input-message', { detail: { message: optimistic.content } }));
            if (savedReply) setReplyToMessage({ id: savedReply, content: '(message référencé)' });
            sendMessageContent(optimistic.content, retryCount + 1);
          }, 1000);
        } else {
          showToast && showToast("Échec de l'envoi du message", 'error');
          window.dispatchEvent(new CustomEvent('set-input-message', { detail: { message: optimistic.content } }));
          if (savedReply) setReplyToMessage({ id: savedReply, content: '(message référencé)' });
        }
      } finally {
        setIsSending(false);
      }
    },
    [selectedConv, isSending, currentUserId, replyToMessage, BASE, showToast, scrollToBottom]
  );

  // keep old sendMessage wrapper for internal usage
  const sendMessage = useCallback(
    (retryCount = 0) => sendMessageContent(newMessage, retryCount),
    [newMessage, sendMessageContent]
  );

  // listen for outgoing-message events from MessageInput
  useEffect(() => {
    const handler = (e) => {
      try {
        const content = e?.detail?.content;
        if (content) sendMessageContent(content, 0);
      } catch (err) {}
    };
    window.addEventListener('outgoing-message', handler);
    return () => window.removeEventListener('outgoing-message', handler);
  }, [sendMessageContent]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, scrollToBottom]);

  return (
    <main className="flex-1 flex flex-col">
      {selectedConv ? (
        <>
          <div className="border-b p-3 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-3">
              <h3 className="font-bold">Conversation</h3>
            </div>
          </div>

          <div ref={msgContainerRef} className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {loading ? (
              <div className="space-y-4">
                {Array(3)
                  .fill()
                  .map((_, i) => (
                    <div key={i} className="mb-3 flex animate-pulse justify-start">
                      <div className="px-3 py-2 rounded-lg max-w-xs bg-gray-200">
                        <div className="h-4 bg-gray-400 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-gray-400 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : messages.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Aucun message pour l'instant</p>
            ) : (
              messages.map((m, idx) => {
                const isMine = m.senderId === currentUserId;
                const isLast = idx === messages.length - 1;
                return (
                  <div key={m.id} className={`mb-3 flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex items-end space-x-3">
                      {!isMine && (
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm text-gray-600">
                          <span>{String((m.senderName || 'U')).charAt(0).toUpperCase()}</span>
                        </div>
                      )}

                      <div className={`px-3 py-2 rounded-lg max-w-xs lg:max-w-md xl:max-w-lg ${isMine ? 'bg-emerald-600 text-white' : 'bg-white shadow-sm'} ${m._optimistic ? 'opacity-75' : ''} ${''}`} ref={isLast ? lastMsgRef : null}>
                        {m.replyTo && (
                          <div className="mb-2 p-2 rounded border-l-4 border-gray-200 bg-gray-50 text-sm text-gray-600">
                            <em>En réponse à :</em>
                            <div className="truncate">{(messages.find((x) => x.id === m.replyTo) || {}).content || '—'}</div>
                          </div>
                        )}

                        <div className="whitespace-pre-wrap break-words" dir="auto" style={{ unicodeBidi: 'plaintext', direction: 'ltr' }}>
                          {normalizeText(m.content)}
                        </div>
                        <div className={`text-[10px] mt-1 ${isMine ? 'text-emerald-100' : 'text-gray-500'}`}>
                          {new Date(m.createdAt).toLocaleTimeString()} {m._optimistic && ' • Envoi...'}
                        </div>

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
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {typingUsers.length > 0 && (
              <div className="mt-2 text-sm text-gray-500">{typingUsers.map((u) => u.name).join(', ')} est en train d'écrire...</div>
            )}
          </div>

          <div className="border-t bg-white p-3">
            {replyToMessage && (
              <div className="mb-2 flex items-start justify-between rounded-md border-l-4 border-emerald-500 bg-emerald-50 p-2">
                <div className="text-sm text-gray-700 pr-2">
                  <span className="font-medium">En réponse à: </span>
                  <span className="line-clamp-1 break-words">{replyToMessage.content || 'Message'}</span>
                </div>
                <button onClick={() => setReplyToMessage(null)} className="ml-2 shrink-0 text-xs text-gray-500 hover:text-gray-700">Fermer</button>
              </div>
            )}

            {attachmentPreview && (
              <div className="mb-2 flex items-center justify-between rounded-md border bg-gray-50 p-2">
                <div className="flex items-center gap-2 min-w-0">
                  {attachmentPreview?.type?.startsWith('image/') ? (
                    <img src={attachmentPreview.url} alt={attachmentPreview.name || 'aperçu'} className="h-12 w-12 rounded object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center text-gray-600 text-xs">Fichier</div>
                  )}
                  <div className="truncate text-sm text-gray-700">{attachmentPreview.name || 'Pièce jointe'}</div>
                </div>
                <button onClick={() => { if (prevUrlRef.current) { try { URL.revokeObjectURL(prevUrlRef.current); } catch (e) {} prevUrlRef.current = null; } setAttachmentPreview(null); setAttachmentFile(null); setUploadError(null); }} className="ml-2 shrink-0 text-xs text-gray-500 hover:text-gray-700">Supprimer</button>
              </div>
            )}

            {uploadError && (
              <div className="text-red-600 text-sm mt-2" role="alert" aria-live="assertive">{uploadError}</div>
            )}

            <div className="flex items-end gap-2">
              <div>
                <input id="wb-file" type="file" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; handleFileSelection(file); }} accept="image/*,application/pdf" />
                <label htmlFor="wb-file" className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border text-gray-600 hover:bg-gray-50" title="Ajouter une pièce jointe">📎</label>
              </div>

              <div className="flex-1">
                <textarea ref={textareaRef} value={newMessage} onChange={(e) => setNewMessage(normalizeText(e.target.value))} onInput={(e) => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 160) + 'px'; }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(0); } }} autoFocus={!!selectedConv} rows={1} placeholder="Écrire un message..." className="max-h-40 w-full resize-none rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 caret-emerald-600 text-gray-900 placeholder-gray-400" style={{ minHeight: '40px', direction: 'ltr', unicodeBidi: 'plaintext' }} dir="auto" inputMode="text" spellCheck={true} />
              </div>

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

          <div className="border-t bg-white p-3">
            <div className="flex items-end gap-2">
              <label className="inline-flex h-10 w-10 items-center justify-center rounded-md border text-gray-400" title="Pièce jointe">📎</label>
              <div className="flex-1">
                <textarea value={newMessage} onChange={(e) => setNewMessage(normalizeText(e.target.value))} onInput={(e) => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 160) + 'px'; }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!newMessage.trim()) { showToast && showToast('Écrire un message avant d\'envoyer', 'warning'); return; } window.dispatchEvent(new CustomEvent('open-start-modal', { detail: { message: newMessage } })); showToast && showToast('Sélectionnez un contact pour envoyer le message', 'info'); setNewMessage(''); } }} rows={1} placeholder="Écrire un message..." className="max-h-40 w-full resize-none rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 caret-emerald-600 text-gray-900 placeholder-gray-400" style={{ minHeight: '40px', direction: 'ltr', unicodeBidi: 'plaintext' }} dir="auto" inputMode="text" spellCheck={true} />
              </div>

              <button onClick={() => {
                if (!newMessage.trim()) { showToast && showToast('Écrire un message avant d\'envoyer', 'warning'); return; }
                window.dispatchEvent(new CustomEvent('open-start-modal', { detail: { message: newMessage } }));
                showToast && showToast('Sélectionnez un contact pour envoyer le message', 'info');
                setNewMessage('');
              }} className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-white bg-emerald-600 hover:bg-emerald-700`} title="Envoyer">Envoyer</button>
            </div>
          </div>
        </>
      )}
    </main>
  );
} 