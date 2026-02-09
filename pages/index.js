//pages/index.js

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
  const [notifsStaff, setNotifsStaff] = useState({ commandes: 0, diags: 0 });

  // États Formulaires
  const [diagCulture, setDiagCulture] = useState('');
  const [selectedSymptomes, setSelectedSymptomes] = useState([]); 
  const [gpsLocation, setGpsLocation] = useState(null);
  const [diagPhoto, setDiagPhoto] = useState(null); // Fichier
  const [photoPreview, setPhotoPreview] = useState(null); // URL miniature

  // État Paiement Mobile
  const [showMomoInput, setShowMomoInput] = useState(false);
  const [momoNumber, setMomoNumber] = useState('');

  // États UI
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [notification, setNotification] = useState(null);

  // --- INIT ---
  useEffect(() => {
    const savedCart = localStorage.getItem('cafcoop_panier');
    if (savedCart) setPanier(JSON.parse(savedCart));
    chargerDonneesSupabase();
  }, [role]);

  const chargerDonneesSupabase = async () => {
    const supabase = await getSupabase();
    const { data: diagData } = await supabase.from('diagnostics').select('*').order('date_creation', { ascending: false });
    if(diagData) setDiagnosticsList(diagData);
    const { data: cmdData } = await supabase.from('commandes').select('*').order('date_commande', { ascending: false });
    if(cmdData) setCommandesList(cmdData);
  };

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- LOGIQUE VALIDATION TÉLÉPHONE (Cameroun) ---
  const validerNumeroMomo = (num) => {
    // Vérifie 9 chiffres exactement
    if (!/^\d{9}$/.test(num)) return { valid: false, msg: "Le numéro doit avoir 9 chiffres." };
    
    // Plages Orange: 640, 655-659, 660, 685-699
    // Plages MTN: 650-654, 670-684
    const orangeRegex = /^(640|655|656|657|658|659|660|685|686|687|688|689|690|691|692|693|694|695|696|697|698|699)/;
    const mtnRegex = /^(650|651|652|653|654|670|671|672|673|674|675|676|677|678|679|680|681|682|683|684)/;

    if (orangeRegex.test(num)) return { valid: true, operator: "Orange" };
    if (mtnRegex.test(num)) return { valid: true, operator: "MTN" };
    
    return { valid: false, msg: "Ce numéro n'appartient ni à Orange ni à MTN." };
  };

  // --- LOGIQUE PHOTO ---
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDiagPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // --- ACTIONS ---
  const handleAddToCart = () => {
    const exists = panier.find(p => p.id === selectedProduct.id);
    let newCart = exists 
      ? panier.map(p => p.id === selectedProduct.id ? { ...p, quantite: p.quantite + productQuantity } : p)
      : [...panier, { ...selectedProduct, quantite: productQuantity }];
    setPanier(newCart);
    localStorage.setItem('cafcoop_panier', JSON.stringify(newCart));
    setShowProductModal(false);
    showNotif("Produit ajouté !");
  };

  const submitCommande = async (mode) => {
    if (mode === 'MOMO' && !showMomoInput) {
        setShowMomoInput(true);
        return;
    }
    if (mode === 'MOMO') {
        const check = validerNumeroMomo(momoNumber);
        if (!check.valid) { showNotif(check.msg, "error"); return; }
        showNotif(`Paiement ${check.operator} initié...`);
    }

    const total = panier.reduce((sum, p) => sum + (p.prix * p.quantite), 0);
    const supabase = await getSupabase();
    const { error } = await supabase.from('commandes').insert({
        id_agriculteur: 1,
        statut: 'en_attente',
        montant_total: total,
        mode_paiement: mode,
        details_produits: panier.map(p => `${p.quantite}x ${p.nom}`).join(', '),
        date_commande: new Date().toISOString()
    });

    if(!error) {
        setPanier([]);
        localStorage.removeItem('cafcoop_panier');
        setMomoNumber('');
        setShowMomoInput(false);
        setNotifsStaff(prev => ({ ...prev, commandes: prev.commandes + 1 }));
        showNotif("Commande validée. Vous serez notifié sur les modalités de livraison.");
        chargerDonneesSupabase();
        setCurrentTab('home');
    }
  };

  const submitDiagnostic = async () => {
    if (!diagCulture || selectedSymptomes.length === 0) return;
    const supabase = await getSupabase();
    const { error } = await supabase.from('diagnostics').insert({
      id_agriculteur: 1,
      id_culture: diagCulture,
      statut: 'en_attente',
      commentaire_agriculteur: `Symptômes: ${selectedSymptomes.map(s => s.split(':')[1]).join(', ')}`,
      localisation_gps: gpsLocation,
      date_creation: new Date().toISOString()
    });

    if (!error) {
      showNotif("Diagnostic envoyé au technicien !");
      // Reset Formulaire
      setDiagCulture('');
      setSelectedSymptomes([]);
      setDiagPhoto(null);
      setPhotoPreview(null);
      setGpsLocation(null);
      setNotifsStaff(prev => ({ ...prev, diags: prev.diags + 1 }));
      chargerDonneesSupabase();
      setCurrentTab('home');
    }
  };

  // --- RENDERERS ---
  const renderPanier = () => {
    const total = panier.reduce((sum, p) => sum + (p.prix * p.quantite), 0);
    return (
      <div className="fade-in" style={{paddingBottom: 120}}>
          <h2>🛒 Validation Panier</h2>
          {panier.length === 0 ? <p>Votre panier est vide.</p> : (
              <div className="card">
                  {panier.map(item => (
                      <div key={item.id} style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee', padding:'10px 0'}}>
                          <span>{item.quantite}x {item.nom}</span>
                          <span>{(item.prix * item.quantite).toLocaleString()} FCFA</span>
                      </div>
                  ))}
                  <div style={{marginTop:15, textAlign:'right', fontWeight:'bold', fontSize:18}}>TOTAL: {total.toLocaleString()} FCFA</div>
                  
                  {showMomoInput && (
                      <div style={{marginTop:20, padding:15, background:'#f0f7ff', borderRadius:10, border:'1px solid #007bff'}}>
                          <label>Numéro Mobile Money (9 chiffres)</label>
                          <input 
                            type="text" 
                            maxLength="9" 
                            value={momoNumber} 
                            onChange={(e) => setMomoNumber(e.target.value)}
                            placeholder="Ex: 699001122"
                            style={{width:'100%', padding:12, marginTop:8, fontSize:18, textAlign:'center', borderRadius:8, border:'1px solid #ccc'}}
                          />
                      </div>
                  )}

                  <div style={{marginTop:20, display:'flex', gap:10, flexDirection:'column'}}>
                      <button className="action-btn primary" onClick={() => submitCommande('MOMO')}>
                          {showMomoInput ? "Confirmer le paiement" : "📱 Mobile Money"}
                      </button>
                      <button className="action-btn" onClick={() => submitCommande('LIVRAISON')}>🏠 Payer à la livraison</button>
                  </div>
              </div>
          )}
      </div>
    );
  };

  const renderDiagForm = () => (
    <div className="fade-in" style={{paddingBottom:120}}>
        <h2>🩺 Nouveau Diagnostic</h2>
        <div className="card">
            <label>Culture :</label>
            <select style={{width:'100%', padding:12, marginBottom:15}} value={diagCulture} onChange={(e) => { setDiagCulture(e.target.value); setSelectedSymptomes([]); }}>
                <option value="">Choisir...</option>
                {Object.keys(BASE_PATHOLOGIES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {diagCulture && (
                <div>
                    <label>Symptômes observés :</label>
                    {BASE_PATHOLOGIES[diagCulture].map((maladie, idx) => (
                        <div key={idx} style={{margin:'10px 0', padding:10, background:'#f9f9f9', borderRadius:8}}>
                            <strong>{maladie.nom}</strong>
                            {maladie.symptomes.map((s, sIdx) => (
                                <div key={sIdx} style={{display:'flex', gap:10, marginTop:8}}>
                                    <input type="checkbox" id={`chk-${idx}-${sIdx}`} checked={selectedSymptomes.includes(`${maladie.nom}:${s}`)} 
                                           onChange={(e) => {
                                               const val = `${maladie.nom}:${s}`;
                                               if(e.target.checked) setSelectedSymptomes([...selectedSymptomes, val]);
                                               else setSelectedSymptomes(selectedSymptomes.filter(x => x !== val));
                                           }} />
                                    <label htmlFor={`chk-${idx}-${sIdx}`}>{s}</label>
                                </div>
                            ))}
                        </div>
                    ))}
                    <div style={{marginTop:15}}>
                        <label>📸 Ajouter une photo :</label>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} style={{display:'block', marginTop:5}} />
                        {photoPreview && <img src={photoPreview} alt="Preview" style={{width:80, height:80, objectFit:'cover', marginTop:10, borderRadius:8, border:'2px solid var(--primary)'}} />}
                    </div>
                    <button type="button" onClick={() => { if(navigator.geolocation) navigator.geolocation.getCurrentPosition(p => { setGpsLocation(`${p.coords.latitude},${p.coords.longitude}`); showNotif("Position capturée"); })}} className="action-btn" style={{marginTop:15, fontSize:13}}>📍 {gpsLocation ? "Position OK" : "Capturer GPS"}</button>
                    <button className="action-btn primary" style={{width:'100%', marginTop:20}} onClick={submitDiagnostic}>Envoyer le diagnostic</button>
                </div>
            )}
        </div>
    </div>
  );

  return (
    <div className="phone-frame">
      <Head><title>CAFCOOP App</title></Head>

      <header className="app-header">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             {currentTab !== 'home' && currentTab !== 'staff_home' && <button onClick={() => setCurrentTab(role === 'agriculteur' ? 'home' : 'staff_home')} style={{ background: 'none', border: 'none', fontSize: '24px', color: 'white' }}>⬅️</button>}
              <div className="app-title">🍃 CAFCOOP</div>
          </div>
          <div className="role-badge" onClick={() => { const next = role === 'agriculteur' ? 'personnel' : 'agriculteur'; setRole(next); setCurrentTab(next === 'agriculteur' ? 'home' : 'staff_home'); }} 
               style={{ background: role === 'personnel' ? '#FFC107' : 'rgba(255,255,255,0.2)', color: role === 'personnel' ? 'black' : 'white' }}>
            {role.toUpperCase()}
            {role === 'personnel' && (notifsStaff.commandes + notifsStaff.diags > 0) && <span className="badge-count" style={{top:-5, right:-10}}>{notifsStaff.commandes + notifsStaff.diags}</span>}
          </div>
        </div>
      </header>

      <main className="content-area" style={{paddingBottom: '100px'}}>
        {role === 'agriculteur' ? (
            <>
                {currentTab === 'home' && (
                    <div className="action-grid">
                        <div className="action-btn primary" onClick={() => setCurrentTab('boutique')}>🛒 Boutique</div>
                        <div className="action-btn primary" onClick={() => setCurrentTab('diagnostic')}>🩺 Diagnostic</div>
                        <div className="action-btn" onClick={() => setCurrentTab('commandes')}>📦 Commandes</div>
                        <div className="action-btn" onClick={() => setCurrentTab('profil')}>👤 Profil</div>
                    </div>
                )}
                {currentTab === 'boutique' && (
                    <div className="fade-in">
                        {PRODUITS_AGRICOLES.map(p => (
                            <div key={p.id} className="card product-card" onClick={() => { setSelectedProduct(p); setProductQuantity(1); setShowProductModal(true); }}>
                                <span>{p.image} {p.nom}</span>
                                <strong>{p.prix} FCFA</strong>
                            </div>
                        ))}
                    </div>
                )}
                {currentTab === 'panier' && renderPanier()}
                {currentTab === 'diagnostic' && renderDiagForm()}
            </>
        ) : (
            <div className="fade-in">
                <h2>📊 Dashboard Staff</h2>
                <div className="action-grid">
                    <div className="action-btn primary" onClick={() => { setCurrentTab('staff_orders'); setNotifsStaff(p => ({...p, commandes:0})); }}>
                        📦 Commandes {notifsStaff.commandes > 0 && <span className="badge-count">{notifsStaff.commandes}</span>}
                    </div>
                    <div className="action-btn primary" onClick={() => { setCurrentTab('staff_diags'); setNotifsStaff(p => ({...p, diags:0})); }}>
                        🩺 Diagnostics {notifsStaff.diags > 0 && <span className="badge-count">{notifsStaff.diags}</span>}
                    </div>
                </div>
                {currentTab === 'staff_orders' && (
                    <div>{commandesList.map(c => (
                        <div key={c.id_commande} className="card">#{c.id_commande} - {c.montant_total} FCFA 
                            <select onChange={(e) => { supabase.from('commandes').update({statut:e.target.value}).eq('id_commande', c.id_commande).then(()=>chargerDonneesSupabase())}} style={{display:'block', marginTop:5}}>
                                <option>Statut...</option><option value="empaqueté">Empaqueté</option><option value="livré">Livré</option>
                            </select>
                        </div>
                    ))}</div>
                )}
            </div>
        )}
      </main>

      {role === 'agriculteur' && (
          <nav className="bottom-nav">
            <div className={`nav-item ${currentTab === 'home' ? 'active' : ''}`} onClick={() => setCurrentTab('home')}>🏠<span>Accueil</span></div>
            <div className={`nav-item ${currentTab === 'boutique' ? 'active' : ''}`} onClick={() => setCurrentTab('boutique')}>🛒<span>Achats</span></div>
            <div className={`nav-item ${currentTab === 'panier' ? 'active' : ''}`} onClick={() => setCurrentTab('panier')}>
                <div style={{position:'relative'}}>🧺{panier.length > 0 && <span className="badge-count">{panier.length}</span>}</div>
                <span>Panier</span>
            </div>
          </nav>
      )}

      {showProductModal && selectedProduct && (
        <div className="modal active">
            <div className="card">
                <h2>{selectedProduct.nom}</h2>
                <div style={{display:'flex', justifyContent:'center', gap:15, margin:'20px 0'}}>
                    <button className="action-btn" onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}>-</button>
                    <span style={{fontSize:22}}>{productQuantity}</span>
                    <button className="action-btn" onClick={() => setProductQuantity(productQuantity + 1)}>+</button>
                </div>
                <button className="action-btn primary" style={{width:'100%'}} onClick={handleAddToCart}>Ajouter</button>
                <button onClick={() => setShowProductModal(false)} style={{marginTop:10, background:'none', border:'none', color:'#666'}}>Annuler</button>
            </div>
        </div>
      )}

      {notification && <div className={`notification show`} style={{background: notification.type === 'error' ? '#D32F2F' : '#4CAF50'}}>{notification.msg}</div>}
    </div>
  );
}
