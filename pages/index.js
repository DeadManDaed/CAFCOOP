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
