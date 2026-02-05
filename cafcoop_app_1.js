/**
 * cafcoop_app.js - Version Unifiée Supabase
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- CONFIGURATION ---
// Sur Vercel, ces variables doivent être configurées dans Settings > Environment Variables
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const AppState = {
    role: 'agriculteur', 
    currentTab: 'home',
    panier: [],
    photoActuelle: null,
    utilisateur: { id: 1, nom: "Utilisateur Démo" } // À lier à Supabase Auth plus tard
};

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderPage();
    updateCartSummary();
});

// --- NAVIGATION ---
window.navigateTo = (tab) => {
    AppState.currentTab = tab;
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
        if (el.dataset.tab === tab) el.classList.add('active');
    });
    renderPage();
};

window.toggleRole = () => {
    AppState.role = AppState.role === 'agriculteur' ? 'personnel' : 'agriculteur';
    const badge = document.getElementById('current-role');
    badge.innerText = AppState.role.toUpperCase();
    badge.style.background = AppState.role === 'personnel' ? 'var(--accent)' : 'rgba(255,255,255,0.25)';
    renderPage();
};

// --- RENDU PRINCIPAL ---
window.renderPage = () => {
    const container = document.getElementById('main-content');
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    switch(AppState.currentTab) {
        case 'home': renderHome(container); break;
        case 'boutique': renderBoutique(container); break;
        case 'diagnostic': renderDiagnostic(container); break;
        case 'profil': renderProfil(container); break;
    }
};

// --- PAGE ACCUEIL ---
function renderHome(container) {
    const isStaff = AppState.role === 'personnel';
    container.innerHTML = `
        <div class="fade-in">
            <h2 style="margin-bottom:20px;">Bonjour ${AppState.utilisateur.nom.split(' ')[0]} 👋</h2>
            <div class="action-grid">
                ${isStaff ? `
                    <button class="action-btn primary" onclick="navigateTo('diagnostic')"><i>📋</i><span>Dossiers</span></button>
                    <button class="action-btn" onclick="renderStaffTransactions()"><i>💰</i><span>Ventes</span></button>
                    <button class="action-btn" onclick="renderStaffInventory()"><i>📦</i><span>Stocks</span></button>
                    <button class="action-btn"><i>📊</i><span>Stats</span></button>
                ` : `
                    <button class="action-btn primary" onclick="navigateTo('diagnostic')"><i>🩺</i><span>Diagnostic</span></button>
                    <button class="action-btn" onclick="navigateTo('boutique')"><i>🛒</i><span>Boutique</span></button>
                    <button class="action-btn"><i>📚</i><span>Formations</span></button>
                    <button class="action-btn"><i>🌦️</i><span>Météo</span></button>
                `}
            </div>
            <div class="section-title">📢 Actualités CAFCOOP</div>
            <div class="card"><h3>Alerte Chenille</h3><p>Forte pression signalée. Consultez la boutique pour les solutions.</p></div>
        </div>
    `;
}

// --- MODULE BOUTIQUE (DYNAMIQUE SUPABASE) ---
async function renderBoutique(container) {
    if (AppState.role === 'agriculteur') {
        const { data: produits } = await supabase.from('produits').select('*');
        
        container.innerHTML = `
            <div class="fade-in">
                <h2>Boutique Intrants</h2>
                <div id="liste-produits">
                    ${produits.map(p => `
                        <div class="card product-card" onclick="afficherDetailsProduit('${p.id_produit}')">
                            <div class="product-info">
                                <div class="product-name">${p.nom_produit}</div>
                                <div class="product-price">${p.prix_unitaire.toLocaleString()} FCFA</div>
                                <span class="product-stock">En stock: ${p.stock_disponible}</span>
                            </div>
                            <button class="btn btn-primary" style="width:auto; margin:0;" 
                                    onclick="event.stopPropagation(); ajouterAuPanier('${p.id_produit}')">+</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        renderStaffInventory();
    }
}

// Fiche technique détaillée
window.afficherDetailsProduit = async (id) => {
    const { data: p } = await supabase.from('produits').select('*').eq('id_produit', id).single();
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">${p.nom_produit}</h2>
            <span class="close-modal" onclick="fermerModal()">✕</span>
        </div>
        <div class="card" style="background:#f9f9f9; border-left:4px solid var(--primary);">
            <p><strong>🧪 Composition:</strong> ${p.composition || 'N/A'}</p>
            <p><strong>🎯 Rôle:</strong> ${p.role_produit || 'N/A'}</p>
        </div>
        <div class="section-title">📋 Conseil d'utilisation</div>
        <p style="font-size:13px; color:var(--text-secondary);">${p.conseil_utilisation || 'Voir emballage'}</p>
        <button class="btn btn-primary" onclick="ajouterAuPanier('${p.id_produit}'); fermerModal();">Ajouter au panier</button>
    `;
    document.getElementById('modal').classList.add('active');
};

// --- GESTION STAFF : TRANSACTIONS & STOCKS ---
window.renderStaffTransactions = async () => {
    const container = document.getElementById('main-content');
    const { data: commandes } = await supabase.from('commandes').select('*').order('created_at', {ascending: false});
    
    container.innerHTML = `
        <div class="fade-in">
            <h2>Dernières Transactions</h2>
            ${commandes.map(c => `
                <div class="card">
                    <div class="card-header">
                        <strong>#${c.numero_commande}</strong>
                        <span class="status-pill status-pending">${c.statut_livraison || 'A préparer'}</span>
                    </div>
                    <p>${c.montant_total.toLocaleString()} FCFA • ${c.mode_paiement || 'Momo'}</p>
                    <div style="display:flex; gap:8px; margin-top:10px;">
                        <button class="btn-small" onclick="updateCmd('${c.id_commande}', 'Payé')">✅ Payé</button>
                        <button class="btn-small" onclick="updateCmd('${c.id_commande}', 'Livré')">🚚 Livré</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

window.renderStaffInventory = async () => {
    const container = document.getElementById('main-content');
    const { data: produits } = await supabase.from('produits').select('*');
    container.innerHTML = `
        <div class="fade-in">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2>Gestion Stocks</h2>
                <button class="btn-add" onclick="showProductForm()">➕</button>
            </div>
            ${produits.map(p => `
                <div class="card" onclick="showProductForm('${p.id_produit}')">
                    <strong>${p.nom_produit}</strong>
                    <p>${p.prix_unitaire} FCFA | Stock: ${p.stock_disponible}</p>
                </div>
            `).join('')}
        </div>
    `;
};

// --- UTILITAIRES ---
window.ajouterAuPanier = async (id) => {
    const { data: p } = await supabase.from('produits').select('*').eq('id_produit', id).single();
    AppState.panier.push(p);
    updateCartSummary();
    afficherNotification(`${p.nom_produit} ajouté`, 'success');
};

window.updateCartSummary = () => {
    const cartSummary = document.getElementById('cart-summary');
    if (AppState.panier.length > 0) {
        cartSummary.classList.add('active');
        document.getElementById('cart-count').innerText = AppState.panier.length;
        const total = AppState.panier.reduce((sum, p) => sum + p.prix_unitaire, 0);
        document.getElementById('cart-total').innerText = total.toLocaleString() + ' FCFA';
    } else {
        cartSummary.classList.remove('active');
    }
};

window.afficherNotification = (msg, type) => {
    const notif = document.getElementById('notification');
    notif.innerText = msg;
    notif.style.background = type === 'success' ? 'var(--success)' : 'var(--danger)';
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 3000);
};

window.fermerModal = () => document.getElementById('modal').classList.remove('active');
