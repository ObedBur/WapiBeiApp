import React from 'react';

export default function PublicationPrix() {
  return (
    <div>
      <h2>Publication de prix</h2>
      <form>
        <div>
          <label>Nom du produit</label>
          <input type="text" />
        </div>
        <div>
          <label>Prix</label>
          <input type="number" />
        </div>
        <button type="submit">Publier</button>
      </form>
    </div>
  );
}


