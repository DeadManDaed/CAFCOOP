// /lib/supabase-client.js
// Centralisation de l'accès Supabase pour l'application CAFCOOP

import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// Ces variables doivent être définies dans ton environnement (Next.js supporte .env.local)
// Exemple :
// NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// --- CLIENT LAZY INIT ---
let supabase = null;

/**
 * Retourne une instance Supabase unique (lazy init).
 */
export async function getSupabase() {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabase;
}

/**
 * Récupère l’utilisateur courant (auth Supabase).
 * Retourne null si non connecté.
 */
export async function getCurrentUser() {
  const client = await getSupabase();
  const { data: { user } } = await client.auth.getUser();
  return user;
}

/**
 * Formate une date ISO en chaîne lisible (locale fr-FR).
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}