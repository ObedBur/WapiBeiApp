// AdminDashboard.jsx
import React, { useEffect } from "react";
import authService from '../services/auth.service';
import { fetchWithAuth } from '../utils/api';

/*
  AdminDashboard - React + Tailwind
  Single-file admin page for WapiBei (mock data).
  Usage: import AdminDashboard from './pages/AdminDashboard';
  Route: /admin (ou selon ton router)
*/



function StatCard({ title, value, color = "bg-emerald-500", subtitle }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 min-w-[180px] hover:shadow-2xl transition-shadow">
      <div className={`inline-block px-3 py-2 rounded-md text-white ${color} font-bold`}>{title}</div>
      <div className="mt-4 text-3xl font-extrabold text-gray-800">{value}</div>
      {subtitle && <div className="mt-1 text-sm text-gray-500">{subtitle}</div>}
    </div>
  );
}

function TrendSparkline({ data = [], stroke = "#10B981" }) {
  if (!data.length) return null;
  const width = 200, height = 48;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [stats, setStats] = React.useState({ users: 0, products: 0, reports: 0, revenue: 0, usersTrend: [] });
  const [query, setQuery] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [dark, setDark] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
    const token = authService.getCurrentUser()?.token;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    // Fetch admin stats from backend
    (async () => {
      try {
        const resp = await fetch(`${BASE}/api/admin/stats`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const json = await resp.json();
        if (!mounted) return;
        setStats((prev) => ({ ...prev, users: json.usersCount || 0, products: json.productsCount || 0, reports: json.testimonialsCount || 0 }));
        // optional: fetch lists for users/products as before
        const usersRes = await fetchWithAuth(`${BASE}/api/users`).catch(() => []);
        const productsRes = await fetchWithAuth(`${BASE}/api/products`).catch(() => []);
        const usersList = Array.isArray(usersRes) ? usersRes : (usersRes && usersRes.data ? usersRes.data : []);
        const productsList = Array.isArray(productsRes) ? productsRes : (productsRes && productsRes.data ? productsRes.data : []);
        setUsers(usersList);
        setProducts(productsList);
      } catch (e) {
        console.error('Admin dashboard fetch error', e);
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const filteredUsers = users.filter(
    (u) => {
      const q = String(query || '').toLowerCase();
      const name = String(u?.name || u?.nom || '').toLowerCase();
      const email = String(u?.email || u?.mail || '').toLowerCase();
      const city = String(u?.city || u?.ville || '').toLowerCase();
      return name.includes(q) || email.includes(q) || city.includes(q);
    }
  );

  const handleToggleSuspend = (id) => {
    setUsers((prev) => prev.map(u => u.id === id ? { ...u, status: u.status === "suspended" ? "active" : "suspended" } : u));
  };

  const handleVerify = (id) => {
    setUsers((prev) => prev.map(u => u.id === id ? { ...u, verified: true } : u));
  };

  const handleDeleteUser = (id) => {
    if (!window.confirm("Supprimer cet utilisateur ? Cette action est irréversible.")) return;
    setUsers((prev) => prev.filter(u => u.id !== id));
    setSelectedUser(null);
  };

  const handleDeleteProduct = (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    setProducts((prev) => prev.filter(p => p.id !== id));
  };

  return (
    <div className={dark ? "min-h-screen bg-gray-900 text-gray-100" : "min-h-screen bg-gray-100 text-gray-900"}>
      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 w-72 md:w-80 bg-white ${dark ? "bg-gray-800" : ""} shadow-lg transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-200 z-30`}>
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-extrabold">WapiBei Admin</div>
                <div className="text-sm text-gray-500">Contrôle plateforme</div>
              </div>
              <button className="md:hidden" onClick={() => setSidebarOpen(false)}>✕</button>
            </div>

            <nav className="mt-8 space-y-3">
              <a className="block px-3 py-2 rounded-md hover:bg-gray-100" href="#dashboard">Dashboard</a>
              <a className="block px-3 py-2 rounded-md hover:bg-gray-100" href="#users">Utilisateurs</a>
              <a className="block px-3 py-2 rounded-md hover:bg-gray-100" href="#products">Produits</a>
              <a className="block px-3 py-2 rounded-md hover:bg-gray-100" href="#Boutiques">Boutiques Vendeurs</a>               
              <a className="block px-3 py-2 rounded-md hover:bg-gray-100" href="#reports">Signalements</a>
              <a className="block px-3 py-2 rounded-md hover:bg-gray-100" href="#settings">Paramètres</a>
            </nav>

            <div className="mt-8 pt-4 border-t text-sm text-gray-500">
              <div>Version: <strong>0.9 (MVP)</strong></div>
              <div className="mt-2">Connexion admin</div>
              <button role="">Deconnexion</button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 md:ml-72 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Topbar */}
          <header className={`flex items-center justify-between gap-4 p-6 border-b ${dark ? "border-gray-700" : "border-gray-200"} bg-opacity-90 backdrop-blur rounded-xl`}>
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 rounded-md" onClick={() => setSidebarOpen(true)}>☰</button>
              <div className="text-xl font-bold">Dashboard</div>
              <div className="hidden md:flex items-center gap-4 ml-6">
                <div className="text-sm text-gray-500">Plateforme: WapiBei</div>
                <div className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Production demo</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  aria-label="Recherche admin"
                  className="px-3 py-2 rounded-md border bg-white text-sm"
                  placeholder="Rechercher utilisateur, produit..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <span className="absolute right-2 top-2 text-gray-400 text-sm">🔎</span>
              </div>
              <button
                onClick={() => setDark(!dark)}
                className="px-3 py-2 rounded-md border bg-white text-sm"
                title="Basculer thème"
              >
                {dark ? "☀️" : "🌙"}
              </button>
              <div className="relative">
                <button className="px-3 py-2 rounded-md border bg-white text-sm">🔔 <span className="ml-1 text-xs text-gray-500">3</span></button>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border">
                <img alt="admin" src={`https://ui-avatars.com/api/?name=Admin&background=${dark ? "374151" : "10B981"}&color=fff`} className="w-8 h-8 rounded-full" />
                <div className="text-sm">Admin</div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-6 space-y-6">
            {/* Stats row */}
            <section id="dashboard" className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Utilisateurs" value={stats.users} subtitle="Total inscrits" color="bg-emerald-500" />
              <StatCard title="Produits" value={stats.products} subtitle="Produits publiés" color="bg-blue-500" />
              <div className="bg-white rounded-xl shadow p-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Tendances utilisateurs</div>
                  <div className="text-sm text-gray-500">7 derniers jours</div>
                </div>
                <div className="mt-3">
                  <TrendSparkline data={stats.usersTrend} />
                </div>
                <div className="mt-3 text-sm text-gray-500">Croissance régulière</div>
              </div>
              <StatCard title="Signalements" value={stats.reports} subtitle="A traiter" color="bg-yellow-500" />
            </section>
            

            {/* Users & Products Columns */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Users list */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Utilisateurs</h3>
                  <div className="text-sm text-gray-500">{filteredUsers.length} résultat{filteredUsers.length > 1 ? "s" : ""}</div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="text-sm text-gray-500 bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left font-medium">Nom</th>
                        <th className="py-3 px-4 text-left font-medium">Rôle</th>
                        <th className="py-3 px-4 text-left font-medium">Ville</th>
                        <th className="py-3 px-4 text-left font-medium">Vérifié</th>
                        <th className="py-3 px-4 text-left font-medium">Statut</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b last:border-b-0 hover:bg-gray-50">
                          <td className="py-3">
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </td>
                          <td className="py-3 capitalize">{u.role}</td>
                          <td className="py-3">{u.city}</td>
                          <td className="py-3">{u.verified ? "✅" : "—"}</td>
                          <td className="py-3">{u.status}</td>
                          <td className="py-3">
                            <div className="flex gap-2 items-center">
                              <button onClick={() => setSelectedUser(u)} className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50">Voir</button>
                              <button onClick={() => handleVerify(u.id)} className="px-3 py-1 text-sm bg-blue-50 text-blue-600 border border-blue-100 rounded-md hover:bg-blue-100">Vérifier</button>
                              <button onClick={() => handleToggleSuspend(u.id)} className="px-3 py-1 text-sm bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-md hover:bg-yellow-100">{u.status === "suspended" ? "Activer" : "Suspendre"}</button>
                              <button onClick={() => handleDeleteUser(u.id)} className="px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-100 rounded-md hover:bg-red-100">Suppr</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr><td colSpan="6" className="py-6 text-center text-gray-500">Aucun utilisateur trouvé</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Products small panel */}
              <div className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Produits récents</h3>
                  <a href="#products" className="text-sm text-emerald-600">Voir tout</a>
                </div>

                <div className="mt-4 space-y-3">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center justify-between border rounded p-3 hover:shadow">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.vendor} — {p.city}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{p.price}</div>
                        <div className="text-xs text-gray-500">{p.status}</div>
                        <div className="mt-2 flex gap-2 justify-end">
                          <button onClick={() => handleDeleteProduct(p.id)} className="px-2 py-1 text-sm border rounded text-red-600">Suppr</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Reports / Settings */}
            <section id="reports" className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Signalements récents</h3>
                <div className="text-sm text-gray-500">Modérer rapidement</div>
              </div>

              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 border rounded">
                    <div className="text-sm font-semibold">Produit signalé</div>
                    <div className="text-xs text-gray-500">Sucre 1kg — 2 signalements</div>
                    <div className="mt-2 flex gap-2">
                      <button className="px-2 py-1 border rounded">Voir</button>
                      <button className="px-2 py-1 border rounded text-red-600">Supprimer</button>
                    </div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-sm font-semibold">Vendeur signalé</div>
                    <div className="text-xs text-gray-500">Vendor X — Comportement</div>
                    <div className="mt-2 flex gap-2">
                      <button className="px-2 py-1 border rounded">Voir</button>
                      <button className="px-2 py-1 border rounded text-red-600">Suspendre</button>
                    </div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-sm font-semibold">Autre</div>
                    <div className="text-xs text-gray-500">Problème paiement</div>
                    <div className="mt-2 flex gap-2">
                      <button className="px-2 py-1 border rounded">Voir</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer small */}
            <footer className="text-center text-sm text-gray-500">
              WapiBei Admin • Prototype MVP • {new Date().getFullYear()}
            </footer>
          </main>
        </div>
      </div>

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                <div className="text-sm text-gray-500">{selectedUser.email}</div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-gray-500">✕</button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Rôle</div>
                <div className="font-medium capitalize">{selectedUser.role}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Ville</div>
                <div className="font-medium">{selectedUser.city}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Vérifié</div>
                <div className="font-medium">{selectedUser.verified ? "Oui" : "Non"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Statut</div>
                <div className="font-medium">{selectedUser.status}</div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              {!selectedUser.verified && <button onClick={() => handleVerify(selectedUser.id)} className="px-4 py-2 bg-emerald-600 text-white rounded">Vérifier</button>}
              <button onClick={() => handleToggleSuspend(selectedUser.id)} className="px-4 py-2 border rounded">{selectedUser.status === "suspended" ? "Activer" : "Suspendre"}</button>
              <button onClick={() => handleDeleteUser(selectedUser.id)} className="px-4 py-2 bg-red-50 text-red-600 border rounded">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
