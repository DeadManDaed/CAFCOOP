/*import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { getSupabase, formatDate, getCurrentUser } from '../lib/supabase-client';
import { REGIONS_CAMEROUN, BASE_PATHOLOGIES, PRODUITS_AGRICOLES } from '../public/js/cafcoop_data';

export default function Home() {
  // --- ETATS ---
  const [role, setRole] = useState('agriculteur');
  const [currentTab, setCurrentTab] = useState('home');
  const [panier, setPanier] = useState([]);
  const [diagnosticsList, setDiagnosticsList] = useState([]);
  const [commandesList, setCommandesList] = useState([]);
  
  // États Diagnostic Formulaire
  const [diagCulture, setDiagCulture] = useState('');
  const [diagSymptomes, setDiagSymptomes] = useState([]);
  const [selectedSymptomes, setSelectedSymptomes] = useState([]);
  const [diagPhoto, setDiagPhoto] = useState(null);
  
  // États Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [productQuantity, setProductQuantity] = useState(1);
  const [notification, setNotification] = useState(null); // {msg, type}

  // --- INIT ---
  useEffect(() => {
    const savedCart = localStorage.getItem('cafcoop_panier');
    if (savedCart) setPanier(JSON.parse(savedCart));
    chargerDonneesSupabase();
  }, []);

  const chargerDonneesSupabase = async () => {
    const supabase = await getSupabase();
    // Charger Diagnostics
    const { data: diagData } = await supabase.from('diagnostics').select('*').order('date_creation', { ascending: false });
    if(diagData) setDiagnosticsList(diagData);

    // Charger Commandes
    const { data: cmdData } = await supabase.from('commandes').select('*').order('date_commande', { ascending: false });
    if(cmdData) setCommandesList(cmdData);
  };

  // --- FONCTIONS ---
  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

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
    showNotif(`${selectedProduct.nom} ajouté au panier`);
  };

  const submitDiagnostic = async () => {
    if (!diagCulture || selectedSymptomes.length === 0) return;
    
    // Logique Auto-Réponse (Bonus)
    let autoConseil = "";
    selectedSymptomes.forEach(sympName => {
       const mal = BASE_PATHOLOGIES[diagCulture].find(m => m.nom === sympName); // Simplification, le checkbox value devrait porter l'ID
       if(mal && mal.solutions) {
           const prodNoms = mal.solutions.map(solId => {
               const p = PRODUITS_AGRICOLES.find(prod => prod.id === solId);
               return p ? p.nom : solId;
           }).join(', ');
           autoConseil += `Pour ${mal.nom}, utilisez : ${prodNoms}. `;
       }
    });

    const supabase = await getSupabase();
    const { error } = await supabase.from('diagnostics').insert({
      id_agriculteur: 1, // À remplacer par auth réel
      id_culture: 1, // Idéalement mapper le nom culture vers ID SQL
      statut: 'en_attente',
      commentaire_agriculteur: `${diagCulture} - ${selectedSymptomes.join(', ')}. ${autoConseil}`,
      date_creation: new Date().toISOString()
    });

    if (!error) {
      showNotif("Diagnostic envoyé !");
      setCurrentTab('home');
      setDiagCulture('');
      setSelectedSymptomes([]);
      chargerDonneesSupabase();
    } else {
      showNotif("Erreur d'envoi", 'error');
    }
  };

  const submitCommande = async (mode) => {
    const total = panier.reduce((sum, p) => sum + (p.prix * p.quantite), 0);
    const supabase = await getSupabase();
    const { error } = await supabase.from('commandes').insert({
        id_agriculteur: 1,
        statut: 'en_attente',
        montant_total: total,
        mode_paiement: mode,
        date_commande: new Date().toISOString()
    });

    if(!error) {
        setPanier([]);
        localStorage.removeItem('cafcoop_panier');
        setShowCartModal(false);
        showNotif("Commande validée !");
        chargerDonneesSupabase();
        setCurrentTab('commandes');
    }
  };

  // --- RENDERERS ---
  const renderHome = () => (
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
      
      {/* Offre du jour (Aléatoire) */}
      <div className="card" style={{background:'#E8F5E9'}}>
        <h3>💡 Astuce du jour</h3>
        <p>Utilisez <strong>Bioforge</strong> après une période de sécheresse pour relancer vos cacaoyers.</p>
      </div>
    </div>
  );

  const renderBoutique = () => (
    <div className="fade-in" style={{paddingBottom: 80}}>
      <h2>🛒 Produits & Intrants</h2>
      {PRODUITS_AGRICOLES.map(p => (
        <div key={p.id} className="card product-card" onClick={() => { setSelectedProduct(p); setProductQuantity(1); setShowProductModal(true); }}>
          <div className="product-icon">{p.image}</div>
          <div style={{flex:1}}>
            <div className="product-name">{p.nom}</div>
            <div style={{fontSize:12, color:'#666'}}>{p.categorie}</div>
            <div className="product-price">{p.prix.toLocaleString()} FCFA</div>
          </div>
          <button style={{background:'var(--primary)', color:'white', border:'none', borderRadius:'50%', width:30, height:30}}>+</button>
        </div>
      ))}
    </div>
  );

  const renderDiagnostic = () => (
    <div className="fade-in">
      <h2>🩺 Nouveau Diagnostic</h2>
      <div className="card">
        <label>Culture concernée</label>
        <select 
            style={{width:'100%', padding:12, marginTop:8, marginBottom:16, borderRadius:8, border:'1px solid #ddd'}}
            value={diagCulture}
            onChange={(e) => {
                setDiagCulture(e.target.value);
                setDiagSymptomes(BASE_PATHOLOGIES[e.target.value] || []);
                setSelectedSymptomes([]);
            }}
        >
            <option value="">Choisir une culture...</option>
            {Object.keys(BASE_PATHOLOGIES).map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {diagCulture && (
            <div>
                <label>Symptômes observés</label>
                {diagSymptomes.map((maladie, idx) => (
                    <div key={idx} style={{margin:'10px 0', padding:10, background:'#f9f9f9', borderRadius:8}}>
                        <strong>{maladie.nom}</strong>
                        {maladie.symptomes.map(s => (
                            <div key={s} style={{display:'flex', gap:10, marginTop:5}}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedSymptomes.includes(maladie.nom)} 
                                    onChange={(e) => {
                                        if(e.target.checked) setSelectedSymptomes([...selectedSymptomes, maladie.nom]);
                                        else setSelectedSymptomes(selectedSymptomes.filter(x => x !== maladie.nom));
                                    }}
                                />
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>
                ))}

                <label style={{marginTop:15, display:'block'}}>Photo du problème (Optionnel)</label>
                <input type="file" accept="image/*" style={{marginTop:5}} />
                
                <button className="action-btn primary" style={{width:'100%', marginTop:20}} onClick={submitDiagnostic}>
                    Envoyer au technicien
                </button>
            </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="phone-frame">
      <Head>
        <title>CAFCOOP Mobile</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      {/* HEADER */}
      {/* HEADER MODIFIÉ */}
<header className="app-header">
  <div className="header-content">
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Bouton Retour : visible si on n'est pas sur l'accueil (home ou staff_home) */}
      {currentTab !== 'home' && currentTab !== 'staff_home' && (
        <button 
          onClick={() => setCurrentTab(role === 'agriculteur' ? 'home' : 'staff_home')}
          style={{ background: 'none', border: 'none', fontSize: '20px', color: 'white', cursor: 'pointer' }}
        >
          ⬅️
        </button>
      )}
      <div className="app-title">
        <span>🍃</span> CAFCOOP
      </div>
    </div>
    
    <div 
      className="role-badge" 
      onClick={() => {
        const newRole = role === 'agriculteur' ? 'personnel' : 'agriculteur';
        setRole(newRole);
        setCurrentTab(newRole === 'agriculteur' ? 'home' : 'staff_home');
      }}
      style={{
        background: role === 'personnel' ? '#FFC107' : 'rgba(255,255,255,0.25)', 
        color: role === 'personnel' ? 'black' : 'white',
        fontWeight: 'bold'
      }}
    >
      {role === 'agriculteur' ? 'MODE AGRICULTEUR' : 'MODE STAFF'}
    </div>
  </div>
</header>


      {/* MAIN CONTENT */}
      <main className="content-area" id="main-content">
  {/* VUES AGRICULTEUR */}
  {role === 'agriculteur' && (
    <>
      {currentTab === 'home' && renderHome()}
      {currentTab === 'boutique' && renderBoutique()}
      {currentTab === 'diagnostic' && renderDiagnostic()}
      {currentTab === 'commandes' && renderHistoriqueCommandes()} 
    </>
  )}

  {/* VUES STAFF */}
  {role === 'personnel' && (
    <>
      {currentTab === 'staff_home' && renderStaffHome()}
      {currentTab === 'staff_diagnostics' && renderStaffDiagnostics()}
      {currentTab === 'staff_livraisons' && (
        <div className="fade-in">
          <h2>🚚 Commandes à livrer</h2>
          {commandesList.filter(c => c.statut === 'en_attente').map(c => (
             <div key={c.id_commande} className="card">
                <strong>Commande #{c.id_commande}</strong>
                <p>Montant: {c.montant_total} FCFA</p>
                <button className="action-btn primary" style={{width:'100%'}}>Valider la livraison</button>
             </div>
          ))}
        </div>
      )}
    </>
  )}
</main>


      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        <div className={`nav-item ${currentTab === 'home' ? 'active' : ''}`} onClick={() => setCurrentTab('home')}>
            <span>🏠</span><span>Accueil</span>
        </div>
        <div className={`nav-item ${currentTab === 'boutique' ? 'active' : ''}`} onClick={() => setCurrentTab('boutique')}>
            <span>🛒</span>
            <span>Boutique</span>
            {panier.length > 0 && <span style={{position:'absolute', top:5, right: '25%', background:'red', color:'white', borderRadius:'50%', width:16, height:16, fontSize:10, display:'flex', alignItems:'center', justifyContent:'center'}}>{panier.length}</span>}
        </div>
        <div className={`nav-item ${currentTab === 'diagnostic' ? 'active' : ''}`} onClick={() => setCurrentTab('diagnostic')}>
            <span>🩺</span><span>Diag</span>
        </div>
      </nav>

      {/* MODAL PRODUIT */}
      {showProductModal && selectedProduct && (
        <div className="modal active">
            <div className="card" style={{width:'90%', maxWidth:400, position:'relative'}}>
                <button onClick={() => setShowProductModal(false)} style={{position:'absolute', right:10, top:10, background:'none', border:'none', fontSize:20}}>✕</button>
                <div style={{fontSize:50, textAlign:'center'}}>{selectedProduct.image}</div>
                <h2 style={{textAlign:'center', color:'var(--primary)'}}>{selectedProduct.nom}</h2>
                <p style={{textAlign:'center', fontWeight:'bold', fontSize:20}}>{selectedProduct.prix.toLocaleString()} FCFA / {selectedProduct.unite}</p>
                <p>{selectedProduct.description}</p>
                
                <div style={{background:'#f5f5f5', padding:10, borderRadius:8, fontSize:12, marginBottom:15}}>
                    <strong>Technique :</strong> {selectedProduct.fiche.composition}<br/>
                    <strong>Dose :</strong> {selectedProduct.fiche.dose}
                </div>

                <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:15, marginBottom:20}}>
                    <button className="action-btn" onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}>-</button>
                    <span style={{fontSize:20, fontWeight:'bold'}}>{productQuantity}</span>
                    <button className="action-btn" onClick={() => setProductQuantity(productQuantity + 1)}>+</button>
                </div>
                
                <button className="action-btn primary" style={{width:'100%'}} onClick={handleAddToCart}>Ajouter au panier</button>
            </div>
        </div>
      )}

        {/* NOTIFICATION */}
        {notification && (
            <div className={`notification show`} style={{background: notification.type === 'error' ? 'var(--danger)' : 'var(--success)'}}>
                {notification.msg}
            </div>
        )}
    </div>
  );
}

// --- RENDERERS STAFF ---

const renderStaffHome = () => (
  <div className="fade-in">
    <h2 style={{color:'var(--primary-dark)'}}>📊 Tableau de Bord Staff</h2>
    <div className="action-grid">
      <div className="action-btn primary" onClick={() => setCurrentTab('staff_diagnostics')}>
        <span style={{fontSize:40}}>📑</span>
        <span>Demandes Diag.</span>
        {diagnosticsList.filter(d => d.statut === 'en_attente').length > 0 && 
          <span className="badge-count">{diagnosticsList.filter(d => d.statut === 'en_attente').length}</span>}
      </div>
      <div className="action-btn primary" onClick={() => setCurrentTab('staff_livraisons')}>
        <span style={{fontSize:40}}>🚚</span><span>Livraisons</span>
      </div>
      <div className="action-btn" onClick={() => setCurrentTab('staff_ventes')}>
        <span style={{fontSize:40}}>📈</span><span>Historique Ventes</span>
      </div>
    </div>
  </div>
);

const renderStaffDiagnostics = () => (
  <div className="fade-in">
    <h2>📑 Gestion des Diagnostics</h2>
    {diagnosticsList.map(diag => (
      <div key={diag.id} className="card" style={{borderLeft: diag.statut === 'en_attente' ? '5px solid orange' : '5px solid green'}}>
        <div style={{display:'flex', justifyContent:'space-between'}}>
          <strong>Culture: {diag.id_culture}</strong>
          <small>{formatDate(diag.date_creation)}</small>
        </div>
        <p style={{fontSize:13, margin:'10px 0'}}>{diag.commentaire_agriculteur}</p>
        
        {diag.statut === 'en_attente' && (
          <div style={{display:'flex', gap:10, marginTop:10}}>
            <button className="action-btn primary" style={{flex:1, fontSize:12}} onClick={() => alert("Transfert à l'expert...")}>
              👨‍🔬 Transférer Expert
            </button>
            <button className="action-btn" style={{flex:1, fontSize:12}} onClick={() => alert("Répondre directement")}>
              ✍️ Répondre
            </button>
          </div>
        )}
      </div>
    ))}
  </div>
);
*/

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { getSupabase, formatDate } from '../lib/supabase-client';
import { BASE_PATHOLOGIES, PRODUITS_AGRICOLES } from '../public/js/cafcoop_data';

export default function Home() {
  // --- ÉTATS ---
  const [role, setRole] = useState('agriculteur');
  const [currentTab, setCurrentTab] = useState('home');
  const [panier, setPanier] = useState([]);
  const [diagnosticsList, setDiagnosticsList] = useState([]);
  const [commandesList, setCommandesList] = useState([]);

  // États Formulaires & Modals
  const [diagCulture, setDiagCulture] = useState('');
  const [selectedSymptomes, setSelectedSymptomes] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [productQuantity, setProductQuantity] = useState(1);
  const [notification, setNotification] = useState(null);

  // --- INIT ---
  useEffect(() => {
    const savedCart = localStorage.getItem('cafcoop_panier');
    if (savedCart) setPanier(JSON.parse(savedCart));
    chargerDonneesSupabase();
  }, [role]); // Recharge si le rôle change pour rafraîchir les listes staff

  const chargerDonneesSupabase = async () => {
    const supabase = await getSupabase();
    const { data: diagData } = await supabase.from('diagnostics').select('*').order('date_creation', { ascending: false });
    if(diagData) setDiagnosticsList(diagData);

    const { data: cmdData } = await supabase.from('commandes').select('*').order('date_commande', { ascending: false });
    if(cmdData) setCommandesList(cmdData);
  };

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- LOGIQUE PANIER ---
  const ajouterAuPanier = () => {
    const nouveauPanier = [...panier];
    const index = nouveauPanier.findIndex(p => p.id === selectedProduct.id);
    if (index >= 0) {
      nouveauPanier[index].quantite += productQuantity;
    } else {
      nouveauPanier.push({ ...selectedProduct, quantite: productQuantity });
    }
    setPanier(nouveauPanier);
    localStorage.setItem('cafcoop_panier', JSON.stringify(nouveauPanier));
    setShowProductModal(false);
    showNotif("Ajouté au panier !");
  };

  const viderPanier = () => {
    setPanier([]);
    localStorage.removeItem('cafcoop_panier');
    setShowCartModal(false);
  };

  // --- ACTIONS STAFF ---
  const modifierStatutCommande = async (id, nouveauStatut) => {
    const supabase = await getSupabase();
    const { error } = await supabase.from('commandes').update({ statut: nouveauStatut }).eq('id_commande', id);
    if (!error) {
        showNotif(`Commande ${nouveauStatut}`);
        chargerDonneesSupabase();
    }
  };

  const transfererAExpert = async (idDiag, expert) => {
    const supabase = await getSupabase();
    const { error } = await supabase.from('diagnostics').update({ 
        statut: 'expertise_en_cours',
        expert_assigne: expert 
    }).eq('id', idDiag);
    if (!error) showNotif(`Transféré à ${expert}`);
    chargerDonneesSupabase();
  };

  // --- RENDERERS ---

  const renderPanier = () => {
    const total = panier.reduce((sum, p) => sum + (p.prix * p.quantite), 0);
    return (
      <div className="fade-in">
        <h2>🛒 Mon Panier</h2>
        {panier.length === 0 ? <p>Votre panier est vide.</p> : (
          <div className="card">
            {panier.map(item => (
              <div key={item.id} style={{display:'flex', justifyContent:'space-between', marginBottom:10, borderBottom:'1px solid #eee', pb:5}}>
                <span>{item.quantite}x {item.nom}</span>
                <span>{(item.prix * item.quantite).toLocaleString()} FCFA</span>
              </div>
            ))}
            <div style={{fontWeight:'bold', fontSize:18, textAlign:'right', marginTop:15}}>TOTAL : {total.toLocaleString()} FCFA</div>
            
            <div style={{marginTop:20, display:'flex', flexDirection:'column', gap:10}}>
                <button className="action-btn primary" onClick={() => alert("Lien vers API Mobile Money...")}>💳 Payer maintenant</button>
                <button className="action-btn" onClick={() => alert("Commande enregistrée pour paiement à livraison")}>🏠 Payer à la livraison</button>
                <button style={{color:'red', background:'none', border:'none', marginTop:10}} onClick={viderPanier}>Vider le panier</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDiagnostic = () => (
    <div className="fade-in">
      <h2>🩺 Diagnostic</h2>
      <div className="card">
        <label>Culture</label>
        <select value={diagCulture} onChange={(e) => { setDiagCulture(e.target.value); setSelectedSymptomes([]); }} style={{width:'100%', padding:12, marginBottom:15}}>
            <option value="">Choisir...</option>
            {Object.keys(BASE_PATHOLOGIES).map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {diagCulture && BASE_PATHOLOGIES[diagCulture].map((maladie) => (
            <div key={maladie.nom} className="card" style={{background:'#f9f9f9'}}>
                <strong>{maladie.nom}</strong>
                {maladie.symptomes.map(s => (
                    <div key={s} style={{display:'flex', gap:10, marginTop:5}}>
                        <input 
                            type="checkbox" 
                            id={`${maladie.nom}-${s}`} // ID UNIQUE pour corriger le bug des checkboxes
                            checked={selectedSymptomes.includes(`${maladie.nom}:${s}`)} 
                            onChange={(e) => {
                                const val = `${maladie.nom}:${s}`;
                                if(e.target.checked) setSelectedSymptomes([...selectedSymptomes, val]);
                                else setSelectedSymptomes(selectedSymptomes.filter(x => x !== val));
                            }}
                        />
                        <label htmlFor={`${maladie.nom}-${s}`}>{s}</label>
                    </div>
                ))}
            </div>
        ))}
        <button className="action-btn primary" style={{width:'100%'}} onClick={() => showNotif("Diagnostic envoyé")}>Envoyer</button>
      </div>
    </div>
  );

  return (
    <div className="phone-frame">
      <Head>
        <title>CAFCOOP App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      <header className="app-header">
        <div className="header-content">
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            {currentTab !== 'home' && <button onClick={() => setCurrentTab('home')} style={{background:'none', border:'none', color:'white', fontSize:20}}>⬅️</button>}
            <div className="app-title">CAFCOOP</div>
          </div>
          <div className="role-badge" onClick={() => { setRole(role === 'agriculteur' ? 'staff' : 'agriculteur'); setCurrentTab('home'); }}>
            {role.toUpperCase()}
          </div>
        </div>
      </header>

      <main className="content-area" style={{paddingBottom:'80px'}}>
        {role === 'agriculteur' ? (
            <>
                {currentTab === 'home' && (
                    <div className="action-grid">
                        <div className="action-btn primary" onClick={() => setCurrentTab('boutique')}>🛒 Boutique</div>
                        <div className="action-btn primary" onClick={() => setCurrentTab('diagnostic')}>🩺 Diagnostic</div>
                    </div>
                )}
                {currentTab === 'boutique' && (
                    <div>
                        {PRODUITS_AGRICOLES.map(p => (
                            <div key={p.id} className="card" onClick={() => { setSelectedProduct(p); setShowProductModal(true); }}>
                                {p.nom} - {p.prix} FCFA
                            </div>
                        ))}
                    </div>
                )}
                {currentTab === 'panier' && renderPanier()}
                {currentTab === 'diagnostic' && renderDiagnostic()}
            </>
        ) : (
            <div className="fade-in">
                <h2>🛠️ Espace Personnel</h2>
                <h3>Commandes à traiter</h3>
                {commandesList.map(c => (
                    <div key={c.id_commande} className="card">
                        <div>Commande #{c.id_commande} ({c.statut})</div>
                        <select onChange={(e) => modifierStatutCommande(c.id_commande, e.target.value)} style={{marginTop:10}}>
                            <option value="">Changer statut...</option>
                            <option value="empaqueté">📦 Empaqueté</option>
                            <option value="en_cours_de_livraison">🚚 En cours</option>
                            <option value="livré">✅ Livré</option>
                        </select>
                    </div>
                ))}
                <h3>Diagnostics en attente</h3>
                {diagnosticsList.map(d => (
                    <div key={d.id} className="card">
                        <div>Diag #{d.id} - {d.statut}</div>
                        <select onChange={(e) => transfererAExpert(d.id, e.target.value)} style={{marginTop:10}}>
                            <option value="">Transférer à l'expert...</option>
                            <option value="Alex">Alex</option>
                            <option value="Olivier">Olivier</option>
                        </select>
                    </div>
                ))}
            </div>
        )}
      </main>

      {/* NAVIGATION BASSE CORRIGÉE */}
      <nav className="bottom-nav">
        <div className={`nav-item ${currentTab === 'home' ? 'active' : ''}`} onClick={() => setCurrentTab('home')}>🏠<span>Accueil</span></div>
        {role === 'agriculteur' && (
            <div className={`nav-item ${currentTab === 'panier' ? 'active' : ''}`} onClick={() => setCurrentTab('panier')}>
                🛒<span>Panier</span>
                {panier.length > 0 && <span className="badge-count">{panier.length}</span>}
            </div>
        )}
        <div className="nav-item">👤<span>Profil</span></div>
      </nav>

      {/* MODAL PRODUIT */}
      {showProductModal && selectedProduct && (
        <div className="modal active">
            <div className="card" style={{width:'90%'}}>
                <h3>{selectedProduct.nom}</h3>
                <input type="number" value={productQuantity} onChange={(e) => setProductQuantity(parseInt(e.target.value))} style={{width:'100%', padding:10, margin:'10px 0'}} />
                <button className="action-btn primary" onClick={ajouterAuPanier}>Ajouter</button>
                <button onClick={() => setShowProductModal(false)}>Annuler</button>
            </div>
        </div>
      )}

      {notification && <div className="notification show">{notification.msg}</div>}
    </div>
  );
}
