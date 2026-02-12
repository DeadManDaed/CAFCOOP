// pages/api/link-profile.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { id_auth, email, nom = '', prenom = '', role = 'agriculteur' } = req.body || {};
  if (!id_auth || !email) return res.status(400).json({ ok: false, error: 'Missing id_auth or email' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase server env vars');
    return res.status(500).json({ ok: false, error: 'Server misconfiguration' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Vérifier si déjà présent
    const { data: existing } = await supabase.from('utilisateurs').select('*').eq('id_auth', id_auth).limit(1).maybeSingle();
    if (existing) return res.status(200).json({ ok: true, user: existing });

    // Insérer la ligne utilisateur
    const insertPayload = {
      id_auth,
      email,
      nom,
      prenom,
      role,
      date_creation: new Date().toISOString()
    };

    const { data, error } = await supabase.from('utilisateurs').insert(insertPayload).select().single();
    if (error) {
      console.error('link-profile insert error', error);
      return res.status(500).json({ ok: false, error: error.message || 'Insert failed' });
    }

    return res.status(200).json({ ok: true, user: data });
  } catch (err) {
    console.error('link-profile error', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}