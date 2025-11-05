import React, { useState, useRef, useEffect } from 'react';
import { useToast } from './hooks';

export default function MessageInput({ selectedConv = null, onSend = () => {}, replyToMessage = null, onReplyCancel = () => {}, isSending = false }) {
  const [newMessage, setNewMessage] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const textareaRef = useRef(null);
  const prevUrlRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    const handler = (e) => {
      if (e?.detail?.message) setNewMessage(e.detail.message);
      if (e?.detail?.focus) textareaRef.current?.focus();
    };
    window.addEventListener('set-input-message', handler);
    window.addEventListener('focus-input', handler);
    return () => {
      window.removeEventListener('set-input-message', handler);
      window.removeEventListener('focus-input', handler);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) {
        try { URL.revokeObjectURL(prevUrlRef.current); } catch (e) {}
        prevUrlRef.current = null;
      }
    };
  }, []);

  const normalizeText = (text) => {
    if (typeof text !== 'string') return text;
    try { return text.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, ''); } catch (e) { return text; }
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_MIMES = ['image/', 'application/pdf'];

  const removeAttachment = () => {
    if (prevUrlRef.current) {
      try { URL.revokeObjectURL(prevUrlRef.current); } catch (e) {}
      prevUrlRef.current = null;
    }
    setAttachmentPreview(null);
    setAttachmentFile(null);
    setUploadError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      const msg = `Fichier trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024} Mo)`;
      setUploadError(msg);
      showToast && showToast(msg, 'error');
      e.target.value = '';
      return;
    }

    const ok = ALLOWED_MIMES.some((m) => file.type.startsWith(m));
    if (!ok) {
      const msg = 'Type de fichier non autorisé (images et PDF seulement)';
      setUploadError(msg);
      showToast && showToast(msg, 'error');
      e.target.value = '';
      return;
    }

    setUploadError(null);
    if (prevUrlRef.current) {
      try { URL.revokeObjectURL(prevUrlRef.current); } catch (e) {}
      prevUrlRef.current = null;
    }
    const url = URL.createObjectURL(file);
    prevUrlRef.current = url;
    setAttachmentFile(file);
    setAttachmentPreview({ url, type: file.type, name: file.name });
  };

  return (
    <div className="border-t bg-white p-3">
      {replyToMessage && (
        <div className="mb-2 flex items-start justify-between rounded-md border-l-4 border-emerald-500 bg-emerald-50 p-2">
          <div className="text-sm text-gray-700 pr-2">
            <span className="font-medium">En réponse à: </span>
            <span className="line-clamp-1 break-words">{replyToMessage.content || 'Message'}</span>
          </div>
          <button onClick={onReplyCancel} className="ml-2 shrink-0 text-xs text-gray-500 hover:text-gray-700">Fermer</button>
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
          <button onClick={removeAttachment} className="ml-2 shrink-0 text-xs text-gray-500 hover:text-gray-700">Supprimer</button>
        </div>
      )}

      {uploadError && (
        <div className="text-red-600 text-sm mt-2" role="alert" aria-live="assertive">{uploadError}</div>
      )}

      <div className="flex items-end gap-2">
        <div>
          <input id="wb-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
          <label htmlFor="wb-file" className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border text-gray-600 hover:bg-gray-50" title="Ajouter une pièce jointe">📎</label>
        </div>

        <div className="flex-1">
          <textarea ref={textareaRef} value={newMessage} onChange={(e) => setNewMessage(normalizeText(e.target.value))} onInput={(e) => { const el = e.currentTarget; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 160) + 'px'; }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (selectedConv) { onSend(newMessage); setNewMessage(''); } } }} autoFocus={!!selectedConv} rows={1} placeholder="Écrire un message..." className="max-h-40 w-full resize-none rounded-lg border px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 caret-emerald-600 text-gray-900 placeholder-gray-400" style={{ minHeight: '40px', direction: 'ltr', unicodeBidi: 'plaintext' }} dir="auto" inputMode="text" spellCheck={true} />
        </div>

        <button onClick={() => { if (selectedConv) { onSend(newMessage); setNewMessage(''); } }} disabled={!newMessage.trim() || isSending} className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-white transition-colors ${newMessage.trim() && !isSending ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400 cursor-not-allowed'}`} title="Envoyer">{isSending ? '...' : 'Envoyer'}</button>
      </div>
    </div>
  );
} 