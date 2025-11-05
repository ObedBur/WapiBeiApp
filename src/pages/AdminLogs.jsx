import React from 'react';

export default function AdminLogs() {
  // simple viewer: shows vendor clicks events and basic logs (from local files)
  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      try {
        const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
        const res = await fetch(`${BASE}/api/vendor-click/events`);
        const json = await res.json();
        setEvents(json.events || []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Logs & Événements</h2>
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-2">Derniers clics Devenir vendeur</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          {events.slice().reverse().map((e, i) => <li key={i}>{e.ts}</li>)}
        </ul>
      </div>
    </div>
  );
}


