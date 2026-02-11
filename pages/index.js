import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { getSupabase } from '../lib/supabase-client';
import { BASE_PATHOLOGIES, PRODUITS_AGRICOLES } from '../public/js/cafcoop_data';

const APP_VERSION = '1.1.0';

export default function Home() {
  const [role, setRole] = useState('agriculteur');
  const [currentTab, setCurrentTab] = useState('home');
  const [panier, setPanier] = useState([]);
  const [notification, setNotification] = useState(null);

  // --- ÉTATS DIAGNOSTIC ---
  const [diagCulture, setDiagCulture] = useState('');
  const [selectedSymptomes, setSelectedSymptomes] = useState([]);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [diagHistory, setDiagHistory] = useState([]);
  const [quickSolution, setQuickSolution] = useState(null);

  // --- ÉTATS BOUTIQUE & COMMANDES ---
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterStatut, setFilterStatut] = useState('tous');
  const [commandesList, setCommandesList] = useState([]);

  // --- ÉTAT PROFIL ---
  const [userProfile, setUserProfile] = useState({ nom: '', prenom: '', telephone: '', commune: '' });

  useEffect(() => {
    chargerDonnees();
  }, [role]);

  const chargerDonnees = async () => {
    const supabase = await getSupabase();
    // Charger Historique Diags
    const { data: diags } = await supabase.from('diagnostics').select('*').order('date_creation', { ascending: false });
    if (diags) setDiagHistory(diags);
    
    // Charger Commandes
    const { data: cmd } = await supabase.from('commandes').select('*').order('date_commande', { ascending: false });
    if (cmd) setCommandesList(cmd);

    // Charger Profil (Simulation ID 1)
    const { data: user } = await supabase.from('utilisateurs').select('*').eq('id_utilisateur', 1).single();
    if (user) setUserProfile(user);
  };

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- LOGIQUE DIAGNOSTIC (Points 1, 2, 3, 5) ---
  const analyserMotsCles = (symptomes) => {
    const keywords = {
      'tâches brunes': 'Possible Alternariose. Réduire l\'humidité et appliquer un fongicide à base de cuivre.',
      'pucerons': 'Attaque de ravageurs. Utilisez un insecticide bio à base de Neem.',
      'jaunissement': 'Carence en azote suspectée ou stress hydrique.'
    };
    const found = symptomes.map(s => s.split(':')[1].toLowerCase());
    for (let key in keywords) {
      if (found.some(f => f.includes(key))) return keywords[key];
    }
    return null;
  };

  const submitDiagnostic = async () => {
    const supabase = await getSupabase();
    const solution = analyserMotsCles(selectedSymptomes);
    
    const { error } = await supabase.from('diagnostics').insert({
      id_agriculteur: 1,
      id_culture: 1, // À lier dynamiquement
      commentaire_agriculteur: selectedSymptomes.join(', '),
      localisation_gps: gpsLocation,
      statut: 'en_attente'
    });

    if (!error) {
      if (solution) setQuickSolution(solution);
      showNotif("Diagnostic envoyé au staff !");
      // Reset formulaire (Point 2)
      setDiagCulture('');
      setSelectedSymptomes([]);
      setGpsLocation(null);
      chargerDonnees();
    }
  };

  // --- LOGIQUE PANIER (Point Panier) ---
  const validerPanier = async (mode) => {
    const supabase = await getSupabase();
    const { error } = await supabase.from('commandes').insert({
        id_agriculteur: 1,
        montant_total: panier.reduce((sum, p) => sum + (p.prix * p.quantite), 0),
        mode_paiement: mode,
        statut: 'en_attente'
    });

    if (!error) {
        setPanier([]); // Reset panier (Point Panier)
        localStorage.removeItem('cafcoop_panier');
        showNotif("Commande enregistrée !");
        setCurrentTab('home');
        chargerDonnees();
    }
  };

  // --- LOGIQUE PROFIL (Point Profil) ---
  const saveProfil = async () => {
    const supabase = await getSupabase();
    const { error } = await supabase.from('utilisateurs').update(userProfile).eq('id_utilisateur', 1);
    if (!error) showNotif("Profil mis à jour !");
  };

  return (
    <div className="phone-frame">
      <Head><title>CAFCOOP v{APP_VERSION}</title></Head>

      <header className="app-header">
        <div className="header-content">
          <div className="app-title">🍃 CAFCOOP</div>
          <div className="role-badge" onClick={() => setRole(role === 'agriculteur' ? 'personnel' : 'agriculteur')}>
            {role.toUpperCase()}
          </div>
        </div>
      </header>

      <main className="content-area">
        {/* BOUTIQUE (Points Images & Description) */}
        {currentTab === 'boutique' && (
          <div className="fade-in">
            <h2>🛒 Intrants Disponibles</h2>
            <div className="product-grid">
              {PRODUITS_AGRICOLES.map(p => (
                <div key={p.id} className="card product-card" onClick={() => setSelectedProduct(p)}>
                  <div className="product-img-container">
                    <span style={{fontSize: '40px'}}>{p.image}</span>
                  </div>
                  <div className="product-info">
                    <strong>{p.nom}</strong>
                    <p className="price">{p.prix.toLocaleString()} FCFA</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DIAGNOSTIC (Historique & États) */}
        {currentTab === 'diagnostic' && (
          <div className="fade-in">
            <div className="tab-menu">
              <button onClick={() => setDiagCulture('form')}>Nouveau</button>
              <button onClick={() => setDiagCulture('list')}>Historique</button>
            </div>

            {diagCulture === 'form' ? (
              <div className="card">
                <h3>🩺 Formulaire</h3>
                {/* ... (Champs de sélection culture/symptômes) ... */}
                <button className="action-btn primary" onClick={submitDiagnostic}>Envoyer</button>
                {quickSolution && (
                  <div className="quick-advice">
                    <strong>💡 Solution Rapide :</strong>
                    <p>{quickSolution}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="diag-history">
                {diagHistory.map(d => (
                  <div key={d.id_diagnostic} className="card item-history">
                    <div className="history-header">
                      <span>#{d.id_diagnostic}</span>
                      <span className={`status-pill ${d.statut}`}>{d.statut}</span>
                    </div>
                    <small>{new Date(d.date_creation).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COMMANDES (Filtres) */}
        {currentTab === 'commandes' && (
          <div className="fade-in">
            <h2>📦 Mes Commandes</h2>
            <select className="filter-select" onChange={(e) => setFilterStatut(e.target.value)}>
                <option value="tous">Tous les états</option>
                <option value="en_attente">En attente</option>
                <option value="livré">Livré</option>
            </select>
            {commandesList.filter(c => filterStatut === 'tous' || c.statut === filterStatut).map(c => (
              <div key={c.id_commande} className="card">
                <strong>Cmd #{c.id_commande}</strong> - {c.montant_total} FCFA
              </div>
            ))}
          </div>
        )}

        {/* PROFIL (Éditable) */}
        {currentTab === 'profil' && (
          <div className="fade-in card">
            <h2>👤 Mon Profil</h2>
            <label>Nom</label>
            <input type="text" value={userProfile.nom} onChange={(e) => setUserProfile({...userProfile, nom: e.target.value})} />
            <label>Prénom</label>
            <input type="text" value={userProfile.prenom} onChange={(e) => setUserProfile({...userProfile, prenom: e.target.value})} />
            <label>Téléphone</label>
            <input type="text" value={userProfile.telephone} onChange={(e) => setUserProfile({...userProfile, telephone: e.target.value})} />
            <button className="action-btn primary" style={{marginTop: 20}} onClick={saveProfil}>Enregistrer</button>
          </div>
        )}
      </main>

      {/* MODAL PRODUIT DÉTAILLÉ */}
      {selectedProduct && (
        <div className="modal active">
          <div className="card modal-content">
            <span className="close" onClick={() => setSelectedProduct(null)}>×</span>
            <div className="detail-header">
                <span style={{fontSize: 60}}>{selectedProduct.image}</span>
                <h2>{selectedProduct.nom}</h2>
            </div>
            <div className="detail-body">
                <p><strong>Composition :</strong> {selectedProduct.composition || 'N/A'}</p>
                <p><strong>Usage :</strong> {selectedProduct.usage || 'Traitement cultures variées'}</p>
                <div className="dosage-box">
                    <strong>Dosage recommandé :</strong>
                    <p>{selectedProduct.dosage || '100ml / 15L d\'eau'}</p>
                </div>
            </div>
            <button className="action-btn primary" onClick={() => { /* Ajout panier */ setSelectedProduct(null); }}>
              Ajouter au panier
            </button>
          </div>
        </div>
      )}

      {/* NAV BAR */}
      <nav className="bottom-nav">
        <div className={currentTab === 'home' ? 'active' : ''} onClick={() => setCurrentTab('home')}>🏠</div>
        <div className={currentTab === 'boutique' ? 'active' : ''} onClick={() => setCurrentTab('boutique')}>🛒</div>
        <div className={currentTab === 'diagnostic' ? 'active' : ''} onClick={() => setCurrentTab('diagnostic')}>🩺</div>
        <div className={currentTab === 'profil' ? 'active' : ''} onClick={() => setCurrentTab('profil')}>👤</div>
      </nav>

      {notification && <div className={`notification show ${notification.type}`}>{notification.msg}</div>}
    </div>
  );
}
