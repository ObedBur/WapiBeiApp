import React from 'react';

export default function CartDrawer({ open, items, onClose, onClear, onRemove, onChangeQty }) {
  if (!open) return null;

  const total = items.reduce((s, it) => {
    const price = Number(String(it.prix).replace(/[^0-9.-]+/g, '')) || 0;
    return s + price * (it.qty || 1);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <aside 
        className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl overflow-auto"
        role="dialog" 
        aria-modal="true" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              Panier ({items.reduce((s,i)=>s+(i.qty||1),0)})
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 text-2xl"
            >
              ×
            </button>
          </div>

          <ul className="space-y-4">
            {items.map((it, idx) => (
              <li 
                key={idx} 
                className="flex justify-between items-center py-3 border-b border-gray-100"
              >
                <div>
                  <div className="font-medium">{it.nom}</div>
                  <div className="text-sm text-gray-500">{it.prix}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => onChangeQty(it.id, Math.max(1, (it.qty||1)-1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
                    aria-label="Diminuer"
                  >
                    −
                  </button>
                  <span className="w-8 text-center">{it.qty || 1}</span>
                  <button 
                    onClick={() => onChangeQty(it.id, (it.qty||1)+1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
                    aria-label="Augmenter"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => onRemove(it.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Suppr
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-bold">{total.toLocaleString()} FC</span>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={onClear}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Vider le panier
              </button>
              <button 
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Commander
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}


