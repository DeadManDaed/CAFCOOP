import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://VOTRE_PROJECT_ID.supabase.co'
const supabaseKey = 'VOTRE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)