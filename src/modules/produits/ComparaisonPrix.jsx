
import { useState, createContext, useContext, cloneElement, useEffect, useMemo } from "react"

// Minimal local Dialog components to avoid importing external UI library
const DialogContext = createContext(null)
function Dialog({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}
function DialogTrigger({ children, asChild }) {
  const ctx = useContext(DialogContext)
  if (!ctx) return null
  const { setOpen } = ctx
  const child = children
  const openDialog = (e) => {
    if (child?.props?.onClick) child.props.onClick(e)
    setOpen(true)
  }
  if (asChild && child) {
    return cloneElement(child, { onClick: openDialog })
  }
  return <button onClick={openDialog}>{children}</button>
}
function DialogContent({ children, className }) {
  const ctx = useContext(DialogContext)
  if (!ctx) return null
  const { open, setOpen } = ctx
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, setOpen])

  if (!open) return null
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className ?? ""}`} onClick={() => setOpen(false)}>
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-auto" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
function DialogHeader({ children, showClose = true }) {
  const ctx = useContext(DialogContext)
  const setOpen = ctx?.setOpen
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">{children}</div>
      {showClose && (
        <div className="ml-4">
          <button onClick={() => setOpen && setOpen(false)} className="text-gray-500 hover:text-gray-700" aria-label="Fermer">✖</button>
        </div>
      )}
    </div>
  )
}
function DialogTitle({ children, className }) {
  return <h2 className={className}>{children}</h2>
}

export default function ComparePriceModal({ product }) {
  const [vendors, setVendors] = useState([
    { name: "Shop Goma", price: 25, delivery: "2 jours", rating: 4 },
    { name: "Shop Kigali", price: 28, delivery: "1 jour", rating: 3 },
    { name: "Shop Nairobi", price: 24, delivery: "3 jours", rating: 5 },
  ])
  const [sortKey, setSortKey] = useState("price-asc")

  const sortedVendors = useMemo(() => {
    const copy = [...vendors]
    if (sortKey === "price-asc") return copy.sort((a, b) => a.price - b.price)
    if (sortKey === "price-desc") return copy.sort((a, b) => b.price - a.price)
    if (sortKey === "rating-desc") return copy.sort((a, b) => b.rating - a.rating)
    return copy
  }, [vendors, sortKey])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">Comparer le prix</button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl rounded-2xl p-6">
        <DialogHeader>
          <div>
            <DialogTitle className="text-xl font-semibold">{product?.nom || product?.name || "Comparer le prix – Produit"}</DialogTitle>
            {product?.image && (
              <img src={product.image} alt={product?.nom || product?.name} className="w-28 h-20 object-cover rounded mt-2" />
            )}
            {product?.category && <p className="text-sm text-gray-500 mt-2">{product.category}</p>}
          </div>
        </DialogHeader>

        {/* Sorting controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Trier par :</span>
            <div className="flex gap-2">
              <button onClick={() => setSortKey("price-asc")} className={`px-2 py-1 rounded ${sortKey === "price-asc" ? "bg-gray-200" : "bg-white border"}`}>Prix ↑</button>
              <button onClick={() => setSortKey("price-desc")} className={`px-2 py-1 rounded ${sortKey === "price-desc" ? "bg-gray-200" : "bg-white border"}`}>Prix ↓</button>
              <button onClick={() => setSortKey("rating-desc")} className={`px-2 py-1 rounded ${sortKey === "rating-desc" ? "bg-gray-200" : "bg-white border"}`}>Note</button>
            </div>
          </div>
          <div className="text-sm text-gray-500">{vendors.length} vendeurs</div>
        </div>

        {/* Tableau des vendeurs */}
        <div className="overflow-x-auto mt-4">
          {sortedVendors.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Aucun vendeur trouvé pour ce produit.</div>
          ) : (
            <table className="w-full border-collapse rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Vendeur</th>
                  <th className="p-3">Prix</th>
                  <th className="p-3">Livraison</th>
                  <th className="p-3">Note</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedVendors.map((v, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-3">{v.name}</td>
                    <td className="p-3 font-medium text-green-600">${v.price}</td>
                    <td className="p-3">{v.delivery}</td>
                    <td className="p-3">{"⭐".repeat(v.rating)}</td>
                    <td className="p-3">
                      <button className="border rounded px-2 py-1">Voir vendeur</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Statistiques */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-3 text-center">
          <div>
            <p className="text-gray-500 text-sm">Prix minimum</p>
            <p className="font-bold text-green-600">${Math.min(...(vendors.map(v => v.price)))}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Prix maximum</p>
            <p className="font-bold text-red-600">${Math.max(...(vendors.map(v => v.price)))}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Prix moyen</p>
            <p className="font-bold text-blue-600">
              ${(vendors.reduce((a, v) => a + v.price, 0) / (vendors.length || 1)).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button className="border rounded px-3 py-2">Voir comparaison complète</button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded">Acheter maintenant</button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
