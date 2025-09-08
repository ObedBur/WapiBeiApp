import React from 'react';
import { User as IconUser, Bell as IconBell, Lock as IconLock, HelpCircle as IconHelp, LogOut as IconLogOut } from '../../components/Icons';

export default function Parametres() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-2xl font-extrabold text-gray-800">Paramètres du compte</h2>
          <p className="text-sm text-gray-500 mt-1">Gérez vos préférences et paramètres de compte</p>
        </div>

        <div className="p-4 grid gap-3">
          <button className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-md"><IconUser /></span>
            <div className="text-left">
              <div className="font-medium text-gray-800">Modifier le profil</div>
              <div className="text-sm text-gray-500">Mettre à jour vos informations personnelles</div>
            </div>
          </button>

          <button className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-md"><IconBell /></span>
            <div className="text-left">
              <div className="font-medium text-gray-800">Notifications</div>
              <div className="text-sm text-gray-500">Configurez vos préférences de notification</div>
            </div>
          </button>

          <button className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
            <span className="p-2 bg-yellow-50 text-yellow-600 rounded-md"><IconLock /></span>
            <div className="text-left">
              <div className="font-medium text-gray-800">Confidentialité</div>
              <div className="text-sm text-gray-500">Paramètres de confidentialité et sécurité</div>
            </div>
          </button>

          <button className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-md"><IconHelp /></span>
            <div className="text-left">
              <div className="font-medium text-gray-800">Aide & Support</div>
              <div className="text-sm text-gray-500">Consultez la documentation ou contactez le support</div>
            </div>
          </button>

          <div className="mt-2 border-t pt-3">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition"><IconLogOut /> Se déconnecter</button>
          </div>
        </div>
      </div>
    </div>
  );
}


