import { WebSocketServer } from 'ws';

// Map of conversationId -> Set of WebSocket clients
const conversationClients = new Map();

export function initWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    try {
      const url = req.url || '';
      const params = new URLSearchParams(url.split('?')[1]);
      const conversationId = params.get('conversationId') || params.get('convId') || null;
      const userId = params.get('userId') || params.get('userid') || null;

      if (conversationId) {
        let set = conversationClients.get(conversationId);
        if (!set) {
          set = new Set();
          conversationClients.set(conversationId, set);
        }
        set.add(ws);
        ws._conversationId = conversationId;
      }
      if (userId) ws._userId = userId;

      ws.on('message', (raw) => {
        try {
          const payload = JSON.parse(raw.toString());
          // Allow clients to subscribe dynamically
          if (payload?.type === 'subscribe' && payload?.conversationId) {
            const cId = String(payload.conversationId);
            let set = conversationClients.get(cId);
            if (!set) { set = new Set(); conversationClients.set(cId, set); }
            set.add(ws);
            ws._conversationId = cId;
          }
        } catch (e) {
          // ignore invalid JSON
        }
      });

      ws.on('close', () => {
        const cId = ws._conversationId;
        if (cId) {
          const set = conversationClients.get(cId);
          if (set) { set.delete(ws); if (set.size === 0) conversationClients.delete(cId); }
        }
      });
    } catch (err) {
      console.error('WS connection error', err);
    }
  });

  console.log('WebSocket server initialized');
  return wss;
}

export function broadcastMessage(message) {
  try {
    const cId = String(message.conversationId);
    const set = conversationClients.get(cId);
    const payload = JSON.stringify({ type: 'message', payload: message });
    if (set) {
      for (const client of set) {
        if (client && client.readyState === 1) {
          client.send(payload);
        }
      }
    }
  } catch (err) {
    console.error('broadcastMessage error', err);
  }
}

export function broadcastTyping({ conversationId, userId, isTyping }) {
  try {
    const cId = String(conversationId);
    const set = conversationClients.get(cId);
    const payload = JSON.stringify({ type: 'typing', payload: { conversationId: cId, userId, isTyping } });
    if (set) {
      for (const client of set) {
        // optionally skip sender
        if (client && client.readyState === 1 && String(client._userId) !== String(userId)) {
          client.send(payload);
        }
      }
    }
  } catch (err) {
    console.error('broadcastTyping error', err);
  }
} 