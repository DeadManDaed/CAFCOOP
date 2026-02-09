//pages/index.js

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { getSupabase, formatDate } from '../lib/supabase-client';
import { BASE_PATHOLOGIES, PRODUITS_AGRICOLES } from '../public/js/cafcoop_data';

export default function Home() {
  // --- ETATS ---
  const [role, setRole] = useState('agriculteur'); // 'agriculteur' ou 'personnel'
  const [currentTab, setCurrentTab] = useState('home');
  const [panier, setPanier] = useState([]);
  const [diagnosticsList, setDiagnosticsList] = useState([]);
  const [commandesList, setCommandesList] = useState([]);

  // États Diagnostic Formulaire
  const [diagCulture, setDiagCulture] = useState('');
  const [selectedSymptomes, setSelectedSymptomes] = useState([]); // Format: "Maladie:Symptome"
  const [gpsLocation, setGpsLocation] = useState(null); // Bonus : Géolocalisation

  // États Modals & UX
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [notification, setNotification] = useState(null); // {msg, type}

  // --- INIT ---
  useEffect(() => {
    // Chargement panier local
    const savedCart = localStorage.getItem('cafcoop_panier');
    if (savedCart) setPanier(JSON.parse(savedCart));
    
    // Chargement données serveur
    chargerDonneesSupabase();
  }, [role]); // Recharger si on change de rôle

  const chargerDonneesSupabase = async () => {
    const supabase = await getSupabase();
    
    // Récupérer les diagnostics (tous pour le staff, filtré plus tard si besoin)
    const { data: diagData } = await supabase
        .from('diagnostics')
        .select('*')
        .order('date_creation', { ascending: false });
    if(diagData) setDiagnosticsList(diagData);

    // Récupérer les commandes
    const { data: cmdData } = await supabase
        .from('commandes')
        .select('*')
        .order('date_commande', { ascending: false });
    if(cmdData) setCommandesList(cmdData);
  };

  // --- FONCTIONS UTILITAIRES ---
  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- LOGIQUE CLIENT (Agriculteur) ---
  const handleAddToCart = () => {
    const exists = panier.find(p => p.id === selectedProduct.id);
    let newCart;
    if (exists) {
      newCart = panier.map(p => p.id === selectedProduct.id ? { ...p, quantite: p.quantite + productQuantity } : p);
    } else {
      newCart = [...panier, { ...selectedProduct, quantite: productQuantity }];
    }
    setPanier(newCart);
    localStorage.setItem('cafcoop_panier', JSON.stringify(newCart));
    setShowProductModal(false);
    showNotif(`${selectedProduct.nom} ajouté !`);
  };

  const submitCommande = async (modePaiement) => {
    const total = panier.reduce((sum, p) => sum + (p.prix * p.quantite), 0);
    const supabase = await getSupabase();
    
    // Construction de la description de la commande
    const details = panier.map(p => `${p.quantite}x ${p.nom}`).join(', ');

    const { error } = await supabase.from('commandes').insert({
        id_agriculteur: 1, // À remplacer par user.id réel
        statut: 'en_attente', // Statut initial
        montant_total: total,
        mode_paiement: modePaiement,
        details_produits: details, // Assurez-vous d'avoir cette colonne ou modifiez selon votre schéma
        date_commande: new Date().toISOString()
    });

    if(!error) {
        setPanier([]);
        localStorage.removeItem('cafcoop_panier');
        showNotif(modePaiement === 'MOMO' ? "Paiement initié..." : "Commande enregistrée !");
        chargerDonneesSupabase();
        setCurrentTab('commandes');
    } else {
        showNotif("Erreur lors de la commande", "error");
    }
  };

  const capturerGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
          showNotif("Position capturée !");
        },
        () => showNotif("Impossible de récupérer la position", "error")
      );
    }
  };

  const submitDiagnostic = async () => {
    if (!diagCulture || selectedSymptomes.length === 0) {
        showNotif("Sélectionnez une culture et des symptômes", "error");
        return;
    }

    const supabase = await getSupabase();
    const { error } = await supabase.from('diagnostics').insert({
      id_agriculteur: 1,
      id_culture: diagCulture, // Stocke le nom de la culture (ex: Cacao)
      statut: 'en_attente',
      commentaire_agriculteur: `Symptômes: ${selectedSymptomes.map(s => s.split(':')[1]).join(', ')}`,
      localisation_gps: gpsLocation, // Assurez-vous d'avoir cette colonne ou concaténez dans commentaire
      date_creation: new Date().toISOString()
    });

    if (!error) {
      showNotif("Diagnostic envoyé à l'expert !");
      setCurrentTab('home');
      setDiagCulture('');
      setSelectedSymptomes([]);
      setGpsLocation(null);
      chargerDonneesSupabase();
    }
  };

  // --- LOGIQUE STAFF ---
  const updateCommandeStatut = async (id, newStatut) => {
      const supabase = await getSupabase();
      const { error } = await supabase.from('commandes').update({ statut: newStatut }).eq('id_commande', id);
      if(!error) {
          showNotif(`Commande marquée : ${newStatut}`);
          chargerDonneesSupabase(); // Rafraîchir la liste
      }
  };

  const assignerExpert = async (idDiag, nomExpert) => {
      const supabase = await getSupabase();
      const { error } = await supabase.from('diagnostics').update({ 
          expert_assigne: nomExpert,
          statut: 'expertise_en_cours'
      }).eq('id', idDiag);
      
      if(!error) {
          showNotif(`Dossier assigné à ${nomExpert}`);
          chargerDonneesSupabase();
      }
  };

  // --- RENDERERS (Vues) ---

  const renderPanier = () => {
      const total = panier.reduce((sum, p) => sum + (p.prix * p.quantite), 0);
      return (
        <div className="fade-in" style={{paddingBottom: 100}}>
            <h2>🛒 Mon Panier</h2>
            {panier.length === 0 ? <p className="text-center">Votre panier est vide.</p> : (
                <>
                    <div className="card">
                        {panier.map(item => (
                            <div key={item.id} style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee', padding:'10px 0'}}>
                                <span>{item.quantite}x {item.nom}</span>
                                <span>{(item.prix * item.quantite).toLocaleString()} FCFA</span>
                            </div>
                        ))}
                        <div style={{marginTop:15, textAlign:'right', fontWeight:'bold', fontSize:18}}>
                            Total: {total.toLocaleString()} FCFA
                        </div>
                    </div>

                    <h3 style={{marginTop:20}}>Choisir le paiement :</h3>
                    <div style={{display:'flex', gap:10, flexDirection:'column'}}>
                        <button className="action-btn primary" onClick={() => submitCommande('MOMO')}>
                            📱 Mobile Money (Immédiat)
                        </button>
                        <button className="action-btn" onClick={() => submitCommande('LIVRAISON')}>
                            🚚 Payer à la livraison
                        </button>
                    </div>
                </>
            )}
        </div>
      );
  };

  const renderAgriHome = () => (
    <div className="fade-in">
      <h2 style={{textAlign:'center', marginBottom:20, color:'var(--primary-dark)'}}>🍃 CAFCOOP APP</h2>
      <div className="action-grid">
        <div className="action-btn primary" onClick={() => setCurrentTab('boutique')}>
          <span style={{fontSize:40}}>🛒</span><span>Boutique</span>
        </div>
        <div className="action-btn primary" onClick={() => setCurrentTab('diagnostic')}>
          <span style={{fontSize:40}}>🩺</span><span>Diagnostic</span>
        </div>
        <div className="action-btn" onClick={() => setCurrentTab('commandes')}>
          <span style={{fontSize:40}}>📦</span><span>Mes Commandes</span>
        </div>
        <div className="action-btn" onClick={() => setCurrentTab('profil')}>
          <span style={{fontSize:40}}>👤</span><span>Mon Profil</span>
        </div>
      </div>
      
      {/* Raccourci Panier si non vide */}
      {panier.length > 0 && (
          <div className="card" style={{background:'#FFF3E0', marginTop:20}} onClick={() => setCurrentTab('panier')}>
              <strong>🛒 Vous avez {panier.length} article(s) en attente.</strong>
              <div style={{color:'var(--primary)', textDecoration:'underline'}}>Finaliser ma commande →</div>
          </div>
      )}
    </div>
  );

  const renderDiagnosticForm = () => (
    <div className="fade-in" style={{paddingBottom:100}}>
      <h2>🩺 Nouveau Diagnostic</h2>
      <div className="card">
        <label>1. Culture concernée</label>
        <select 
            style={{width:'100%', padding:12, marginTop:5, marginBottom:15}}
            value={diagCulture}
            onChange={(e) => { setDiagCulture(e.target.value); setSelectedSymptomes([]); }}
        >
            <option value="">Choisir...</option>
            {Object.keys(BASE_PATHOLOGIES).map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {diagCulture && (
            <div>
                <label>2. Symptômes (Cochez tout ce qui s'applique)</label>
                {/* Correction Bug Checkbox : Utilisation d'ID uniques */}
                {BASE_PATHOLOGIES[diagCulture].map((maladie, idx) => (
                    <div key={idx} style={{margin:'10px 0', padding:10, background:'#f9f9f9', borderRadius:8}}>
                        <strong>{maladie.nom}</strong>
                        {maladie.symptomes.map((symptome, sIdx) => {
                            const uniqueKey = `${maladie.nom}:${symptome}`; // Clé unique
                            const uniqueId = `chk-${idx}-${sIdx}`; // ID HTML unique
                            return (
                                <div key={uniqueKey} style={{display:'flex', gap:10, marginTop:8, alignItems:'center'}}>
                                    <input 
                                        type="checkbox" 
                                        id={uniqueId}
                                        checked={selectedSymptomes.includes(uniqueKey)} 
                                        onChange={(e) => {
                                            if(e.target.checked) setSelectedSymptomes([...selectedSymptomes, uniqueKey]);
                                            else setSelectedSymptomes(selectedSymptomes.filter(x => x !== uniqueKey));
                                        }}
                                        style={{width:20, height:20}}
                                    />
                                    <label htmlFor={uniqueId}>{symptome}</label>
                                </div>
                            );
                        })}
                    </div>
                ))}

                <label style={{marginTop:15, display:'block'}}>3. Localisation (Bonus)</label>
                <button type="button" onClick={capturerGPS} className="action-btn" style={{fontSize:14, padding:8}}>
                    📍 {gpsLocation ? "Position enregistrée ✓" : "Ajouter ma position GPS"}
                </button>

                <button className="action-btn primary" style={{width:'100%', marginTop:25}} onClick={submitDiagnostic}>
                    Envoyer au technicien
                </button>
            </div>
        )}
      </div>
    </div>
  );

  const renderStaffInterface = () => (
      <div className="fade-in" style={{paddingBottom:100}}>
          {currentTab === 'staff_home' && (
             <>
                <h2 style={{color:'var(--primary-dark)'}}>📊 Espace Personnel</h2>
                <div className="action-grid">
                    <div className="action-btn primary" onClick={() => setCurrentTab('staff_orders')}>
                        <span style={{fontSize:30}}>📦</span> Commandes
                    </div>
                    <div className="action-btn primary" onClick={() => setCurrentTab('staff_diags')}>
                        <span style={{fontSize:30}}>🩺</span> Diagnostics
                    </div>
                </div>
             </>
          )}

          {currentTab === 'staff_orders' && (
              <div>
                  <h3>📦 Gestion des Commandes</h3>
                  {commandesList.map(c => (
                      <div key={c.id_commande} className="card">
                          <div style={{display:'flex', justifyContent:'space-between'}}>
                              <strong>Cmd #{c.id_commande}</strong>
                              <span style={{fontWeight:'bold'}}>{c.montant_total} FCFA</span>
                          </div>
                          <p style={{fontSize:12, color:'#666'}}>{formatDate(c.date_commande)} - {c.mode_paiement}</p>
                          <div style={{marginTop:10}}>
                              <label>Statut : </label>
                              <select 
                                value={c.statut} 
                                onChange={(e) => updateCommandeStatut(c.id_commande, e.target.value)}
                                style={{padding:5, borderRadius:4}}
                              >
                                  <option value="en_attente">⏳ En attente</option>
                                  <option value="empaqueté">📦 Empaqueté</option>
                                  <option value="en_cours_de_livraison">🚚 En livraison</option>
                                  <option value="livré">✅ Livré</option>
                                  <option value="annulé">❌ Annulé</option>
                              </select>
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {currentTab === 'staff_diags' && (
              <div>
                  <h3>🩺 Affectation Experts</h3>
                  {diagnosticsList.map(d => (
                      <div key={d.id} className="card">
                          <div><strong>Diag #{d.id} - {d.id_culture}</strong></div>
                          <p style={{fontSize:13}}>{d.commentaire_agriculteur}</p>
                          {d.localisation_gps && <small>📍 GPS: {d.localisation_gps}</small>}
                          
                          <div style={{marginTop:10, background:'#eee', padding:10, borderRadius:5}}>
                              <label>Assigner à : </label>
                              <select 
                                value={d.expert_assigne || ""} 
                                onChange={(e) => assignerExpert(d.id, e.target.value)}
                                style={{width:'100%', marginTop:5, padding:5}}
                              >
                                  <option value="">-- Choisir un expert --</option>
                                  <option value="Alex">Alex (Agronome)</option>
                                  <option value="Olivier">Olivier (Phytopathologiste)</option>
                                  <option value="Jean">Jean (Tech. Surface)</option>
                              </select>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  return (
    <div className="phone-frame">
      <Head>
        <title>CAFCOOP App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      {/* HEADER */}
      <header className="app-header">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             {/* Bouton Retour Intelligent */}
             {((role === 'agriculteur' && currentTab !== 'home') || (role === 'personnel' && currentTab !== 'staff_home')) && (
                <button 
                  onClick={() => setCurrentTab(role === 'agriculteur' ? 'home' : 'staff_home')}
                  style={{ background: 'none', border: 'none', fontSize: '24px', color: 'white', cursor: 'pointer', padding:0 }}
                >
                  ⬅️
                </button>
              )}
              <div className="app-title">🍃 CAFCOOP</div>
          </div>

          <div 
            className="role-badge" 
            onClick={() => {
                const newRole = role === 'agriculteur' ? 'personnel' : 'agriculteur';
                setRole(newRole);
                setCurrentTab(newRole === 'agriculteur' ? 'home' : 'staff_home');
            }}
            style={{
                background: role === 'personnel' ? '#FFC107' : 'rgba(255,255,255,0.2)', 
                color: role === 'personnel' ? 'black' : 'white',
                cursor: 'pointer'
            }}
          >
            {role === 'agriculteur' ? 'AGRI' : 'STAFF'}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      {/* Padding bottom ajouté ici pour éviter que la nav cache le contenu */}
      <main className="content-area" id="main-content" style={{paddingBottom: '90px'}}>
        
        {/* LOGIQUE D'AFFICHAGE CONDITIONNEL */}
        {role === 'agriculteur' && currentTab === 'home' && renderAgriHome()}
        {role === 'agriculteur' && currentTab === 'boutique' && (
            <div className="fade-in">
              <h2>🛒 Produits</h2>
              {PRODUITS_AGRICOLES.map(p => (
                <div key={p.id} className="card product-card" onClick={() => { setSelectedProduct(p); setProductQuantity(1); setShowProductModal(true); }}>
                  <div className="product-icon">{p.image}</div>
                  <div style={{flex:1}}>
                    <div className="product-name">{p.nom}</div>
                    <div className="product-price">{p.prix.toLocaleString()} FCFA</div>
                  </div>
                  <button className="add-btn">+</button>
                </div>
              ))}
            </div>
        )}
        {role === 'agriculteur' && currentTab === 'panier' && renderPanier()}
        {role === 'agriculteur' && currentTab === 'diagnostic' && renderDiagnosticForm()}
        
        {role === 'agriculteur' && currentTab === 'commandes' && (
            <div className="fade-in" style={{paddingBottom:100}}>
                <h2>📦 Mes Commandes</h2>
                {commandesList.length === 0 && <p>Aucune commande.</p>}
                {commandesList.map(c => (
                    <div key={c.id_commande} className="card">
                        <div><strong>#{c.id_commande}</strong> • {c.montant_total} FCFA</div>
                        <small>{c.statut.toUpperCase()}</small>
                    </div>
                ))}
            </div>
        )}

        {/* INTERFACE PERSONNEL */}
        {role === 'personnel' && renderStaffInterface()}

      </main>

      {/* BOTTOM NAV - Uniquement pour Agriculteur */}
      {role === 'agriculteur' && (
          <nav className="bottom-nav" style={{
              position: 'fixed', 
              bottom: 0, 
              width: '100%', 
              maxWidth: '480px', // pour correspondre au phone-frame si nécessaire
              zIndex: 1000,
              background: 'white',
              borderTop: '1px solid #ddd'
          }}>
            <div className={`nav-item ${currentTab === 'home' ? 'active' : ''}`} onClick={() => setCurrentTab('home')}>
                <span>🏠</span><span>Accueil</span>
            </div>
            <div className={`nav-item ${currentTab === 'boutique' ? 'active' : ''}