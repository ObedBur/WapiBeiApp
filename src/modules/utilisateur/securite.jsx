import React, { useState, useEffect } from "react";
import authService from '../../services/auth.service';
import { fetchWithAuth } from '../../utils/api';

import {
  Lock,
  Shield,
  Eye,
  Globe,
  Mail,
  CheckCircle,
  LogOut,
} from "../../components/Icons";
import { Phone } from "lucide-react";

export default function Securite() {
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [recovery, setRecovery] = useState({
    email: "",
    phone: "",
  });
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // Try to prefill from auth data or backend; leave empty if none
    (async () => {
      try {
        const current = authService.getCurrentUser && authService.getCurrentUser();
        const userId = current?.user?.id ?? current?.id ?? null;

        const emailFromAuth = current?.user?.email ?? current?.email ?? '';
        const phoneFromAuth = current?.user?.telephone ?? current?.telephone ?? '';

        if (emailFromAuth || phoneFromAuth) {
          setRecovery({ email: emailFromAuth || '', phone: phoneFromAuth || '' });
        } else if (userId) {
          // fallback: try seller profile endpoint if available
          try {
            const seller = await fetchWithAuth(`/api/sellers/${userId}`);
            setRecovery({
              email: seller?.email || '',
              phone: seller?.telephone || seller?.telephone || '',
            });
            if (Array.isArray(seller?.sessions)) setSessions(seller.sessions);
          } catch (err) {
            // leave fields empty if endpoint not present or fails
          }
        }
      } catch (err) {
        // ignore and keep fields empty
      }
    })();
  }, []);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      alert("Veuillez compléter tous les champs.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      alert("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    // call API to change password
    alert("Mot de passe mis à jour (simulation).");
    setPasswords({ current: "", next: "", confirm: "" });
  };

  const handleToggle2FA = () => {
    // Ideally open a modal / verification flow. Here we toggle for demo.
    setTwoFAEnabled((v) => !v);
  };

  const handleSignOutSession = (id) => {
    if (!confirm("Déconnecter cette session ?")) return;
    setSessions((s) => s.filter((sess) => sess.id !== id));
  };

  const handleSignOutAll = () => {
    if (!confirm("Déconnecter toutes les autres sessions ?")) return;
    setSessions((s) => s.filter((sess) => sess.current));
  };

  const handleRemoveRecovery = (key) => {
    if (!confirm("Supprimer cette méthode de récupération ?")) return;
    setRecovery((r) => ({ ...r, [key]: "" }));
  };

  const handleDeleteAccount = () => {
    if (
      !confirm(
        "Cette action est irréversible. Confirmez-vous la suppression de votre compte ?"
      )
    )
      return;
    // call API to delete account
    alert("Compte supprimé (simulation).");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-2xl font-extrabold text-gray-800">Sécurité</h2>
          <p className="text-sm text-gray-500 mt-1">
            Protégez votre compte et gérez l'accès.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Password change */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-md">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Mot de passe
                </h3>
                <p className="text-sm text-gray-600">
                  Changez votre mot de passe régulièrement pour plus de
                  sécurité.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="form-label">Mot de passe actuel</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({ ...passwords, current: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Nouveau mot de passe</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={passwords.next}
                    onChange={(e) =>
                      setPasswords({ ...passwords, next: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Confirmer le mot de passe</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={() => setShowPasswords((v) => !v)}
                  />
                  <span>Afficher les mots de passe</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </form>
          </section>

          {/* Two-factor auth */}
          <section className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 rounded-md">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Authentification à deux facteurs (2FA)
                </h3>
                <p className="text-sm text-gray-600">
                  Ajoutez une couche supplémentaire pour protéger votre compte.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-medium text-gray-900">
                  {twoFAEnabled ? "2FA activée" : "2FA désactivée"}
                </div>
                <div className="text-sm text-gray-600">
                  {twoFAEnabled
                    ? "Vous utilisez une méthode d'authentification supplémentaire."
                    : "Nous recommandons d'activer la 2FA pour une meilleure sécurité."}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggle2FA}
                  className={`px-4 py-2 rounded-lg transition ${
                    twoFAEnabled
                      ? "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {twoFAEnabled ? "Gérer" : "Activer"}
                </button>
              </div>
            </div>
          </section>

          {/* Recovery methods */}
          <section className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-md">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Méthodes de récupération
                </h3>
                <p className="text-sm text-gray-600">
                  Email et téléphone utilisés pour récupérer l'accès au compte.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Email de secours</div>
                  <div className="text-sm text-gray-600">
                    {recovery.email || "Aucun email configuré"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {recovery.email ? (
                    <>
                      <button
                        onClick={() => alert("Modifier l'email (simulation)")}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleRemoveRecovery("email")}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        Supprimer
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => alert("Ajouter un email (simulation)")}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Ajouter
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Téléphone</div>
                  <div className="text-sm text-gray-600">
                    {recovery.phone || "Aucun téléphone configuré"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {recovery.phone ? (
                    <>
                      <button
                        onClick={() => alert("Modifier le téléphone (simulation)")}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleRemoveRecovery("phone")}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        Supprimer
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => alert("Ajouter un téléphone (simulation)")}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Ajouter
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Active sessions */}
          <section className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-md">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sessions</h3>
                <p className="text-sm text-gray-600">
                  Les appareils connectés à votre compte récemment.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    s.current ? "bg-emerald-50 border border-emerald-100" : "bg-gray-50"
                  }`}
                >
                  <div>
                    <div className="font-medium text-gray-900">{s.device}</div>
                    <div className="text-sm text-gray-600">
                      {s.location} • {s.ip} • {s.recent}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!s.current && (
                      <button
                        onClick={() => handleSignOutSession(s.id)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Déconnecter
                      </button>
                    )}
                    {s.current && (
                      <span className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-emerald-100 rounded-lg text-emerald-700">
                        <CheckCircle className="w-4 h-4" /> Actuel
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  onClick={handleSignOutAll}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  Déconnecter les autres sessions
                </button>
              </div>
            </div>
          </section>

          {/* Security tips & delete */}
          <section className="space-y-4 border-t pt-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-50 rounded-md">
                <Eye className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Conseils</h3>
                <p className="text-sm text-gray-600">
                  Utilisez un mot de passe long, unique, et activez la 2FA.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Supprimer votre compte entraînera la perte définitive de vos données.
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => alert("Exporter les données (simulation)")}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Exporter mes données
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Supprimer le compte
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}