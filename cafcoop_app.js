/**
 * cafcoop_app.js
 * Logique principale de l'application CAFCOOP - VERSION SUPABASE
 */

import { supabase, formatDate, getCurrentUser } from "./supabase-client.js";
import { BASE_PATHOLOGIES, PRODUITS_AGRICOLES, REGIONS_CAMEROUN } from "./cafcoop_data.js";

// --- ÉTAT GLOBAL (Inchangé) ---
window.AppState = {
    role: 'agriculteur', // 'agriculteur' ou 'personnel'
    currentTab: 'home',
    panier: [],
    diagnosticsList: [], // Stockage local des données Supabase
    photoActuelle: null, // Base64 temporaire
    currentUser: null // Utilisateur connecté
};

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', async () => {
    // Vérifier si l'utilisateur est connecté
    AppState.currentUser = await getCurrentUser();
    
    if (!AppState.currentUser) {
        // Rediriger vers page de connexion (à créer)
        console.log("Non connecté - Afficher login");
        // Pour l'instant, on continue en mode démo
    }
    
    ecouterDiagnostics(); // Lancer l'écoute temps réel
    renderPage();
});

// --- ÉCOUTEUR TEMPS RÉEL SUPABASE (Remplace Firebase onSnapshot) ---
function ecouterDiagnostics() {
    // 1. Charger les diagnostics existants
    chargerDiagnosticsInitiaux();
    
    // 2. S'abonner aux changements en temps réel
    const channel = supabase
        .channel('diagnostics-changes')
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'diagnostics' 
            }, 
            (payload) => {
                // Nouveau diagnostic ajouté
                const nouveauDiag = {
                    id: payload.new.id_diagnostic,
                    producteur: payload.new.commentaire_agriculteur || 'Utilisateur',
                    culture: payload.new.id_culture,
                    symptomes: payload.new.id_diagnostic, // À adapter selon votre structure
                    photo: null, // Les photos seront dans une autre table
                    statut: payload.new.statut || 'en_attente',
                    date: formatDate(payload.new.date_creation),
                    expert: null
                };
                
                AppState.diagnosticsList.unshift(nouveauDiag);
                
                // Notification pour le personnel
                if (AppState.role === 'personnel') {
                    afficherNotification(`🔔 Nouveau cas : ${nouveauDiag.culture} (${nouveauDiag.producteur})`, 'info');
                }
                
                // Rafraîchir l'interface
                if (AppState.currentTab === 'diagnostic') renderPage();
            }
        )
        .on('postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'diagnostics'
            },
            (payload) => {
                // Diagnostic mis à jour
                const index = AppState.diagnosticsList.findIndex(d => d.id === payload.new.id_diagnostic);
                if (index !== -1) {
                    AppState.diagnosticsList[index].statut = payload.new.statut;
                    AppState.diagnosticsList[index].expert = payload.new.id_expert;
                    
                    if (AppState.currentTab === 'diagnostic') renderPage();
                }
            }
        )
        .subscribe();
}

// Charger les diagnostics initiaux depuis Supabase
async function chargerDiagnosticsInitiaux() {
    try {
        const { data, error } = await supabase
            .from('diagnostics')
            .select(`
                id_diagnostic,
                id_agriculteur,
                id_culture,
                statut,
                commentaire_agriculteur,
                date_creation,
                date_observation,
                id_expert
            `)
            .order('date_creation', { ascending: false });
        
        if (error) throw error;
        
        // Transformer les données pour correspondre à votre format
        AppState.diagnosticsList = data.map(d => ({
            id: d.id_diagnostic,
            producteur: d.commentaire_agriculteur || 'Utilisateur Démo',
            culture: d.id_culture, // Vous devrez joindre avec la table cultures
            symptomes: [], // À remplir depuis la table diagnostic_symptomes
            photo: null, // À remplir depuis la table diagnostic_photos
            statut: d.statut === 'en_attente' ? 'En attente' : d.statut === 'resolu' ? 'Résolu' : 'Transféré',
            date: formatDate(d.date_creation),
            expert: d.id_expert
        }));
        
        if (AppState.currentTab === 'diagnostic') renderPage();
        
    } catch (error) {
        console.error('Erreur chargement diagnostics:', error);
        afficherNotification('Erreur de connexion à la base de données', 'error');
    }
}

// --- NAVIGATION (Inchangée) ---
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
    document.getElementById('current-role').innerText = AppState.role === 'agriculteur' ? 'AGRICULTEUR' : 'PERSONNEL';
    document.getElementById('current-role').style.background = AppState.role === 'personnel' ? '#FFC107' : 'rgba(255,255,255,0.2)';
    renderPage();
};

// --- RENDU DES PAGES (Inchangé) ---
window.renderPage = () => {
    const container = document.getElementById('main-content');
    container.innerHTML = '';

    if (AppState.currentTab === 'home') renderHome(container);
    else if (AppState.currentTab === 'diagnostic') renderDiagnostic(container);
    else if (AppState.currentTab === 'boutique') renderBoutique(container);
};

// --- FONCTION DIAGNOSTIC (Votre version, inchangée dans l'UI) ---
window.renderDiagnostic = (container) => {
    if (AppState.role === 'agriculteur') {
        container.innerHTML = `
            <div class="fade-in">
                <h2>Diagnostic Phytosanitaire</h2>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">Identifiez les maladies et ravageurs</p>
                <div class="form-group">
                    <label>🌾 Sélectionnez votre culture</label>
                    <select id="diag-culture" onchange="chargerSymptomes()" style="width:100%; padding:12px; border-radius:8px; border:1px solid #ddd;">
                        <option value="">-- Choisir --</option>
                        ${Object.keys(BASE_PATHOLOGIES).map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <div id="zone-symptomes"></div>
                <div class="card" id="zone-photo" style="display: none;">
                    <h3>📸 Photo</h3>
                    <input type="file" accept="image/*" onchange="chargerPhoto(this)">
                    <div id="apercu-photo" style="margin-top:10px;"></div>
                </div>
                <button class="btn btn-primary" id="btn-envoyer-diag" onclick="envoyerDiagnostic()" style="display:none; width:100%; margin-top:15px;">📤 Envoyer le dossier</button>
            </div>
        `;
    } else {
        // Vue Personnel : utilise AppState.diagnosticsList
        container.innerHTML = `
            <div class="fade-in">
                <h2>Dossiers Diagnostics (${AppState.diagnosticsList.length})</h2>
                ${AppState.diagnosticsList.length === 0 ? `<p>Aucun dossier.</p>` : AppState.diagnosticsList.map(d => `
                    <div class="card" style="border-left: 4px solid ${d.statut === 'En attente' ? 'orange' : 'green'};">
                        <div style="display:flex; justify-content:space-between;">
                            <strong>${d.producteur}</strong>
                            <small>${d.date}</small>
                        </div>
                        <div style="color:var(--primary); font-weight:bold;">${d.culture}</div>
                        <ul style="font-size:12px; padding-left:20px; color:#555;">${d.symptomes.map(s => `<li>${s}</li>`).join('')}</ul>
                        ${d.photo ? `<img src="${d.photo}" style="width:100%; border-radius:8px; margin-top:5px; max-height:150px; object-fit:cover;">` : ''}
                        
                        <div style="margin-top:10px;">
                             ${d.statut === 'En attente' ? 
                                `<button class="btn btn-primary" style="padding:5px 10px; font-size:12px;" onclick="transfererExpert('${d.id}')">Transférer Expert</button>` : 
                                `<span style="color:green; font-size:12px;">✅ Géré par ${d.expert || 'Expert'}</span>`
                             }
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// --- LOGIQUE MÉTIER DIAGNOSTIC (Inchangée dans l'UI) ---

window.chargerSymptomes = () => {
    const culture = document.getElementById('diag-culture').value;
    const zone = document.getElementById('zone-symptomes');
    const zonePhoto = document.getElementById('zone-photo');

    if (!culture) {
        zone.innerHTML = '';
        zonePhoto.style.display = 'none';
        return;
    }

    const maladies = BASE_PATHOLOGIES[culture];
    zone.innerHTML = maladies.map(m => `
        <div class="card" style="margin-bottom:10px;">
            <strong>${m.nom}</strong>
            ${m.symptomes.map(s => `
                <label style="display:block; margin-top:5px;">
                    <input type="checkbox" class="chk-symp" value="${s}" onchange="verifierBoutonEnvoi()"> ${s}
                </label>
            `).join('')}
        </div>
    `).join('');

    zonePhoto.style.display = 'block';
};

window.chargerPhoto = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            AppState.photoActuelle = e.target.result;
            document.getElementById('apercu-photo').innerHTML = `<img src="${e.target.result}" style="width:100px; border-radius:5px;">`;
            verifierBoutonEnvoi();
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.verifierBoutonEnvoi = () => {
    const checked = document.querySelectorAll('.chk-symp:checked').length > 0;
    const btn = document.getElementById('btn-envoyer-diag');
    if(btn) btn.style.display = checked ? 'block' : 'none';
};

// --- ENVOI DIAGNOSTIC (Adapté pour Supabase) ---
window.envoyerDiagnostic = async () => {
    const culture = document.getElementById('diag-culture').value;
    const checked = document.querySelectorAll('.chk-symp:checked');
    const symptomes = Array.from(checked).map(c => c.value);

    try {
        // 1. Obtenir l'ID de la culture depuis la base
        const { data: cultureData, error: cultureError } = await supabase
            .from('cultures')
            .select('id_culture')
            .eq('nom_culture', culture)
            .single();
        
        if (cultureError) throw cultureError;

        // 2. Créer le diagnostic
        const { data: diagnostic, error: diagError } = await supabase
            .from('diagnostics')
            .insert({
                id_agriculteur: 1, // À remplacer par l'ID réel de l'agriculteur connecté
                id_culture: cultureData.id_culture,
                statut: 'en_attente',
                priorite: 'normale',
                commentaire_agriculteur: `Diagnostic automatique - ${culture}`,
                date_observation: new Date().toISOString(),
                date_creation: new Date().toISOString()
            })
            .select()
            .single();
        
        if (diagError) throw diagError;

        // 3. Upload photo si présente
        if (AppState.photoActuelle) {
            // Convertir base64 en Blob
            const blob = await fetch(AppState.photoActuelle).then(r => r.blob());
            const fileName = `diag_${diagnostic.id_diagnostic}_${Date.now()}.jpg`;
            
            const { error: uploadError } = await supabase.storage
                .from('diagnostic-photos')
                .upload(fileName, blob);
            
            if (!uploadError) {
                // Enregistrer la photo dans la table
                await supabase
                    .from('diagnostic_photos')
                    .insert({
                        id_diagnostic: diagnostic.id_diagnostic,
                        url_photo: fileName,
                        date_upload: new Date().toISOString()
                    });
            }
        }

        // 4. Enregistrer les symptômes (simplifié pour l'instant)
        // Vous devrez d'abord créer les symptômes dans la table symptomes
        // puis les lier dans diagnostic_symptomes

        afficherNotification("✅ Diagnostic envoyé avec succès !", "success");
        navigateTo('home');
        AppState.photoActuelle = null;
        
    } catch (error) {
        console.error('Erreur:', error);
        afficherNotification("❌ Erreur d'envoi: " + error.message, "error");
    }
};

// --- TRANSFERT EXPERT (Adapté pour Supabase) ---
window.transfererExpert = async (id) => {
    const expert = prompt("Nom de l'expert assigné :");
    if (expert) {
        try {
            const { error } = await supabase
                .from('diagnostics')
                .update({
                    statut: 'transfere',
                    id_expert: 1 // À remplacer par l'ID réel de l'expert
                })
                .eq('id_diagnostic', id);
            
            if (error) throw error;
            
            afficherNotification("✅ Dossier transféré", "success");
        } catch (error) {
            console.error(error);
            afficherNotification("❌ Erreur de mise à jour", "error");
        }
    }
};

// --- FONCTIONS UTILITAIRES (Inchangées) ---
window.afficherNotification = (msg, type) => {
    const notif = document.getElementById('notification');
    notif.innerText = msg;
    notif.style.backgroundColor = type === 'error' ? 'red' : type === 'success' ? 'green' : '#333';
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 3000);
};

// --- HOME (Inchangée) ---
function renderHome(container) {
    container.innerHTML = `
        <div style="text-align:center; padding:20px;">
            <h2>Bienvenue sur CAFCOOP</h2>
            <div class="card" onclick="navigateTo('boutique')">
                <h3>🛒 Boutique Stoller</h3>
                <p>Découvrez la gamme Harvest More</p>
            </div>
            <div class="card" onclick="navigateTo('diagnostic')">
                <h3>🩺 Diagnostic</h3>
                <p>Identifier un problème au champ</p>
            </div>
        </div>
    `;
}

// --- BOUTIQUE (Inchangée) ---
function renderBoutique(container) {
    container.innerHTML = `<h2>Boutique</h2>` + PRODUITS_AGRICOLES.map(p => `
        <div class="card">
            <div style="display:flex; justify-content:space-between;">
                <strong>${p.image} ${p.nom}</strong>
                <span>${p.prix} FCFA</span>
            </div>
            <p>${p.description}</p>
        </div>
    `).join('');
}