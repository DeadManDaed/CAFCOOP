/**
 * cafcoop_app.js
 * Logique principale de l'application CAFCOOP
 */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAE2nCkmwfkdSelRshO79RP_6Zbqgbx32M",
  authDomain: "cafcoop-app.firebaseapp.com",
  projectId: "cafcoop-app",
  storageBucket: "cafcoop-app.firebasestorage.app",
  messagingSenderId: "428822928793",
  appId: "1:428822928793:web:8716d85a22ce8e7090c708"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ÉCOUTEUR TEMPS RÉEL (Style WhatsApp)
onSnapshot(query(collection(db, "diagnostics"), orderBy("date", "desc")), (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        // Si un nouveau diagnostic est ajouté et qu'on est en mode Personnel
        if (change.type === "added" && AppState.role === 'personnel') {
            const diag = change.doc.data();
            afficherNotification(`🔔 Nouveau diagnostic de ${diag.producteur} (${diag.culture})`, 'info');
            // Force le rafraîchissement de la vue si on est sur l'onglet diagnostic
            if(AppState.currentTab === 'diagnostic') navigateTo('diagnostic');
        }
    });
});

// État global de l'application
const AppState = {
    role: 'agriculteur', // ou 'personnel'
    currentTab: 'home',
    panier: [],
    photoActuelle: null,
    utilisateur: UTILISATEUR_DEMO
};

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    renderPage();
    updateCartSummary();
});

// ===== NAVIGATION =====
function navigateTo(tab) {
    AppState.currentTab = tab;
    
    // Mise à jour des onglets actifs
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tab) {
            item.classList.add('active');
        }
    });
    
    renderPage();
}

function toggleRole() {
    AppState.role = AppState.role === 'agriculteur' ? 'personnel' : 'agriculteur';
    renderPage();
    updateRoleBadge();
}

function updateRoleBadge() {
    const badge = document.getElementById('current-role');
    badge.textContent = AppState.role === 'agriculteur' ? 'AGRICULTEUR' : 'PERSONNEL CAFCOOP';
    badge.style.background = AppState.role === 'agriculteur' 
        ? 'rgba(255,255,255,0.25)' 
        : 'var(--accent)';
}

// ===== RENDU DES PAGES =====
function renderPage() {
    const container = document.getElementById('main-content');
    updateRoleBadge();
    
    switch(AppState.currentTab) {
        case 'home':
            renderHome(container);
            break;
        case 'boutique':
            renderBoutique(container);
            break;
        case 'diagnostic':
            renderDiagnostic(container);
            break;
        case 'profil':
            renderProfil(container);
            break;
        default:
            renderHome(container);
    }
}

// ===== PAGE ACCUEIL =====
function renderHome(container) {
    if (AppState.role === 'agriculteur') {
        container.innerHTML = `
            <div class="fade-in">
                <h2 style="margin-bottom: 8px;">Bonjour ${AppState.utilisateur.nom.split(' ')[0]} 👋</h2>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">
                    ${AppState.utilisateur.region}, ${AppState.utilisateur.commune}
                </p>

                <div class="action-grid">
                    <button class="action-btn primary" onclick="navigateTo('diagnostic')">
                        <i>🩺</i>
                        <span>Diagnostic<br>Terrain</span>
                    </button>
                    <button class="action-btn" onclick="navigateTo('boutique')">
                        <i>🛒</i>
                        <span>Boutique<br>Intrants</span>
                    </button>
                    <button class="action-btn" onclick="afficherFormations()">
                        <i>📚</i>
                        <span>Formations<br>Agricoles</span>
                    </button>
                    <button class="action-btn" onclick="afficherMeteo()">
                        <i>🌦️</i>
                        <span>Météo<br>Locale</span>
                    </button>
                </div>

                <div class="section-title">📢 Actualités & Conseils</div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>Campagne Cacao 2025/2026</h3>
                        <span class="status-pill status-ok">Actif</span>
                    </div>
                    <p>Début des traitements phytosanitaires dans le Centre. Prix bord champ: 1.600 FCFA/kg.</p>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3>⚠️ Alerte Chenille Légionnaire</h3>
                        <span class="status-pill status-urgent">Important</span>
                    </div>
                    <p>Forte pression FAW signalée dans l'Ouest. Traitez vos maïs dès maintenant avec AMPLIGO.</p>
                </div>

                <div class="card">
                    <h3>💡 Conseil de la semaine</h3>
                    <p><strong>Cacao:</strong> C'est le moment de l'élagage sanitaire. Enlevez les rameaux morts et malades pour prévenir les mirides.</p>
                </div>

                <div class="section-title">📊 Mes Statistiques</div>
                
                <div class="card">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div>
                            <div style="color: var(--text-secondary); font-size: 12px;">Superficie</div>
                            <div style="font-size: 20px; font-weight: 700; color: var(--primary);">
                                ${AppState.utilisateur.superficie}
                            </div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 12px;">Cultures</div>
                            <div style="font-size: 20px; font-weight: 700; color: var(--primary);">
                                ${AppState.utilisateur.cultures.length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Vue Personnel
        container.innerHTML = `
            <div class="fade-in">
                <h2>Tableau de Bord Coopérative</h2>
                
                <div class="action-grid">
                    <button class="action-btn primary" onclick="navigateTo('diagnostic')">
                        <i>📋</i>
                        <span>Dossiers<br>Diagnostics</span>
                    </button>
                    <button class="action-btn" onclick="navigateTo('boutique')">
                        <i>📦</i>
                        <span>Gestion<br>Commandes</span>
                    </button>
                    <button class="action-btn" onclick="afficherStatistiques()">
                        <i>📊</i>
                        <span>Statistiques<br>Ventes</span>
                    </button>
                    <button class="action-btn" onclick="afficherStock()">
                        <i>📦</i>
                        <span>Gestion<br>Stock</span>
                    </button>
                </div>

                <div class="section-title">📈 Résumé Aujourd'hui</div>
                
                <div class="card">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; text-align: center;">
                        <div>
                            <div style="font-size: 24px; font-weight: 700; color: var(--primary);">12</div>
                            <div style="font-size: 11px; color: var(--text-secondary);">Diagnostics</div>
                        </div>
                        <div>
                            <div style="font-size: 24px; font-weight: 700; color: var(--accent);">8</div>
                            <div style="font-size: 11px; color: var(--text-secondary);">Commandes</div>
                        </div>
                        <div>
                            <div style="font-size: 24px; font-weight: 700; color: var(--success);">450K</div>
                            <div style="font-size: 11px; color: var(--text-secondary);">FCFA Ventes</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// ===== PAGE BOUTIQUE =====
function renderBoutique(container) {
    if (AppState.role === 'agriculteur') {
        // Récupération de tous les produits
        const tousLesProduits = [
            ...CATALOGUE_CAFCOOP.engrais,
            ...CATALOGUE_CAFCOOP.micronutriments,
            ...CATALOGUE_CAFCOOP.biostimulants,
            ...CATALOGUE_CAFCOOP.phytosanitaires
        ];

        container.innerHTML = `
            <div class="fade-in">
                <h2>Boutique Intrants CAFCOOP</h2>
                
                <div class="form-group">
                    <select id="filter-categorie" onchange="filtrerProduits()">
                        <option value="tous">Toutes catégories</option>
                        <option value="Engrais">Engrais foliaires</option>
                        <option value="Micronutriment">Micronutriments</option>
                        <option value="Biostimulant">Biostimulants</option>
                        <option value="Insecticide">Insecticides</option>
                        <option value="Fongicide">Fongicides</option>
                        <option value="Herbicide">Herbicides</option>
                    </select>
                </div>

                <div class="section-title">🌿 Produits disponibles</div>
                
                <div id="liste-produits">
                    ${tousLesProduits.map(produit => `
                        <div class="card product-card" onclick="afficherDetailsProduit('${produit.id}')">
                            <div class="product-icon">${produit.icon}</div>
                            <div class="product-info">
                                <div class="product-name">${produit.nom}</div>
                                <div style="font-size: 11px; color: var(--text-secondary); margin: 4px 0;">
                                    ${produit.categorie} • ${produit.marque}
                                </div>
                                <div class="product-price">${produit.prix.toLocaleString()} FCFA</div>
                                <div style="font-size: 11px; color: var(--text-secondary);">
                                    ${produit.unite}
                                </div>
                                <span class="product-stock">${produit.stock}</span>
                            </div>
                            <button class="btn btn-primary" 
                                    style="width: auto; padding: 10px 16px; margin: 0;"
                                    onclick="event.stopPropagation(); ajouterAuPanier('${produit.id}')">
                                +
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        // Vue Personnel - Commandes
        const commandes = SystemeCommande.obtenirTous();
        
        container.innerHTML = `
            <div class="fade-in">
                <h2>Gestion des Commandes</h2>
                
                ${commandes.length === 0 ? `
                    <div class="card" style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                        <p>Aucune commande pour le moment</p>
                    </div>
                ` : commandes.map(cmd => `
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <h3>${cmd.id}</h3>
                                <p style="margin-top: 4px;">${cmd.date}</p>
                            </div>
                            <span class="status-pill status-pending">${cmd.statut}</span>
                        </div>
                        <div style="margin-top: 12px;">
                            <strong>${cmd.articles.length} article(s)</strong>
                            <div style="font-size: 20px; color: var(--accent); font-weight: 700; margin-top: 8px;">
                                ${cmd.total.toLocaleString()} FCFA
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="validerCommande('${cmd.id}')">
                            Valider la commande
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// ===== PAGE DIAGNOSTIC =====
function renderDiagnostic(container) {
    if (AppState.role === 'agriculteur') {
        container.innerHTML = `
            <div class="fade-in">
                <h2>Diagnostic Phytosanitaire</h2>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">
                    Identifiez les maladies et ravageurs de vos cultures
                </p>

                <div class="form-group">
                    <label>🌾 Sélectionnez votre culture</label>
                    <select id="diag-culture" onchange="chargerSymptomes()">
                        <option value="">-- Choisir une culture --</option>
                        ${Object.keys(BASE_PATHOLOGIES).map(culture => 
                            `<option value="${culture}">${culture}</option>`
                        ).join('')}
                    </select>
                </div>

                <div id="zone-symptomes"></div>

                <div class="card" id="zone-photo" style="display: none;">
                    <h3>📸 Photo de la maladie/ravageur</h3>
                    <input type="file" 
                           accept="image/*" 
                           onchange="chargerPhoto(this)"
                           style="width: 100%; margin-top: 10px;">
                    <div id="apercu-photo" class="image-preview"></div>
                </div>

                <div class="form-group" style="display: none;" id="zone-commentaire">
                    <label>💬 Informations complémentaires</label>
                    <textarea id="diag-commentaire" 
                              rows="3" 
                              placeholder="Décrivez d'autres symptômes observés..."
                              style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #E0E0E0; font-family: inherit;"></textarea>
                </div>

                <button class="btn btn-primary" 
                        id="btn-envoyer-diag" 
                        onclick="envoyerDiagnostic()"
                        style="display: none;">
                    📤 Envoyer le diagnostic
                </button>
            </div>
        `;
    } else {
        // Vue Personnel - Dossiers diagnostics
        const diagnostics = SystemeDiagnostic.obtenirTous();
        
        container.innerHTML = `
            <div class="fade-in">
                <h2>Dossiers Diagnostics</h2>
                
                ${diagnostics.length === 0 ? `
                    <div class="card" style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🩺</div>
                        <p>Aucun diagnostic en attente</p>
                    </div>
                ` : diagnostics.map(diag => `
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <h3>${diag.producteur}</h3>
                                <p style="margin-top: 4px;">${diag.culture} • ${diag.date}</p>
                            </div>
                            <span class="status-pill ${diag.statut === 'En attente' ? 'status-pending' : 'status-ok'}">
                                ${diag.statut}
                            </span>
                        </div>
                        
                        ${diag.symptomes && diag.symptomes.length > 0 ? `
                            <div style="margin-top: 12px;">
                                <strong>Symptômes signalés:</strong>
                                <ul style="margin: 8px 0; padding-left: 20px; font-size: 13px;">
                                    ${diag.symptomes.slice(0, 3).map(s => `<li>${s}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${diag.photo ? `
                            <img src="${diag.photo}" 
                                 style="width: 100%; border-radius: 8px; margin-top: 12px;"
                                 alt="Photo diagnostic">
                        ` : ''}
                        
                        ${diag.statut === 'En attente' ? `
                            <button class="btn btn-primary" onclick="transfererExpert('${diag.id}')">
                                👨‍🌾 Transférer à un expert
                            </button>
                        ` : diag.expert ? `
                            <div style="margin-top: 12px; padding: 10px; background: #E8F5E9; border-radius: 8px; font-size: 13px;">
                                ✅ Transféré à <strong>${diag.expert}</strong>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// ===== PAGE PROFIL =====
function renderProfil(container) {
    const user = AppState.utilisateur;
    
    container.innerHTML = `
        <div class="fade-in">
            <h2>Mon Profil</h2>
            
            <div class="card">
                <div style="text-align: center; padding: 20px 0;">
                    <div style="font-size: 64px; margin-bottom: 12px;">👤</div>
                    <h3 style="margin-bottom: 4px;">${user.nom}</h3>
                    <p>${user.telephone}</p>
                </div>
            </div>

            <div class="section-title">📍 Localisation</div>
            <div class="card">
                <p><strong>Région:</strong> ${user.region}</p>
                <p style="margin-top: 8px;"><strong>Commune:</strong> ${user.commune}</p>
            </div>

            <div class="section-title">🌾 Exploitation</div>
            <div class="card">
                <p><strong>Superficie totale:</strong> ${user.superficie}</p>
                <p style="margin-top: 8px;"><strong>Cultures:</strong></p>
                <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                    ${user.cultures.map(c => `
                        <span class="status-pill status-ok">${c}</span>
                    `).join('')}
                </div>
            </div>

            <div class="section-title">📞 Support</div>
            <div class="card">
                <button class="btn btn-primary" onclick="contacterSupport()">
                    💬 Contacter CAFCOOP
                </button>
                <button class="btn btn-secondary" onclick="afficherFAQ()">
                    ❓ Questions fréquentes
                </button>
            </div>

            <div class="card" style="text-align: center;">
                <p style="font-size: 12px; color: var(--text-secondary);">
                    Version 1.0.0 • CAFCOOP LTD<br>
                    © 2025 - Tous droits réservés
                </p>
            </div>
        </div>
    `;
}

// ===== FONCTIONS DIAGNOSTIC =====
function chargerSymptomes() {
    const culture = document.getElementById('diag-culture').value;
    const zoneSymptomes = document.getElementById('zone-symptomes');
    const zonePhoto = document.getElementById('zone-photo');
    const zoneCommentaire = document.getElementById('zone-commentaire');
    const btnEnvoyer = document.getElementById('btn-envoyer-diag');
    
    if (!culture) {
        zoneSymptomes.innerHTML = '';
        zonePhoto.style.display = 'none';
        zoneCommentaire.style.display = 'none';
        btnEnvoyer.style.display = 'none';
        return;
    }
    
    const pathologies = BASE_PATHOLOGIES[culture];
    
    zoneSymptomes.innerHTML = `
        <div class="section-title">⚕️ Symptômes observés</div>
        ${pathologies.map(patho => `
            <div class="card">
                <h3>${patho.nom}</h3>
                <div class="checkbox-group">
                    ${patho.symptomes.map((symptome, idx) => `
                        <label>
                            <input type="checkbox" 
                                   class="symptome-checkbox" 
                                   value="${symptome}"
                                   data-pathologie="${patho.id}">
                            <span>${symptome}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    `;
    
    zonePhoto.style.display = 'block';
    zoneCommentaire.style.display = 'block';
    btnEnvoyer.style.display = 'block';
}

function chargerPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            AppState.photoActuelle = e.target.result;
            document.getElementById('apercu-photo').innerHTML = `
                <img src="${e.target.result}" 
                     style="max-width: 100%; border-radius: 12px; margin-top: 12px;"
                     alt="Aperçu photo">
            `;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function envoyerDiagnostic() {
    const culture = document.getElementById('diag-culture').value;
    const symptomesCoches = Array.from(document.querySelectorAll('.symptome-checkbox:checked'))
        .map(cb => cb.value);
    const commentaire = document.getElementById('diag-commentaire').value;
    
    if (!culture) {
        afficherNotification('Veuillez sélectionner une culture', 'error');
        return;
    }
    
    if (symptomesCoches.length === 0) {
        afficherNotification('Veuillez cocher au moins un symptôme', 'error');
        return;
    }
    
    const diagnostic = SystemeDiagnostic.creer({
        producteur: AppState.utilisateur.nom,
        culture: culture,
        symptomes: symptomesCoches,
        commentaire: commentaire,
        photo: AppState.photoActuelle
    });
    
    afficherNotification('Diagnostic envoyé avec succès !', 'success');
    
    // Réinitialiser
    AppState.photoActuelle = null;
    setTimeout(() => {
        navigateTo('home');
    }, 1500);
}

function transfererExpert(diagId) {
    const expert = prompt('Nom de l\'expert agronome :');
    if (expert && expert.trim()) {
        SystemeDiagnostic.transferer(diagId, expert.trim());
        afficherNotification(`Dossier transféré à ${expert}`, 'success');
        renderDiagnostic(document.getElementById('main-content'));
    }
}

// ===== FONCTIONS BOUTIQUE =====
function ajouterAuPanier(produitId) {
    // Recherche du produit
    let produit = null;
    for (const categorie of Object.values(CATALOGUE_CAFCOOP)) {
        produit = categorie.find(p => p.id === produitId);
        if (produit) break;
    }
    
    if (produit) {
        AppState.panier.push(produit);
        updateCartSummary();
        afficherNotification(`${produit.nom} ajouté au panier`, 'success');
    }
}

function updateCartSummary() {
    const cartSummary = document.getElementById('cart-summary');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    const total = AppState.panier.reduce((sum, p) => sum + p.prix, 0);
    
    cartCount.textContent = AppState.panier.length;
    cartTotal.textContent = total.toLocaleString() + ' FCFA';
    
    if (AppState.panier.length > 0) {
        cartSummary.classList.add('active');
    } else {
        cartSummary.classList.remove('active');
    }
}

function viewCart() {
    if (AppState.panier.length === 0) return;
    
    const total = AppState.panier.reduce((sum, p) => sum + p.prix, 0);
    
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">🛒 Mon Panier</h2>
            <span class="close-modal" onclick="fermerModal()">✕</span>
        </div>
        
        ${AppState.panier.map((produit, idx) => `
            <div class="card" style="display: flex; gap: 12px; align-items: center;">
                <div style="font-size: 32px;">${produit.icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600;">${produit.nom}</div>
                    <div style="font-size: 13px; color: var(--text-secondary);">${produit.unite}</div>
                    <div style="color: var(--accent); font-weight: 700; margin-top: 4px;">
                        ${produit.prix.toLocaleString()} FCFA
                    </div>
                </div>
                <button onclick="retirerDuPanier(${idx})" 
                        style="background: var(--danger); color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer;">
                    ✕
                </button>
            </div>
        `).join('')}
        
        <div style="background: #F5F5F5; padding: 16px; border-radius: 12px; margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong>TOTAL:</strong>
                <strong style="font-size: 24px; color: var(--accent);">
                    ${total.toLocaleString()} FCFA
                </strong>
            </div>
        </div>
        
        <button class="btn btn-primary" onclick="procederPaiement()">
            💳 Payer par Mobile Money
        </button>
    `;
    
    document.getElementById('modal').classList.add('active');
}

function retirerDuPanier(index) {
    AppState.panier.splice(index, 1);
    updateCartSummary();
    viewCart();
}

function procederPaiement() {
    const telephone = prompt('Numéro Mobile Money (Orange/MTN):');
    
    if (!telephone) return;
    
    afficherNotification('Demande de paiement envoyée...', 'info');
    
    setTimeout(() => {
        const total = AppState.panier.reduce((sum, p) => sum + p.prix, 0);
        const commande = SystemeCommande.creer([...AppState.panier], total);
        
        AppState.panier = [];
        updateCartSummary();
        fermerModal();
        
        afficherNotification('Paiement validé ! Commande N°' + commande.id, 'success');
        
        setTimeout(() => {
            navigateTo('home');
        }, 2000);
    }, 2000);
}

function afficherDetailsProduit(produitId) {
    // Recherche du produit
    let produit = null;
    for (const categorie of Object.values(CATALOGUE_CAFCOOP)) {
        produit = categorie.find(p => p.id === produitId);
        if (produit) break;
    }
    
    if (!produit) return;
    
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">${produit.icon} ${produit.nom}</h2>
            <span class="close-modal" onclick="fermerModal()">✕</span>
        </div>
        
        <div style="background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 16px;">
            <div style="font-size: 32px; font-weight: 700;">${produit.prix.toLocaleString()} FCFA</div>
            <div style="font-size: 14px; opacity: 0.9;">${produit.unite}</div>
        </div>
        
        <div class="card">
            <h3>📋 Description</h3>
            <p>${produit.description}</p>
        </div>
        
        <div class="card">
            <h3>🧪 Composition</h3>
            <p>${produit.composition}</p>
        </div>
        
        <div class="card">
            <h3>💉 Dose recommandée</h3>
            <p>${produit.dose}</p>
        </div>
        
        <div class="card">
            <h3>⏰ Moment d'application</h3>
            <p>${produit.moment}</p>
        </div>
        
        <div class="card">
            <h3>🌾 Cultures</h3>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
                ${produit.cultures.map(c => `
                    <span class="status-pill status-ok">${c}</span>
                `).join('')}
            </div>
        </div>
        
        <button class="btn btn-primary" onclick="ajouterAuPanier('${produit.id}'); fermerModal();">
            🛒 Ajouter au panier
        </button>
    `;
    
    document.getElementById('modal').classList.add('active');
}

function filtrerProduits() {
    const categorie = document.getElementById('filter-categorie').value;
    // Cette fonction peut être étendue pour filtrer réellement les produits
    // Pour l'instant, on recharge simplement la page boutique
    renderBoutique(document.getElementById('main-content'));
}

// ===== FONCTIONS UTILITAIRES =====
function fermerModal() {
    document.getElementById('modal').classList.remove('active');
}

function afficherNotification(message, type = 'success') {
    const notif = document.getElementById('notification');
    notif.textContent = message;
    notif.style.background = type === 'success' ? 'var(--success)' : 
                              type === 'error' ? 'var(--danger)' : '#2196F3';
    notif.classList.add('show');
    
    setTimeout(() => {
        notif.classList.remove('show');
    }, 3000);
}

function fabAction() {
    // Action du bouton flottant (peut être personnalisée)
    afficherNotification('Fonctionnalité caméra en développement', 'info');
}

// Fonctions factices pour la démo
function afficherFormations() {
    afficherNotification('Module Formations bientôt disponible', 'info');
}

function afficherMeteo() {
    afficherNotification('Module Météo en développement', 'info');
}

function afficherStatistiques() {
    afficherNotification('Statistiques détaillées à venir', 'info');
}

function afficherStock() {
    afficherNotification('Gestion stock en développement', 'info');
}

function contacterSupport() {
    window.open('tel:+237222318351');
}

function afficherFAQ() {
    afficherNotification('FAQ bientôt disponible', 'info');
}

function validerCommande(cmdId) {
    SystemeCommande.mettreAJour(cmdId, { statut: 'Validée' });
    afficherNotification('Commande validée !', 'success');
    renderBoutique(document.getElementById('main-content'));
}

// Fermer modal en cliquant en dehors
document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
        fermerModal();
    }
});