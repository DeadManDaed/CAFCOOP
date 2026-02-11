// lib/supabase-client.js
/*
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.error('Supabase env missing')
}

export const supabase = createClient(url, anonKey)
*/
import { createClient } from '@supabase/supabase-js';

// 1. Initialisation sécurisée
// On vérifie que les variables existent pour éviter un crash silencieux
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERREUR CRITIQUE: Variables Supabase manquantes dans .env.local');
}

// Création du client unique
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Export de la fonction getSupabase
export const getSupabase = () => {
  return supabase;
};

// 3. Export de la fonction getCurrentUser (Gestion de session robuste)
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Erreur récupération session:", error.message);
      return null;
    }

    if (!session) return null;
    return session.user;
  } catch (err) {
    console.error("Erreur inattendue auth:", err);
    return null;
  }
};

// 4. Export de la fonction formatDate (Adaptée au Cameroun/France)
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    // Format : 14 févr. 2024
    return new Intl.DateTimeFormat('fr-CM', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return dateString; // Fallback si la date est invalide
  }
};