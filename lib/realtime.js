// /lib/realtime.js
// Centralise abonnements Supabase Realtime
import { getSupabase } from './supabase-client';

let channel = null;

export async function initRealtime(onInsertDiagnostic, onInsertCommande) {
  const supabase = await getSupabase();
  if (channel) return channel;

  channel = supabase.channel('cafcoop-main');

  if (onInsertDiagnostic) {
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'diagnostics' }, (payload) => {
      try { onInsertDiagnostic(payload); } catch (e) { console.warn(e); }
    });
  }

  if (onInsertCommande) {
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'commandes' }, (payload) => {
      try { onInsertCommande(payload); } catch (e) { console.warn(e); }
    });
  }

  await channel.subscribe();
  return channel;
}

export function unsubscribeRealtime() {
  if (!channel) return;
  try { channel.unsubscribe(); } catch (e) { console.warn(e); }
  channel = null;
}