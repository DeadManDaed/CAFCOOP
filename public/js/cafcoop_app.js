/**
 * cafcoop_app.js - VERSION COMPLÈTE FINALE (adaptée pour getSupabase)
 * Application CAFCOOP - Supabase Production
 */

import { getSupabase, formatDate, getCurrentUser } from "./supabase-client.js";
import { BASE_PATHOLOGIES, PRODUITS_AGRICOLES, REGIONS_CAMEROUN } from "./cafcoop_data.js";

// --- SUPABASE LAZY INIT ---
let supabase = null;
async function ensureSupabase() {
  if (!supabase) supabase = await getSupabase();
  return supabase;
}

// --- ÉTAT GLOBAL ---
window.AppState = {
    role: 'agriculteur',
    currentTab: 'home',
    panier: JSON.parse(localStorage.getItem('cafcoop_panier')) || [],
    diagnosticsList: [],
    commandesList: [],
    photoActuelle: null,
    currentUser: null,
    selectedProduct: null
};

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', async () => {
    await ensureSupabase();

    AppState.currentUser = await getCurrentUser();

    await Promise.all([
        ecouterDiagnostics(),
        chargerCommandes()
    ]);

    renderPage();
    updateCartSummary();
});

// --- DIAGNOSTICS TEMPS RÉEL ---
async function ecouterDiagnostics() {
    await ensureSupabase();
    chargerDiagnosticsInitiaux();

    supabase
        .channel('diagnostics-realtime')
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'diagnostics' },
            (payload) => {
                const nouveauDiag = {
                    id: payload.new.id_diagnostic,
                    producteur: payload.new.commentaire_agriculteur || 'Utilisateur',
                    culture: payload.new.id_culture,
                    symptomes: [],
                    statut: 'En attente',
                    date: formatDate(payload.new.date_creation)
                };

                AppState.diagnosticsList.unshift(nouveauDiag);

                if (AppState.role === 'personnel') {
                    afficherNotification('🔔 Nouveau diagnostic !', 'info');
                }

                if (AppState.currentTab === 'diagnostic') renderPage();
            }
        )
        .subscribe();
}

async function chargerDiagnosticsInitiaux() {
    try {
        await ensureSupabase();
        const { data, error } = await supabase
            .from('diagnostics')
            .select('*')
            .order('date_creation', { ascending: false })
            .limit(50);

        if (error) throw error;

        AppState.diagnosticsList = (data || []).map(d => ({
            id: d.id_diagnostic,
            producteur: d.commentaire_agriculteur || 'Utilisateur',
            culture: d.id_culture,
            symptomes: [],
            statut: d.statut === 'en_attente' ? 'En attente' : 'Traité',
            date: formatDate(d.date_creation)
        }));
    } catch (error) {
        console.error('Erreur diagnostics:', error);
    }
}

async function chargerCommandes() {
    try {
        await ensureSupabase();
        const { data, error } = await supabase
            .from('commandes')
            .select('*')
            .order('date_commande', { ascending: false });

        if (error) throw error;

        AppState.commandesList = data || [];
    } catch (error) {
        console.error('Erreur commandes:', error);
    }
}

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
    if (badge) {
      badge.innerText = AppState.role === 'agriculteur' ? 'AGRICULTEUR' : 'PERSONNEL';
      badge.style.background = AppState.role === 'personnel' ? '#FFC107' : 'rgba(255,255,255,0.2)';
    }
    renderPage();
};

// --- RENDU PRINCIPAL ---
window.renderPage = () => {
    const container = document.getElementById('main-content');
    if (!container) return;

    switch(AppState.currentTab) {
        case 'home': renderHome(container); break;
        case 'boutique': renderBoutique(container); break;
        case 'diagnostic': renderDiagnostic(container); break;
        case 'commandes': renderCommandes(container); break;
        case 'profil': renderProfil(container); break;
        default: renderHome(container);
    }
};

// --- HOME ---
function renderHome(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h2 style="text-align:center; margin-bottom:20px;">🍃 CAFCOOP</h2>
            
            <div class="action-grid">
                <div class="action-btn primary" onclick="navigateTo('boutique')">
                    <span style="font-size:40px;">🛒</span>
                    <span>Boutique</span>
                </div>
                <div class="action-btn primary" onclick="navigateTo('diagnostic')">
                    <span style="font-size:40px;">🩺</span>
                    <span>Diagnostic</span>
                </div>
                <div class="action-btn" onclick="navigateTo('commandes')">
                    <span style="font-size:40px;">📦</span>
                    <span>Commandes</span>
                </div>
                <div class="action-btn" onclick="navigateTo('profil')">
                    <span style="font-size:40px;">👤</span>
                    <span>Profil</span>
                </div>
            </div>

            ${AppState.role === 'personnel' ? `
                <div class="card" style="margin-top:20px;">
                    <h3>📊 Tableau de bord</h3>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; text-align:center; margin-top:15px;">
                        <div>
                            <div style="font-size:32px; font-weight:700; color:var(--primary);">${AppState.diagnosticsList.filter(d => d.statut === 'En attente').length}</div>
                            <div style="font-size:12px;">Diagnostics</div>
                        </div>
                        <div>
                            <div style="font-size:32px; font-weight:700; color:var(--accent);">${AppState.commandesList.filter(c => c.statut !== 'livree').length}</div>
                            <div style="font-size:12px;">Commandes</div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// --- BOUTIQUE ---
function renderBoutique(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h2>🛒 Boutique</h2>
            ${PRODUITS_AGRICOLES.map(p => `
                <div class="card product-card" onclick="voirDetailProduit('${p.id}')">
                    <div class="product-icon">${p.image}</div>
                    <div class="product-info">
                        <div class="product-name">${p.nom}</div>
                        <div class="product-price">${p.prix.toLocaleString()} FCFA</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

window.voirDetailProduit = (id) => {
    const p = PRODUITS_AGRICOLES.find(prod => prod.id === id);
    if (!p) return;

    AppState.selectedProduct = p;

    document.getElementById('modal-content').innerHTML = `
        <div class="modal-header">
            <div class="modal-title">${p.image} ${p.nom}</div>
            <div class="close-modal" onclick="closeModal()">✕</div>
        </div>
        
        <div style="font-size:24px; font-weight:700; color:var(--accent); margin:15px 0;">
            ${p.prix.toLocaleString()} FCFA
        </div>
        
        <p>${p.description}</p>
        
        <div class="form-group" style="margin-top:20px;">
            <label>Quantité</label>
            <input type="number" id="product-quantity" value="1" min="1" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
        </div>
        
        <button class="btn btn-primary" onclick="ajouterAuPanier()">🛒 Ajouter au panier</button>
    `;

    document.getElementById('modal').classList.add('active');
};

window.ajouterAuPanier = () => {
    const qte = parseInt(document.getElementById('product-quantity').value);
    const p = AppState.selectedProduct;
    if (!p) return;

    const existant = AppState.panier.find(item => item.id === p.id);
    if (existant) {
        existant.quantite += qte;
    } else {
        AppState.panier.push({ ...p, quantite: qte });
    }

    localStorage.setItem('cafcoop_panier', JSON.stringify(AppState.panier));
    updateCartSummary();
    closeModal();
    afficherNotification(`✅ ${p.nom} ajouté`, 'success');
};

window.updateCartSummary = () => {
    const total = AppState.panier.reduce((sum, p) => sum + (p.prix * p.quantite), 0);
    const count = AppState.panier.reduce((sum, p) => sum + p.quantite, 0);

    const cartCountEl = document.getElementById('cart-count');
    const cartTotalEl = document.getElementById('cart-total');
    const cartSummary = document.getElementById('cart-summary');

    if (cartCountEl) cartCountEl.innerText = count;
    if (cartTotalEl) cartTotalEl.innerText = total.toLocaleString() + ' FCFA';

    if (cartSummary) {
      if (count > 0) cartSummary.classList.add('active');
      else cartSummary.classList.remove('active');
    }
};

window.viewCart = () => {
    const total = AppState.panier.reduce((sum, p) => sum + (p.prix * p.quantite), 0);

    document.getElementById('modal-content').innerHTML = `
        <div class="modal-header">
            <div class="modal-title">🛒 Panier</div>
            <div class="close-modal" onclick="closeModal()">✕</div>
        </div>
        
        ${AppState.panier.length === 0 ? '<p style="text-align:center; padding:40px;">Panier vide</p>' : `
            ${AppState.panier.map((p, i) => `
                <div class="card">
                    <div style="display:flex; justify-content:space-between;">
                        <div>
                            <strong>${p.nom}</strong><br>
                            <span style="font-size:12px;">${p.prix.toLocaleString()} × ${p.quantite}</span>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-weight:700;">${(p.prix * p.quantite).toLocaleString()} FCFA</div>
                            <button onclick="retirerDuPanier(${i})" style="background:red; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:11px; margin-top:4px;">Retirer</button>
                        </div>
                    </div>
                </div>
            `).join('')}
            
            <div style="background:var(--primary); color:white; padding:15px; border-radius:12px; margin:20px 0;">
                <strong>TOTAL: ${total.toLocaleString()} FCFA</strong>
            </div>
            
            <select id="payment-mode" style="width:100%; padding:12px; border-radius:8px; margin-bottom:10px;">
                <option value="mobile_money">Mobile Money</option>
                <option value="especes">Espèces</option>
                <option value="credit">Crédit</option>
            </select>
            
            <button class="btn btn-primary" onclick="validerCommande()">✅ Valider</button>
        `}
    `;

    document.getElementById('modal').classList.add('active');
};

window.retirerDuPanier = (i) => {
    AppState.panier.splice(i, 1);
    localStorage.setItem('cafcoop_panier', JSON.stringify(AppState.panier));
    updateCartSummary();
    viewCart();
};

window.validerCommande = async () => {
    const modeEl = document.getElementById('payment-mode');
    const mode = modeEl ? modeEl.value : 'especes';
    const total = AppState.panier.reduce((sum, p) => sum + (p.prix * p.quantite), 0);

    try {
        await ensureSupabase();
        const { error } = await supabase.from('commandes').insert({
            id_agriculteur: 1,
            statut: 'en_attente',
            statut_paiement: mode === 'mobile_money' ? 'valide' : 'en_attente',
            montant_total: total,
            mode_paiement: mode,
            date_commande: new Date().toISOString()
        });

        if (error) throw error;

        AppState.panier = [];
        localStorage.setItem('cafcoop_panier', JSON.stringify(AppState.panier));
        updateCartSummary();
        closeModal();

        afficherNotification('✅ Commande validée !', 'success');
        await chargerCommandes();
        navigateTo('commandes');
    } catch (error) {
        console.error('Erreur validerCommande:', error);
        afficherNotification('❌ Erreur', 'error');
    }
};

// --- DIAGNOSTIC ---
window.renderDiagnostic = (container) => {
    if (AppState.role === 'agriculteur') {
        container.innerHTML = `
            <div class="fade-in">
                <h2>🩺 Diagnostic</h2>
                <select id="diag-culture" onchange="chargerSymptomes()" style="width:100%; padding:12px; border-radius:8px; border:1px solid #ddd; margin-bottom:15px;">
                    <option value="">-- Culture --</option>
                    ${Object.keys(BASE_PATHOLOGIES).map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
                <div id="zone-symptomes"></div>
                <div id="zone-photo" style="display:none;">
                    <input type="file" accept="image/*" onchange="chargerPhoto(this)">
                    <div id="apercu-photo"></div>
                </div>
                <button class="btn btn-primary" id="btn-envoyer-diag" onclick="envoyerDiagnostic()" style="display:none;">📤 Envoyer</button>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="fade-in">
                <h2>📋 Diagnostics (${AppState.diagnosticsList.length})</h2>
                ${AppState.diagnosticsList.map(d => `
                    <div class="card" style="border-left:4px solid ${d.statut === 'En attente' ? 'orange' : 'green'};">
                        <strong>${d.producteur}</strong><br>
                        <small>${d.date}</small><br>
                        <div class="status-pill ${d.statut === 'En attente' ? 'status-pending' : 'status-ok'}">${d.statut}</div>
                        ${d.statut === 'En attente' ? `<button class="btn btn-primary" style="margin-top:10px; padding:8px; font-size:13px;" onclick="transfererExpert('${d.id}')">Transférer</button>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
};

window.chargerSymptomes = () => {
    const culture = document.getElementById('diag-culture').value;
    if (!culture) {
        document.getElementById('zone-symptomes').innerHTML = '';
        document.getElementById('zone-photo').style.display = 'none';
        return;
    }

    const maladies = BASE_PATHOLOGIES[culture];
    document.getElementById('zone-symptomes').innerHTML = maladies.map(m => `
        <div class="card">
            <strong>${m.nom}</strong>
            ${m.symptomes.map(s => `
                <label style="display:block; margin:5px 0;">
                    <input type="checkbox" class="chk-symp" value="${s}" onchange="verifierBoutonEnvoi()"> ${s}
                </label>
            `).join('')}
        </div>
    `).join('');

    document.getElementById('zone-photo').style.display = 'block';
};

window.chargerPhoto = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            AppState.photoActuelle = e.target.result;
            const apercu = document.getElementById('apercu-photo');
            if (apercu) apercu.innerHTML = `<img src="${e.target.result}" style="width:100px; border-radius:8px; margin-top:10px;">`;
            verifierBoutonEnvoi();
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.verifierBoutonEnvoi = () => {
    const btn = document.getElementById('btn-envoyer-diag');
    if (btn) btn.style.display = document.querySelectorAll('.chk-symp:checked').length > 0 ? 'block' : 'none';
};

window.envoyerDiagnostic = async () => {
    const culture = document.getElementById('diag-culture').value;
    const symptomes = Array.from(document.querySelectorAll('.chk-symp:checked')).map(c => c.value);

    try {
        await ensureSupabase();
        const { error } = await supabase.from('diagnostics').insert({
            id_agriculteur: 1,
            id_culture: 1,
            statut: 'en_attente',
            commentaire_agriculteur: `${culture} - ${symptomes.join(', ')}`,
            date_creation: new Date().toISOString()
        });

        if (error) throw error;

        afficherNotification('✅ Diagnostic envoyé !', 'success');
        navigateTo('home');
    } catch (error) {
        console.error('Erreur envoyerDiagnostic:', error);
        afficherNotification('❌ Erreur', 'error');
    }
};

window.transfererExpert = async (id) => {
    try {
        await ensureSupabase();
        const { error } = await supabase.from('diagnostics').update({ statut: 'transfere' }).eq('id_diagnostic', id);
        if (error) throw error;

        afficherNotification('✅ Transféré', 'success');
        await chargerDiagnosticsInitiaux();
        renderPage();
    } catch (error) {
        console.error('Erreur transfererExpert:', error);
        afficherNotification('❌ Erreur', 'error');
    }
};

// --- COMMANDES ---
function renderCommandes(container) {
    if (AppState.role === 'agriculteur') {
        container.innerHTML = `
            <div class="fade-in">
                <h2>📦 Mes Commandes</h2>
                ${AppState.commandesList.map(c => `
                    <div class="card">
                        <strong>Commande #${c.id_commande}</strong><br>
                        <small>${formatDate(c.date_commande)}</small><br>
                        <div style="font-size:18px; font-weight:700; color:var(--primary); margin:8px 0;">${c.montant_total?.toLocaleString()} FCFA</div>
                        <div class="status-pill ${c.statut === 'livree' ? 'status-ok' : 'status-pending'}">${c.statut}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="fade-in">
                <h2>📦 Gestion Commandes</h2>
                ${AppState.commandesList.map(c => `
                    <div class="card">
                        <div style="display:flex; justify-content:space-between;">
                            <div><strong>#${c.id_commande}</strong></div>
                            <div style="font-weight:700;">${c.montant_total?.toLocaleString()} FCFA</div>
                        </div>
                        ${c.statut !== 'livree' ? `<button class="btn btn-primary" style="margin-top:10px; padding:8px; font-size:13px;" onclick="marquerLivree(${c.id_commande})">✅ Marquer livrée</button>` : '<div style="color:green; margin-top:10px;">✅ Livrée</div>'}
                    </div>
                `).join('')}
            </div>
        `;
    }
}

window.marquerLivree = async (id) => {
    try {
        await ensureSupabase();
        const { error } = await supabase.from('commandes').update({ statut: 'livree' }).eq('id_commande', id);
        if (error) throw error;

        afficherNotification('✅ Livrée', 'success');
        await chargerCommandes();
        renderPage();
    } catch (error) {
        console.error('Erreur marquerLivree:', error);
        afficherNotification('❌ Erreur', 'error');
    }
};

// --- PROFIL ---
function renderProfil(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h2>👤 Profil</h2>
            <div class="card">
                <p><strong>Nom:</strong> Utilisateur DEMO</p>
                <p><strong>Rôle:</strong> ${AppState.role}</p>
            </div>
        </div>
    `;
}

// --- UTILITAIRES ---
window.afficherNotification = (msg, type) => {
    const n = document.getElementById('notification');
    n.innerText = msg;
    n.style.backgroundColor = type === 'error' ? '#D32F2F' : type === 'success' ? '#388E3C' : '#333';
    n.classList.add('show');
    setTimeout(() => n.classList.remove('show'), 3000);
};

window.closeModal = () => {
    document.getElementById('modal').classList.remove('active');
};

window.fabAction = () => {
    navigateTo('diagnostic');
};