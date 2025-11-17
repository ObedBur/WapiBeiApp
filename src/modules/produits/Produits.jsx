// React modern products page with "Lancer vos produits" button
import React from 'react';
import { Plus, Rocket, Package, Edit, Trash2, Eye, Heart } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function ProduitsModern({ products = [], onAddProduct }) {
  const navigate = useNavigate();

  const handleLancerProduits = () => {
    navigate('/paiement');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">

      {/* TOP RIGHT BUTTON → Lancer vos produits */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleLancerProduits}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 active:scale-95 transition-all font-semibold hover:shadow-xl"
        >
          <Rocket className="w-5 h-5" />
          Lancer vos produits
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vos Produits</h1>
          <p className="text-gray-600 mt-1">Gérez vos articles facilement et rapidement.</p>
        </div>

        {/* MAIN BUTTON → Ajouter un produit */}
        <button
          onClick={onAddProduct}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-cyan-700 active:scale-95 transition-all font-semibold hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Ajouter un produit
        </button>
      </div>

      {/* EMPTY STATE */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="w-16 h-16 text-gray-400" />

          <h2 className="text-xl font-semibold text-gray-700 mt-4">Aucun produit</h2>
          <p className="text-gray-500 max-w-sm mt-2">
            Vous n'avez encore publié aucun article. Ajoutez votre premier produit et commencez à vendre.
          </p>

          <button
            onClick={onAddProduct}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" /> Ajouter un produit
          </button>
        </div>
      )}

      {/* PRODUCTS GRID */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* IMAGE */}
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button className="p-2 bg-white/90 rounded-full hover:bg-white">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 bg-white/90 rounded-full hover:bg-white">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2">{p.name}</h4>
                <p className="text-2xl font-bold text-blue-600 mb-3">{p.price}€</p>

                {/* ACTION BUTTONS */}
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium">
                    <Edit className="w-4 h-4" /> Modifier
                  </button>
                  <button className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}