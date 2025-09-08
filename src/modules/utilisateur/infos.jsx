import React from 'react';

export default function Infos({ seller = {} }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">Informations du vendeur</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600">Nom</label>
            <input readOnly value={seller.name ?? ''} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2 bg-white" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <input readOnly value={seller.email ?? ''} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2 bg-white" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Téléphone</label>
            <input readOnly value={seller.telephone ?? ''} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2 bg-white" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Localisation</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600">Ville</label>
            <input readOnly value={seller.ville ?? ''} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2 bg-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Pays</label>
            <input readOnly value={seller.pays ?? ''} className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2 bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
