// /lib/boutique.js
// Accès aux produits statiques et utilitaires
import { PRODUITS_AGRICOLES } from '../public/js/cafcoop_data';

export function listProducts() {
  return PRODUITS_AGRICOLES;
}

export function getProductById(id) {
  return PRODUITS_AGRICOLES.find(p => String(p.id) === String(id));
}

export function formatProductForUI(p) {
  return {
    id: p.id,
    nom: p.nom,
    prix: p.prix,
    image: p.image || '',
    description: p.description || '',
    composition: p.composition || '',
    dose_recommandee: p.dose_recommandee || ''
  };
}