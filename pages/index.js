// /pages/index.js
// Page Next.js qui orchestre les modules et remplace public/cafcoop_app.js
import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { listProducts, getProductById, formatProductForUI } from '../lib/boutique';
import * as Panier from '../lib/panier';
import * as Commandes from '../lib/commandes';
import * as UI from '../lib/ui';
import { sendDiagnostic, fetchDiagnosticsByUser } from '../lib/diagnostic';
import { initRealtime } from '../lib/realtime';
import { getSupabase, getCurrentUser } from '../lib/supabase-client';

export default function Home() {
  const [role, setRole] = useState('agriculteur');
  const [currentTab, setCurrentTab] = useState('home');
  const [panier, setPanier] = useState([]);
  const [diagnosticsList, setDiagnosticsList] = useState([]);
  const [commandesList, setCommandesList] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoFileRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // initialisation client-side
    setPanier(Panier.loadCart());
    setProducts(listProducts());

    (async () => {
      await getSupabase(); // lazy init
      const user = await getCurrentUser();
      setCurrentUser(user || { id_utilisateur: 1 });

      const { data: diags } = await fetchDiagnosticsByUser(user?.id_utilisateur || 1);
      if (diags) setDiagnosticsList(diags);

      const supaRealtime = await initRealtime(
        (payload) => {
          const d = payload.new;
          setDiagnosticsList(prev => [{ id: d.id_diagnostic, producteur: d.commentaire_agriculteur || 'Utilisateur', culture: d.id_culture, symptomes: [], statut: 'En attente', date: new Date(d.date_creation).toLocaleString() }, ...prev]);
          if (role === 'personnel') UI.afficherNotification('🔔 Nouveau diagnostic !', 'info');
        },
        (payload) => {
          const c = payload.new;
          setCommandesList(prev => [{ ...c }, ...prev]);
        }
      );
    })();
  }, []);

  useEffect(() => {
    // charger commandes initiales
    (async () => {
      try {
        const supabase = await getSupabase();
        const { data } = await supabase.from('commandes').select('*').order('date_commande', { ascending: false });
        if (data) setCommandesList(data);
      } catch (e) { console.warn(e); }
    })();
  }, []);

  // UI helpers
  const updateCartSummary = () => {
    setPanier(Panier.loadCart());
  };

  const handleVoirDetailProduit = (id) => {
    const p = getProductById(id);
    if (!p) return;
    setSelectedProduct(formatProductForUI(p));
    UI.openModal(renderProductModal(p));
  };

  const renderProductModal = (p) => {
    return `
      <div class="modal-header">
        <div class="modal-title">${p.image} ${p.nom}</div>
        <div class="close-modal" onclick="document.getElementById('modal').classList.remove('active')">✕</div>
      </div>
      <div style="font-size:24px; font-weight:700; color:var(--accent); margin:15px 0;">
        ${p.prix.toLocaleString()} FCFA
      </div>
      <p>${p.description || ''}</p>
      <div class="form-group" style="margin-top:20px;">
        <label>Quantité</label>
        <input type="number" id="product-quantity" value="1" min="1" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
      </div>
      <button class="btn btn-primary" id="modal-add-to-cart">🛒 Ajouter au panier</button>
    `;
  };

  // expose a small bridge for modal button (since modal HTML is raw)
  useEffect(() => {
    const handler = (e) => {
      if (e.target && e.target.id === 'modal-add-to-cart' && selectedProduct) {
        const qtyEl = document.getElementById('product-quantity');
        const qty = qtyEl ? parseInt(qtyEl.value || '1', 10) : 1;
        const newCart = Panier.addToCart(Panier.loadCart(), selectedProduct, qty);
        setPanier([...newCart]);
        UI.afficherNotification(`${selectedProduct.nom} ajouté`, 'success');
        UI.closeModal();
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [selectedProduct]);

  // Diagnostic handlers
  const handleChargerPhoto = (file) => {
    if (!file) return;
    photoFileRef.current = file;
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleEnvoyerDiagnostic = async () => {
    const cultureEl = document.getElementById('diag-culture');
    const culture = cultureEl ? cultureEl.value : '';
    const symptomes = Array.from(document.querySelectorAll('.chk-symp:checked')).map(c => c.value);
    if (!culture || symptomes.length === 0) {
      UI.afficherNotification('Veuillez sélectionner une culture et au moins un symptôme.', 'error');
      return;
    }

    const payload = {
      id_agriculteur: currentUser?.id_utilisateur || 1,
      id_culture: culture,
      commentaire_agriculteur: `${culture} - ${symptomes.join(', ')}`,
      photos: photoFileRef.current ? [photoFileRef.current] : []
    };

    UI.afficherNotification('Envoi du diagnostic...', 'info');
    const { data, error } = await sendDiagnostic(payload);
    if (error) {
      console.error(error);
      UI.afficherNotification('Erreur lors de l\'envoi', 'error');
      return;
    }

    UI.afficherNotification('✅ Diagnostic envoyé !', 'success');
    setPhotoPreview(null);
    photoFileRef.current = null;

    const { data: hist } = await fetchDiagnosticsByUser(currentUser?.id_utilisateur || 1);
    if (hist) setDiagnosticsList(hist);
    setCurrentTab('home');
  };

  // Commande
  const handleValiderCommande = async () => {
    const modeEl = document.getElementById('payment-mode');
    const mode = modeEl ? modeEl.value : 'especes';
    const cart = Panier.loadCart();
    const total = cart.reduce((s, p) => s + p.prix * p.quantite, 0);

    UI.afficherNotification('Validation commande...', 'info');
    const lignes = cart.map(p => ({ id: p.id, quantite: p.quantite, prix: p.prix }));
    const payload = { id_agriculteur: currentUser?.id_utilisateur || 1, montant_total: total, mode_paiement: mode, lignes };
    const { data, error } = await Commandes.createOrder(payload);
    if (error) {
      console.error(error);
      UI.afficherNotification('Erreur commande', 'error');
      return;
    }

    Panier.clearCart();
    setPanier([]);
    UI.closeModal();
    UI.afficherNotification('✅ Commande validée !', 'success');

    // refresh commandes
    const supabase = await getSupabase();
    const { data: cmds } = await supabase.from('commandes').select('*').order('date_commande', { ascending: false });
    if (cmds) setCommandesList(cmds);
    setCurrentTab('commandes');
  };

  // Renderers (simplifiés, reprennent ton HTML existant)
  const renderHome = () => (
    <div className="fade-in">
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>🍃 CAFCOOP</h2>
      <div className="action-grid">
        <div className="action-btn primary" onClick={() => setCurrentTab('boutique')}>🛒<span>Boutique</span></div>
        <div className="action-btn primary" onClick={() => setCurrentTab('diagnostic')}>🩺<span>Diagnostic</span></div>
        <div className="action-btn" onClick={() => setCurrentTab('commandes')}>📦<span>Commandes</span></div>
        <div className="action-btn" onClick={() => setCurrentTab('profil')}>👤<span>Profil</span></div>
      </div>
    </div>
  );

  const renderBoutique = () => (
    <div className="fade-in">
      <h2>🛒 Boutique</h2>
      {products.map(p => (
        <div key={p.id} className="card product-card" onClick={() => handleVoirDetailProduit(p.id)}>
          <div className="product-icon">{p.image}</div>
          <div className="product-info">
            <div className="product-name">{p.nom}</div>
            <div className="product-price">{p.prix.toLocaleString()} FCFA</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDiagnostic = () => (
    <div className="fade-in">
      <h2>🩺 Diagnostic</h2>
      {role === 'agriculteur' ? (
        <>
          <select id="diag-culture" onChange={() => {
            const culture = document.getElementById('diag-culture').value;
            const maladies = window.BASE_PATHOLOGIES ? window.BASE_PATHOLOGIES[culture] || [] : [];
            const zone = document.getElementById('zone-symptomes');
            if (!zone) return;
            zone.innerHTML = maladies.map(m => `
              <div class="card">
                <strong>${m.nom}</strong>
                ${m.symptomes.map(s => `<label style="display:block; margin:5px 0;"><input type="checkbox" class="chk-symp" value="${s}"> ${s}</label>`).join('')}
              </div>
            `).join('');
          }} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', marginBottom: 15 }}>
            <option value="">-- Culture --</option>
            {Object.keys(typeof window !== 'undefined' && window.BASE_PATHOLOGIES ? window.BASE_PATHOLOGIES : {}).map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div id="zone-symptomes"></div>

          <div id="zone-photo" style={{ marginTop: 12 }}>
            <input type="file" accept="image/*" onChange={(e) => handleChargerPhoto(e.target.files[0])} />
            {photoPreview && <div id="apercu-photo"><img src={photoPreview} style={{ width: 100, borderRadius: 8, marginTop: 10 }} /></div>}
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={handleEnvoyerDiagnostic}>📤 Envoyer</button>
          </div>
        </>
      ) : (
        <div>
          <h3>📋 Diagnostics ({diagnosticsList.length})</h3>
          {diagnosticsList.map(d => (
            <div key={d.id} className="card" style={{ borderLeft: `4px solid ${d.statut === 'En attente' ? 'orange' : 'green'}` }}>
              <strong>{d.producteur}</strong><br />
              <small>{d.date}</small><br />
              <div className={`status-pill ${d.statut === 'En attente' ? 'status-pending' : 'status-ok'}`}>{d.statut}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCommandes = () => (
    <div className="fade-in">
      <h2>📦 {role === 'agriculteur' ? 'Mes Commandes' : 'Gestion Commandes'}</h2>
      {commandesList.map(c => (
        <div key={c.id_commande || c.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div><strong>#{c.id_commande || c.id}</strong></div>
            <div style={{ fontWeight: 700 }}>{(c.montant_total || c.montant_total === 0) ? (c.montant_total).toLocaleString() + ' FCFA' : ''}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProfil = () => (
    <div className="fade-in">
      <h2>👤 Profil</h2>
      <div className="card">
        <p><strong>Nom:</strong> {currentUser?.nom || 'Utilisateur DEMO'}</p>
        <p><strong>Rôle:</strong> {role}</p>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>CAFCOOP App</title>
      </Head>

      <div className="phone-frame">
        <header className="app-header">
          <div className="header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="app-title">🍃 CAFCOOP</div>
            </div>
            <div id="current-role" className="role-badge" onClick={() => setRole(r => r === 'agriculteur' ? 'personnel' : 'agriculteur')} style={{ cursor: 'pointer' }}>
              {role.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="content-area" style={{ paddingBottom: 100 }}>
          {currentTab === 'home' && renderHome()}
          {currentTab === 'boutique' && renderBoutique()}
          {currentTab === 'diagnostic' && renderDiagnostic()}
          {currentTab === 'commandes' && renderCommandes()}
          {currentTab === 'profil' && renderProfil()}
        </main>

        <nav className="bottom-nav">
          <div className={`nav-item ${currentTab === 'home' ? 'active' : ''}`} onClick={() => setCurrentTab('home')}>🏠<span>Accueil</span></div>
          <div className={`nav-item ${currentTab === 'boutique' ? 'active' : ''}`} onClick={() => setCurrentTab('boutique')}>🛒<span>Achats</span></div>
          <div className={`nav-item ${currentTab === 'panier' ? 'active' : ''}`} onClick={() => setCurrentTab('panier')}>🧺<span>Panier</span></div>
        </nav>
      </div>

      <div id="modal" className="modal"><div id="modal-content"></div></div>
    </>
  );
}