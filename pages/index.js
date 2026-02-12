// /pages/index.js
import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { listProducts, getProductById, formatProductForUI } from '../lib/boutique';
import * as Panier from '../lib/panier';
import * as Commandes from '../lib/commandes';
import * as UI from '../lib/ui';
import { sendDiagnostic, fetchDiagnosticsByUser, requestDiagnosticPdf } from '../lib/diagnostic';
import { initRealtime, unsubscribeRealtime } from '../lib/realtime';
import { getSupabase, getCurrentUser, formatDate } from '../lib/supabase-client';

export default function Home() {
  // --- State
  const [role, setRole] = useState('agriculteur');
  const [currentTab, setCurrentTab] = useState('home');
  const [panier, setPanier] = useState([]);
  const [diagnosticsList, setDiagnosticsList] = useState([]);
  const [pdfLoadingById, setPdfLoadingById] = useState({});
  const [commandesList, setCommandesList] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoFileRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  // --- Initialisation légère
  useEffect(() => {
    setPanier(Panier.loadCart());
    setProducts(listProducts());
  }, []);

  // --- Bridge pour modal produit
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

  // --- Photo handlers
  const handleChargerPhoto = (file) => {
    if (!file) return;
    photoFileRef.current = file;
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // --- Envoi diagnostic
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

  // --- Validation commande
  const handleValiderCommande = async () => {
    const modeEl = document.getElementById('payment-mode');
    const mode = modeEl ? modeEl.value : 'especes';
    const cart = Panier.loadCart();
    const total = cart.reduce((s, p) => s + p.prix * p.quantite, 0);

    UI.afficherNotification('Validation commande...', 'info');
    const lignes = cart.map(p => ({ id: p.id, quantite: p.quantite, prix: p.prix }));
    const payload = {
      id_agriculteur: currentUser?.id_utilisateur || 1,
      montant_total: total,
      mode_paiement: mode,
      lignes
    };

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
    try {
      const supabase = await getSupabase();
      const { data: cmds } = await supabase.from('commandes').select('*').order('date_commande', { ascending: false });
      if (cmds) setCommandesList(cmds);
    } catch (e) { console.warn(e); }

    setCurrentTab('commandes');
  };

  // --- PDF generation handler
  const handleRequestPdf = async (id) => {
    if (!id) return;
    if (pdfLoadingById[id]) return;

    setPdfLoadingById(prev => ({ ...prev, [id]: true }));
    UI.afficherNotification('Génération du PDF en cours...', 'info');

    try {
      // Utilise la fonction importée depuis '../lib/diagnostic'
      const result = await requestDiagnosticPdf(id);

      if (result && result.data) {
        window.open(result.data, '_blank');
        UI.afficherNotification('PDF prêt', 'success');
      } else if (result && result.error) {
        console.error('PDF error', result.error);
        UI.afficherNotification('Erreur génération PDF', 'error');
      } else if (typeof result === 'string') {
        window.open(result, '_blank');
        UI.afficherNotification('PDF prêt', 'success');
      } else {
        UI.afficherNotification('Erreur génération PDF', 'error');
      }
    } catch (e) {
      console.error('handleRequestPdf error', e);
      UI.afficherNotification('Erreur réseau lors de la génération PDF', 'error');
    } finally {
      setPdfLoadingById(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  // --- Auth + init (robuste)
  useEffect(() => {
    let removeModalListeners = null;
    let authListener = null;
    let modalObserver = null;
    let attachInterval = null;

    const attachModalHandlers = (client) => {
      const tryAttach = () => {
        const loginBtn = document.getElementById('login-btn');
        const magicBtn = document.getElementById('magic-btn');
        const feedback = document.getElementById('login-feedback');

        if (!loginBtn || !magicBtn || !feedback) return false;

        const onLogin = async () => {
          try {
            loginBtn.disabled = true;
            feedback.innerText = 'Connexion...';
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-pass').value;
            const { data, error } = await client.auth.signInWithPassword({ email, password: pass });
            if (error) {
              feedback.innerText = error.message || 'Erreur connexion';
              UI.afficherNotification('Erreur connexion', 'error');
              loginBtn.disabled = false;
              return;
            }
            UI.closeModal();
            await postAuthInit(data.session.user.id);
          } catch (e) {
            console.error('onLogin error', e);
            feedback.innerText = 'Erreur réseau';
            loginBtn.disabled = false;
          }
        };

        const onMagic = async () => {
          try {
            magicBtn.disabled = true;
            feedback.innerText = 'Envoi du lien magique...';
            const email = document.getElementById('login-email').value;
            const { data, error } = await client.auth.signInWithOtp({ email });
            if (error) {
              feedback.innerText = error.message || 'Erreur envoi lien';
              UI.afficherNotification('Erreur', 'error');
              magicBtn.disabled = false;
              return;
            }
            feedback.innerText = 'Lien envoyé. Vérifie ta boîte mail.';
            UI.afficherNotification('Lien magique envoyé', 'success');
          } catch (e) {
            console.error('onMagic error', e);
            feedback.innerText = 'Erreur réseau';
            magicBtn.disabled = false;
          }
        };

        loginBtn.addEventListener('click', onLogin);
        magicBtn.addEventListener('click', onMagic);

        removeModalListeners = () => {
          try { loginBtn.removeEventListener('click', onLogin); } catch (e) {}
          try { magicBtn.removeEventListener('click', onMagic); } catch (e) {}
        };

        return true;
      };

      const modalContent = document.getElementById('modal-content');
      if (modalContent) {
        modalObserver = new MutationObserver(() => {
          if (tryAttach()) {
            modalObserver.disconnect();
            modalObserver = null;
          }
        });
        modalObserver.observe(modalContent, { childList: true, subtree: true });
      }

      let attempts = 0;
      attachInterval = setInterval(() => {
        attempts += 1;
        if (tryAttach() || attempts > 8) {
          clearInterval(attachInterval);
          attachInterval = null;
        }
      }, 80);
    };

    const checkAuthAndInit = async () => {
      const client = await getSupabase();
      const { data: { session } } = await client.auth.getSession();

      if (!session) {
        const html = `
          <div style="padding:16px;">
            <h3>Connexion</h3>
            <input id="login-email" placeholder="Email" style="width:100%; padding:8px; margin:8px 0;" />
            <input id="login-pass" type="password" placeholder="Mot de passe" style="width:100%; padding:8px; margin:8px 0;" />
            <div style="display:flex; gap:8px;">
              <button id="login-btn" class="btn btn-primary">Se connecter</button>
              <button id="magic-btn" class="btn">Magic link</button>
            </div>
            <div id="login-feedback" style="margin-top:8px; font-size:13px;"></div>
          </div>
        `;
        UI.openModal(html);
        attachModalHandlers(client);
        const { data } = client.auth.onAuthStateChange(async (event, sessionData) => {
          if (sessionData?.session) {
            UI.closeModal();
            await postAuthInit(sessionData.session.user.id);
          }
        });
        authListener = data;
      } else {
        await postAuthInit(session.user.id);
      }
    };

    checkAuthAndInit();

    return () => {
      if (removeModalListeners) {
        try { removeModalListeners(); } catch (e) {}
        removeModalListeners = null;
      }
      if (modalObserver) {
        try { modalObserver.disconnect(); } catch (e) {}
        modalObserver = null;
      }
      if (attachInterval) {
        try { clearInterval(attachInterval); } catch (e) {}
        attachInterval = null;
      }
      if (authListener?.subscription?.unsubscribe) {
        try { authListener.subscription.unsubscribe(); } catch (e) {}
      }
      try { unsubscribeRealtime(); } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- postAuthInit
  async function postAuthInit(uid) {
    if (!uid) return;
    try {
      const supabase = await getSupabase();

      // récupérer le profil métier lié à id_auth
      const { data: userRow, error: userErr } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('id_auth', uid)
        .maybeSingle();

      if (userErr) {
        console.error('Erreur récupération profil', userErr);
        UI.afficherNotification('Erreur récupération profil', 'error');
        return;
      }

      if (!userRow) {
        UI.afficherNotification('Profil CAFCOOP non trouvé. Complétez votre profil.', 'info');
        setCurrentTab && setCurrentTab('profil');
        setCurrentUser && setCurrentUser({ id_auth: uid, nom: '', prenom: '', email: '' });
        return;
      }

      // hydrate state
      setCurrentUser && setCurrentUser(userRow);

      // determine role (staff override)
      const { data: staffRows } = await supabase
        .from('personnel_cafcoop')
        .select('id_personnel')
        .eq('id_utilisateur', userRow.id_utilisateur)
        .limit(1);

      const resolvedRole = (staffRows && staffRows.length) ? 'personnel' : (userRow.role || 'agriculteur');
      setRole && setRole(resolvedRole);

      // load panier & products
      try {
        const localCart = Panier.loadCart();
        setPanier && setPanier(localCart);
      } catch (e) { console.warn('panier load error', e); }

      try {
        const prods = listProducts();
        setProducts && setProducts(prods);
      } catch (e) { console.warn('products load error', e); }

      // load diagnostics for user
      try {
        const { data: diags, error: diagErr } = await fetchDiagnosticsByUser(userRow.id_utilisateur);
        if (diagErr) console.warn('fetchDiagnosticsByUser error', diagErr);
        if (diags) setDiagnosticsList && setDiagnosticsList(diags);
      } catch (e) { console.warn('diagnostics load error', e); }

      // load commandes for user (or all if staff)
      try {
        if (resolvedRole === 'personnel') {
          const { data: cmds, error: cmdsErr } = await supabase.from('commandes').select('*').order('date_commande', { ascending: false });
          if (cmdsErr) console.warn('fetch commandes error', cmdsErr);
          if (cmds) setCommandesList && setCommandesList(cmds);
        } else {
          const { data: cmds, error: cmdsErr } = await supabase
            .from('commandes')
            .select('*')
            .eq('id_agriculteur', userRow.id_utilisateur) // Correction nom colonne
            .order('date_commande', { ascending: false });
          if (cmdsErr) console.warn('fetch commandes error', cmdsErr);
          if (cmds) setCommandesList && setCommandesList(cmds);
        }
      } catch (e) { console.warn('commandes load error', e); }

      // init realtime subscriptions
      try {
        await initRealtime(
          (payload) => {
            const d = payload.new;
            setDiagnosticsList(prev => [{ id: d.id_diagnostic, producteur: d.commentaire_agriculteur || 'Utilisateur', culture: d.id_culture, symptomes: [], statut: 'En attente', date: formatDate(d.date_creation) }, ...prev]);
            if (resolvedRole === 'personnel') UI.afficherNotification('🔔 Nouveau diagnostic !', 'info');
          },
          (payload) => {
            const c = payload.new;
            setCommandesList(prev => [{ ...c }, ...prev]);
          }
        );
      } catch (e) {
        console.warn('initRealtime error', e);
      }

      UI.afficherNotification(`Bienvenue ${userRow.nom || ''}`, 'success'); // CORRIGÉ: backticks
    } catch (e) {
      console.error('postAuthInit error', e);
      UI.afficherNotification('Erreur initialisation', 'error');
    }
  }

  // --- Renderers
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
            // CORRIGÉ : Conversion du JSX interne en String HTML pour innerHTML
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
              <div className={`status-pill ${d.statut === 'En attente' ? 'status-pending' : 'status-ok'}`}>
                {d.statut}
              </div>
              <button
                className="btn btn-outline"
                onClick={() => handleRequestPdf(d.id_diagnostic || d.id)}
                style={{ marginTop: 10, fontSize: '0.9em' }}
              >
                📄 {pdfLoadingById[d.id] || pdfLoadingById[d.id_diagnostic] ? 'Génération...' : 'PDF'}
              </button>
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
            <div style={{ fontWeight: 700 }}>{(c.montant_total || c.montanttotal || c.montant_total === 0) ? (c.montant_total || c.montanttotal).toLocaleString() + ' FCFA' : ''}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProfil = () => (
    <div className="fade-in">
      <h2>👤 Profil</h2>
      {currentUser && currentUser.nom ? (
        <div className="card">
          <p><strong>Nom:</strong> {currentUser.nom}</p>
          <p><strong>Rôle:</strong> {role}</p>
          <p><small>{currentUser.email}</small></p>
        </div>
      ) : (
        <div className="card">
          <p>Création de profil nécessaire. Complétez les informations ci‑dessous.</p>
          {/* Formulaire de création de profil à implémenter */}
        </div>
      )}
    </div>
  );

  // --- Product modal renderer (raw HTML)
  const renderProductModal = (p) => {
    return `
      <div class="modal-header">
        <div class="modal-title">${p.image || ''} ${p.nom}</div>
        <div class="close-modal" onclick="document.getElementById('modal').classList.remove('active')">✕</div>
      </div>
      <div style="font-size:20px; font-weight:700; color:var(--accent); margin:12px 0;">
        ${p.prix.toLocaleString()} FCFA
      </div>
      <p>${p.description || ''}</p>
      <div class="form-group" style="margin-top:12px;">
        <label>Quantité</label>
        <input type="number" id="product-quantity" value="1" min="1" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;">
      </div>
      <button class="btn btn-primary" id="modal-add-to-cart">🛒 Ajouter au panier</button>
    `;
  };

  const handleVoirDetailProduit = (id) => {
    const p = getProductById(id);
    if (!p) return;
    setSelectedProduct(formatProductForUI(p));
    UI.openModal(renderProductModal(p));
  };

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