// public/js/supabase-client.js
// API serverless pour exposer la configuration Supabase au client

export default function handler(req, res) {
  // Vérification que les variables d'environnement existent
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('❌ Variables Supabase manquantes dans .env.local')
    return res.status(500).json({ 
      error: 'Configuration Supabase manquante',
      message: 'Vérifiez que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définis'
    })
  }

  // Renvoie les deux credentials nécessaires
  res.status(200).json({
    supabaseUrl: url,
    supabaseAnonKey: key
  })
}
