// pages/api/supabase-config.js
export default function handler(req, res) {
  // Exemple : renvoyer uniquement l'URL si tu veux éviter d'exposer la clé
  res.status(200).json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
  })
}