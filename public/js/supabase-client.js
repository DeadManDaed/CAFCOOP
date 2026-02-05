/**
 * supabase-client.js
 * Connexion Supabase pour CAFCOOP (via API config)
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

let _supabase = null

// Initialisation paresseuse : on ne crée le client qu'une fois
async function initSupabase() {
  if (_supabase) return _supabase

  try {
    // Récupère la config depuis l'API serverless (pages/api/supabase-config.js)
    const resp = await fetch('/api/supabase-config')
    const cfg = await resp.json()

    const url = cfg.supabaseUrl
    const key = cfg.supabaseAnonKey

    if (!url || !key) {
      console.error('⚠️ Supabase config manquante. Vérifie /api/supabase-config et les variables Vercel.')
      return null
    }

    _supabase = createClient(url, key)
    console.log('✅ Supabase client initialisé')
    return _supabase
  } catch (err) {
    console.error('❌ Erreur init Supabase:', err)
    return null
  }
}

// Export principal
export const getSupabase = async () => {
  return await initSupabase()
}

// Helpers
export const formatDate = (timestamp) => {
  if (!timestamp) return "À l'instant"
  return new Date(timestamp).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export const getCurrentUser = async () => {
  const supabase = await getSupabase()
  if (!supabase) return null
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Erreur récupération utilisateur:', error)
    return null
  }
  return user
}