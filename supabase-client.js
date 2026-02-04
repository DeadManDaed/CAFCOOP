
/**
 * supabase-client.js
 * Connexion Supabase pour CAFCOOP
 */
// Import depuis CDN (pour navigateur)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Configuration Supabase
const supabaseUrl = 'https://ccjidfxcctmqgpbftiga.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjamlkZnhjY3RtcWdwYmZ0aWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjc5NTUsImV4cCI6MjA4NTY0Mzk1NX0.1QQUN-5wjCSuwDeFTdJN0XlzOxnxH7h05_9P0vcizPA'

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper : Convertir timestamp Supabase → Date lisible
export const formatDate = (timestamp) => {
    if (!timestamp) return "À l'instant"
    return new Date(timestamp).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Helper : Obtenir l'utilisateur connecté
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
        console.error('Erreur récupération utilisateur:', error)
        return null
    }
    return user
}

// Helper : Connexion simple (email/password)
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    })
    
    if (error) {
        throw new Error(error.message)
    }
    
    return data.user
}

// Helper : Inscription
export const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: userData // Métadonnées utilisateur
        }
    })
    
    if (error) {
        throw new Error(error.message)
    }
    
    return data.user
}

// Helper : Déconnexion
export const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
        throw new Error(error.message)
    }
}

// Test de connexion (utile pour debug)
export const testConnection = async () => {
    try {
        const { data, error } = await supabase.from('regions').select('count')
        if (error) throw error
        console.log('✅ Connexion Supabase OK')
        return true
    } catch (error) {
        console.error('❌ Erreur connexion Supabase:', error)
        return false
    }
}