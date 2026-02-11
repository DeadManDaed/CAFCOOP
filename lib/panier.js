// /lib/panier.js
// Gestion locale du panier (localStorage)
const KEY = 'cafcoop_panier';

export function loadCart() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

export function saveCart(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
}

export function addToCart(cart, product, qty = 1) {
  const existing = cart.find(p => p.id === product.id);
  if (existing) existing.quantite += qty;
  else cart.push({ ...product, quantite: qty });
  saveCart(cart);
  return cart;
}

export function updateQty(cart, productId, qty) {
  const p = cart.find(x => x.id === productId);
  if (p) p.quantite = Math.max(1, qty);
  saveCart(cart);
  return cart;
}

export function removeFromCart(cart, index) {
  cart.splice(index, 1);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  localStorage.removeItem(KEY);
  return [];
}

export function cartSummary(cart) {
  const total = cart.reduce((s, p) => s + (p.prix * p.quantite), 0);
  const count = cart.reduce((s, p) => s + p.quantite, 0);
  return { total, count };
}