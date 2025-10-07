import { useState, useRef, useEffect, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = `${Date.now()}-${++idRef.current}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);
  return { toasts, showToast };
};

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    try { return window.matchMedia(query).matches; } catch (e) { return false; }
  });
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    else if (mql.addListener) mql.addListener(onChange);
    setMatches(mql.matches);
    return () => { try { if (mql.removeEventListener) mql.removeEventListener('change', onChange); else if (mql.removeListener) mql.removeListener(onChange); } catch (e) {} };
  }, [query]);
  return matches;
};

export const useWebSocket = (currentUserId, onMessage) => {
  const ws = useRef(null);
  const reconnectRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const sendRef = useRef((payload) => {});

  useEffect(() => {
    const enabled = import.meta.env.VITE_ENABLE_WS === 'true';
    if (!enabled) { setConnectionStatus('Disabled'); return; }
    if (!currentUserId) { setConnectionStatus('Disconnected'); return; }
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
        ws.current.onopen = () => { reconnectRef.current = 0; setConnectionStatus('Connected'); sendRef.current = (p) => { try { if (ws.current && ws.current.readyState === WebSocket.OPEN) ws.current.send(JSON.stringify(p)); } catch (e) {} }; };
        ws.current.onmessage = (event) => { try { const message = JSON.parse(event.data); onMessage(message); } catch (e) { console.warn('WS parse error', e); } };
        ws.current.onclose = () => { if (cancelled) return; setConnectionStatus('Disconnected'); sendRef.current = () => {}; reconnectRef.current += 1; const delay = Math.min(3000 * Math.pow(2, reconnectRef.current - 1), 30000); reconnectTimerRef.current = setTimeout(connectWS, delay); };
        ws.current.onerror = (err) => { console.warn('WebSocket error', err); setConnectionStatus('Error'); };
      } catch (err) { console.warn('WebSocket connection failed:', err); reconnectRef.current += 1; const delay = Math.min(3000 * Math.pow(2, reconnectRef.current - 1), 30000); reconnectTimerRef.current = setTimeout(connectWS, delay); }
    };
    connectWS();
    return () => { cancelled = true; if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current); if (ws.current) { try { ws.current.close(); } catch (e) {} } };
  }, [currentUserId, onMessage]);

  const send = useCallback((payload) => sendRef.current(payload), []);
  return [connectionStatus, send];
}; 