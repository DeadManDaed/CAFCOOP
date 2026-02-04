import { createClient } from 'https://ccjidfxcctmqgpbftiga.supabase.co'

const supabaseUrl = 'https://VOTRE_PROJECT_ID.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjamlkZnhjY3RtcWdwYmZ0aWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjc5NTUsImV4cCI6MjA4NTY0Mzk1NX0.1QQUN-5wjCSuwDeFTdJN0XlzOxnxH7h05_9P0vcizPA'

export const supabase = createClient(supabaseUrl, supabaseKey)