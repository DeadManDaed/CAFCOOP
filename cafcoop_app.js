/**
 * cafcoop_app.js
 * Logique principale de l'application CAFCOOP
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { BASE_PATHOLOGIES, PRODUITS_AGRICOLES, REGIONS_CAMEROUN } from "./cafcoop_data.js";

// --- CONFIGURATION FIREBASE (Tirée de ton fichier) ---
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

// --- ÉTAT GLOBAL ---
window.AppState = {
    role: 'agriculteur', // 'agriculteur' ou 'personnel'
    currentTab: 'home',
    panier: [],
    diagnosticsList: [], // Stockage local des données Firebase
    photoActuelle: null // Base64 temporaire
};

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    ecouterDiagnostics(); // Lancer l'écoute "WhatsApp"
    renderPage();
});

// --- ÉCOUTEUR TEMPS RÉEL (REMPLACE LE LOCALSTORAGE) ---
function ecouterDiagnostics() {
    const q = query(collection(db, "diagnostics"), orderBy("date", "desc"));
    onSnapshot(q, (snapshot) => {
        AppState.diagnosticsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Conversion du timestamp Firebase en date lisible
            date: doc.data().date ? new Date(doc.data().date.seconds * 1000).toLocaleString('fr-FR') : 'À l\'instant'
        }));

        // Notification sonore/visuelle pour le personnel
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added" && AppState.role === 'personnel') {
                const d = change.doc.data();
                afficherNotification(`🔔 Nouveau cas : ${d.culture} (${d.producteur})`, 'info');
            }
        });

        // Rafraîchir l'interface si on est sur l'onglet diagnostic
        if (AppState.currentTab === 'diagnostic') renderPage();
    });
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
    document.getElementById('current-role').innerText = AppState.role === 'agriculteur' ? 'AGRICULTEUR' : 'PERSONNEL';
    // Style du badge
    document.getElementById('current-role').style.background = AppState.role === 'personnel' ? '#FFC107' : 'rgba(255,255,255,0.2)';
    renderPage();
};

// --- RENDU DES PAGES ---
window.renderPage = () => {
    const container = document.getElementById('main-content');
    container.innerHTML = '';

    if (AppState.currentTab === 'home') renderHome(container);
    else if (AppState.currentTab === 'diagnostic') renderDiagnostic(container);
    else if (AppState.currentTab === 'boutique') renderBoutique(container);
};

// --- FONCTION DIAGNOSTIC (TA VERSION INTÉGRÉE) ---
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
        // Vue Personnel : On utilise la liste mise à jour par Firebase (AppState.diagnosticsList)
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
                                `<span style="color:green; font-size:12px;">✅ Géré par ${d.expert}</span>`
                             }
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// --- LOGIQUE MÉTIER DIAGNOSTIC ---

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
            AppState.photoActuelle = e.target.result; // Stockage en Base64
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

window.envoyerDiagnostic = async () => {
    const culture = document.getElementById('diag-culture').value;
    const checked = document.querySelectorAll('.chk-symp:checked');
    const symptomes = Array.from(checked).map(c => c.value);

    // Envoi vers Firebase
    try {
        await addDoc(collection(db, "diagnostics"), {
            producteur: "Utilisateur Démo", // À remplacer par un vrai login plus tard
            culture: culture,
            symptomes: symptomes,
            photo: AppState.photoActuelle,
            statut: "En attente",
            date: serverTimestamp()
        });
        
        afficherNotification("✅ Diagnostic envoyé avec succès !", "success");
        navigateTo('home');
        AppState.photoActuelle = null; // Reset
    } catch (e) {
        console.error(e);
        afficherNotification("Erreur d'envoi (Vérifiez connexion)", "error");
    }
};

window.transfererExpert = async (id) => {
    const expert = prompt("Nom de l'expert assigné :");
    if (expert) {
        try {
            const ref = doc(db, "diagnostics", id);
            await updateDoc(ref, {
                statut: "Transféré",
                expert: expert
            });
            afficherNotification("Dossier transféré", "success");
        } catch (e) {
            afficherNotification("Erreur de mise à jour", "error");
        }
    }
};

// --- FONCTIONS UTILITAIRES ---
window.afficherNotification = (msg, type) => {
    const notif = document.getElementById('notification');
    notif.innerText = msg;
    notif.style.backgroundColor = type === 'error' ? 'red' : type === 'success' ? 'green' : '#333';
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 3000);
};

// Fonction Home basique pour éviter les erreurs
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

// Fonction Boutique simplifiée
function renderBoutique(container) {
    container.innerHTML = `<h2>Boutique</h2>` + PRODUITS_AGRICOLES.map(p => `
        <div class="card">
            <div style="display:flex; justify-content:space-between;">
                <strong>${p.image} ${p.nom}</strong>
                <span>${p.prix} F</span>
            </div>
            <p>${p.desc}</p>
        </div>
    `).join('');
}

                        
        
        