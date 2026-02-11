// /lib/diagnostic-server-adapter.js
// Adaptateur serveur pour créer un diagnostic depuis une API route.
// Conçu pour accepter des photos déjà uploadées (URLs) ou aucune photo.
// Ne tente pas d'uploader des File objects (côté serveur on reçoit des URLs).

import { getSupabase } from './supabase-client';

/**
 * payload attendu :
 * {
 *   id_agriculteur: number,
 *   id_culture: number,
 *   commentaire_agriculteur: string,
 *   localisation_gps?: string,
 *   photos?: string[] // URLs publiques ou signées
 *   priorite?: 'normale'|'haute'|'urgente'
 * }
 */
export async function createDiagnosticFromServer(payload) {
  try {
    const supabase = await getSupabase();

    // Générer un code lisible
    const code = `D-${Date.now().toString(36).toUpperCase()}`;

    const diagPayload = {
      code_diagnostic: code,
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

    if (insertErr || !inserted) return { data: null, error: insertErr || new Error('Insertion échouée') };

    const id_diagnostic = inserted.id_diagnostic;

    // Si photos sont fournies comme URLs, insérer en diagnostic_photos
    if (Array.isArray(payload.photos) && payload.photos.length > 0) {
      const rows = payload.photos.map((url) => ({
        id_diagnostic,
        url_photo: url,
        legende: null,
        taille_ko: null
      }));
      try {
        await supabase.from('diagnostic_photos').insert(rows);
      } catch (e) {
        console.warn('Impossible d\'insérer diagnostic_photos (server adapter)', e);
      }
    }

    // Créer notification (broadcast) pour le staff
    try {
      await supabase.from('notifications').insert({
        id_destinataire: null,
        type_notification: 'diagnostic_nouveau',
        titre: 'Nouveau diagnostic',
        message: `Diagnostic ${code} envoyé par l'agriculteur ${payload.id_agriculteur}`,
        lien_action: `/staff/diagnostics/${id_diagnostic}`
      });
    } catch (e) {
      console.warn('Notification non insérée (server adapter)', e);
    }

    return { data: inserted, error: null };
  } catch (error) {
    return { data: null, error };
  }
}