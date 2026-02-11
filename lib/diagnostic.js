// /lib/diagnostic.js
// Fonctions client pour diagnostics : sendDiagnostic, fetchDiagnosticsByUser, fetchDiagnosticsForStaff, addSupportMessage, findQuickSolutions, updateDiagnosticStatus, requestDiagnosticPdf
import { getSupabase } from './supabase-client';

function ok(data) { return { data, error: null }; }
function fail(error) { return { data: null, error }; }

function generateDiagnosticCode() {
  const t = Date.now().toString(36).toUpperCase();
  return `D-${t}`;
}

export async function sendDiagnostic(payload) {
  try {
    const supabase = await getSupabase();

    const diagPayload = {
      code_diagnostic: generateDiagnosticCode(),
      id_agriculteur: payload.id_agriculteur,
      id_culture: payload.id_culture,
      commentaire_agriculteur: payload.commentaire_agriculteur,
      localisation_gps: payload.localisation_gps || null,
      date_observation: payload.date_observation || new Date().toISOString(),
      statut: 'en_attente',
      priorite: payload.priorite || 'normale'
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('diagnostics')
      .insert(diagPayload)
      .select()
      .single();

    if (insertErr || !inserted) return fail(insertErr || new Error('Insertion échouée'));

    const id_diagnostic = inserted.id_diagnostic;

    if (payload.photos && payload.photos.length > 0) {
      for (const file of payload.photos) {
        try {
          const filePath = `diagnostics/${id_diagnostic}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('diagnostic-photos')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

          if (uploadErr) {
            console.warn('Upload photo échoué', uploadErr);
            continue;
          }

          const { publicURL } = supabase.storage.from('diagnostic-photos').getPublicUrl(uploadData.path);
          await supabase.from('diagnostic_photos').insert({
            id_diagnostic,
            url_photo: publicURL,
            legende: file.name,
            taille_ko: Math.max(1, Math.round(file.size / 1024))
          });
        } catch (e) {
          console.warn('Erreur upload photo', e);
        }
      }
    }

    try {
      await supabase.from('notifications').insert({
        id_destinataire: null,
        type_notification: 'diagnostic_nouveau',
        titre: 'Nouveau diagnostic',
        message: `Diagnostic ${inserted.code_diagnostic} envoyé par l'agriculteur ${payload.id_agriculteur}`,
        lien_action: `/staff/diagnostics/${id_diagnostic}`
      });
    } catch (e) {
      console.warn('Notification non insérée', e);
    }

    return ok(inserted);
  } catch (error) {
    return fail(error);
  }
}

export async function fetchDiagnosticsByUser(id_agriculteur, { limit = 50, offset = 0 } = {}) {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('diagnostics')
      .select(`
        *,
        diagnostic_photos(*),
        traitements_recommandes(id_traitement, id_produit, dose_recommandee, frequence, duree_traitement, cout_estime)
      `)
      .eq('id_agriculteur', id_agriculteur)
      .order('date_creation', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return fail(error);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function fetchDiagnosticsForStaff(filters = {}, { limit = 100, offset = 0 } = {}) {
  try {
    const supabase = await getSupabase();
    let query = supabase
      .from('diagnostics')
      .select('*, diagnostic_photos(*), traitements_recommandes(*)')
      .order('date_creation', { ascending: false });

    if (filters.statut) query = query.eq('statut', filters.statut);
    if (filters.priorite) query = query.eq('priorite', filters.priorite);
    if (filters.date_from) query = query.gte('date_creation', filters.date_from);
    if (filters.date_to) query = query.lte('date_creation', filters.date_to);

    const { data, error } = await query.range(offset, offset + limit - 1);
    if (error) return fail(error);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function addSupportMessage({ id_expediteur, id_destinataire, id_diagnostic, sujet, message }) {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('messages_support')
      .insert({ id_expediteur, id_destinataire, id_diagnostic, sujet, message })
      .select()
      .single();

    if (error) return fail(error);

    try {
      await supabase.from('diagnostics').update({ statut: 'repondu', date_modification: new Date().toISOString() }).eq('id_diagnostic', id_diagnostic);
    } catch (e) {
      console.warn('Impossible de mettre à jour le statut du diagnostic', e);
    }

    try {
      await supabase.from('notifications').insert({
        id_destinataire,
        type_notification: 'message_support',
        titre: `Réponse au diagnostic ${id_diagnostic}`,
        message: sujet || 'Nouvelle réponse',
        lien_action: `/diagnostics/${id_diagnostic}`
      });
    } catch (e) {
      console.warn('Notification message support non insérée', e);
    }

    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function findQuickSolutions(keyword, { limit = 10 } = {}) {
  try {
    if (!keyword || keyword.trim().length < 2) return ok([]);

    const supabase = await getSupabase();

    const { data: symptomes, error: sErr } = await supabase
      .from('symptomes')
      .select('id_symptome, description_symptome, id_pathologie')
      .ilike('description_symptome', `%${keyword}%`)
      .limit(limit);

    if (sErr) return fail(sErr);
    if (!symptomes || symptomes.length === 0) return ok([]);

    const pathoIds = [...new Set(symptomes.map(s => s.id_pathologie))];

    const { data: produitsPatho, error: pErr } = await supabase
      .from('produits_pathologies')
      .select('id_produit, produits(*)')
      .in('id_pathologie', pathoIds);

    if (pErr) return fail(pErr);

    const solutions = (produitsPatho || []).map(r => r.produits).filter(Boolean);
    return ok(solutions);
  } catch (error) {
    return fail(error);
  }
}

export async function updateDiagnosticStatus(id_diagnostic, updates = {}) {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('diagnostics')
      .update({ ...updates, date_modification: new Date().toISOString() })
      .eq('id_diagnostic', id_diagnostic)
      .select()
      .single();

    if (error) return fail(error);
    return ok(data);
  } catch (error) {
    return fail(error);
  }
}

export async function requestDiagnosticPdf(id_diagnostic) {
  try {
    const resp = await fetch(`/api/diagnostics/${id_diagnostic}/pdf`, { method: 'POST' });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Erreur génération PDF: ${resp.status} ${txt}`);
    }
    const json = await resp.json();
    if (!json.ok) return fail(json.error || 'Erreur génération PDF');
    return ok(json.url);
  } catch (error) {
    return fail(error);
  }
}