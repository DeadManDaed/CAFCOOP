// /lib/commandes.js
// Création et lecture des commandes via Supabase
import { getSupabase } from './supabase-client';

export async function createOrder({ id_agriculteur, montant_total, mode_paiement, lignes = [], adresse = null, frais_livraison = 0, notes = '' }) {
  const supabase = await getSupabase();
  const payload = {
    id_agriculteur,
    statut: 'en_attente',
    statut_paiement: mode_paiement === 'mobile_money' ? 'valide' : 'en_attente',
    montant_total,
    mode_paiement,
    date_commande: new Date().toISOString(),
    frais_livraison,
    notes,
    adresse_livraison: adresse
  };

  const { data, error } = await supabase.from('commandes').insert(payload).select().single();
  if (error) return { data: null, error };
  if (lignes && lignes.length > 0) {
    try {
      const lines = lignes.map(l => ({ id_commande: data.id_commande, id_produit: l.id, quantite: l.quantite, prix_unitaire: l.prix, prix_total: l.prix * l.quantite }));
      await supabase.from('lignes_commande').insert(lines);
    } catch (e) {
      console.warn('Erreur insertion lignes commande', e);
    }
  }
  return { data, error: null };
}

export async function fetchOrdersByUser(id_agriculteur) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('commandes')
    .select('*, lignes_commande(*)')
    .eq('id_agriculteur', id_agriculteur)
    .order('date_commande', { ascending: false });
  return { data, error };
}

export async function fetchOrdersForStaff(filters = {}) {
  const supabase = await getSupabase();
  let q = supabase.from('commandes').select('*, lignes_commande(*)').order('date_commande', { ascending: false });
  if (filters.statut) q = q.eq('statut', filters.statut);
  if (filters.date_from) q = q.gte('date_commande', filters.date_from);
  if (filters.date_to) q = q.lte('date_commande', filters.date_to);
  const { data, error } = await q;
  return { data, error };
}

export async function updateOrderStatus(id_commande, updates = {}) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from('commandes').update(updates).eq('id_commande', id_commande).select().single();
  return { data, error };
}