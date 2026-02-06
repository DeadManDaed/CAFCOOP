// pages/index.js - VERSION TOUT-EN-UN
import Head from 'next/head'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Tout le code JS ici après le chargement
    initApp()
  }, [])

  return (
    <>
      <Head>
        <title>CAFCOOP</title>
        <style>{`
          :root {
            --primary: #2E7D32;
            --primary-dark: #1B5E20;
            --accent: #FFC107;
            --bg: #F5F7FA;
            --surface: #FFFFFF;
            --text: #1A1A1A;
            --text-secondary: #757575;
            --danger: #D32F2F;
            --success: #388E3C;
            --nav-height: 64px;
            --shadow: 0 4px 20px rgba(0,0,0,0.08);
          }
          * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Roboto, -apple-system, sans-serif; background: var(--bg); margin: 0; padding: 0; overflow: hidden; width: 100%; height: 100vh; }
          .phone-frame { width: 100%; height: 100dvh; background: var(--bg); display: flex; flex-direction: column; overflow: hidden; position: relative; }
          .app-header { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; padding: 12px 20px 15px; padding-top: max(12px, env(safe-area-inset-top)); box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 10; flex-shrink: 0; }
          .header-content { display: flex; justify-content: space-between; align-items: center; }
          .app-title { font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
          .role-badge { font-size: 10px; background: rgba(255,255,255,0.25); padding: 5px 10px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; transition: all 0.3s; }
          .content-area { flex: 1; overflow-y: auto; padding: 16px; padding-bottom: 20px; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .fade-in { animation: fadeIn 0.3s ease-out; }
          .card { background: var(--surface); border-radius: 16px; padding: 16px; margin-bottom: 12px; box-shadow: var(--shadow); border: 1px solid rgba(0,0,0,0.05); transition: all 0.2s; }
          .card:active { transform: scale(0.98); }
          .card h3 { font-size: 16px; color: var(--text); margin-bottom: 8px; }
          .card p { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
          .product-card { display: flex; gap: 12px; align-items: center; cursor: pointer; }
          .product-icon { font-size: 40px; flex-shrink: 0; }
          .product-info { flex: 1; }
          .product-name { font-weight: 600; color: var(--primary); margin-bottom: 4px; }
          .product-price { color: var(--accent); font-weight: 700; font-size: 16px; }
          .status-pill { font-size: 11px; padding: 4px 10px; border-radius: 12px; font-weight: 600; display: inline-block; }
          .status-urgent { background: #FFEBEE; color: var(--danger); }
          .status-ok { background: #E8F5E9; color: var(--success); }
          .status-pending { background: #FFF3E0; color: #F57C00; }
          .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
          .action-btn { background: var(--surface); border: none; padding: 20px 16px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; box-shadow: var(--shadow); color: var(--primary); font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; }
          .action-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(0,0,0,0.12); }
          .action-btn.primary { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; }
          .form-group { margin-bottom: 16px; }
          .form-group label { display: block; font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
          .form-group select, .form-group input { width: 100%; padding: 12px; border: 1px solid #E0E0E0; border-radius: 8px; font-size: 14px; font-family: inherit; transition: border 0.2s; }
          .form-group select:focus, .form-group input:focus { outline: none; border-color: var(--primary); }
          .btn { width: 100%; padding: 14px; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 12px; }
          .btn-primary { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; }
          .btn-primary:active { transform: scale(0.98); }
          .btn-secondary { background: var(--surface); color: var(--primary); border: 2px solid var(--primary); }
          .fab { position: absolute; bottom: 80px; right: 20px; width: 56px; height: 56px; background: var(--accent); border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 6px 16px rgba(0,0,0,0.3); font-size: 24px; cursor: pointer; z-index: 20; transition: all 0.3s; }
          .bottom-nav { flex-shrink: 0; height: var(--nav-height); background: var(--surface); display: flex; justify-content: space-around; align-items: center; border-top: 1px solid rgba(0,0,0,0.08); padding-bottom: env(safe-area-inset-bottom); }
          .nav-item { display: flex; flex-direction: column; align-items: center; font-size: 10px; color: var(--text-secondary); gap: 4px; cursor: pointer; padding: 8px 12px; transition: all 0.2s; position: relative; }
          .nav-item.active { color: var(--primary); font-weight: 600; }
          .nav-item.active::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 30px; height: 3px; background: var(--primary); border-radius: 0 0 3px 3px; }
          .nav-icon { font-size: 22px; }
          #cart-summary { position: fixed; bottom: var(--nav-height); left: 0; right: 0; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; padding: 12px 20px; display: none; justify-content: space-between; align-items: center; box-shadow: 0 -2px 10px rgba(0,0,0,0.15); z-index: 25; }
          #cart-summary.active { display: flex; }
          .cart-count { background: var(--accent); color: #333; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 12px; }
          .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: none; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
          .modal.active { display: flex; }
          .modal-content { background: white; border-radius: 20px; padding: 24px; max-width: 90%; max-height: 85%; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
          .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #F0F0F0; }
          .modal-title { font-size: 18px; font-weight: 700; color: var(--primary); }
          .close-modal { font-size: 24px; cursor: pointer; color: var(--text-secondary); }
          .notification { position: fixed; top: 50px; left: 50%; transform: translateX(-50%) translateY(-100px); background: var(--success); color: white; padding: 12px 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 2000; transition: transform 0.3s; font-weight: 600; }
          .notification.show { transform: translateX(-50%) translateY(0); }
          .loading { text-align: center; padding: 40px 20px; }
          .spinner { border: 3px solid #f3f3f3; border-top: 3px solid var(--primary); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </Head>

      <div className="phone-frame">
        <header className="app-header">
          <div className="header-content">
            <div className="app-title"><span>🍃</span><span>CAFCOOP</span></div>
            <div className="role-badge" id="current-role">AGRICULTEUR</div>
          </div>
        </header>

        <main className="content-area" id="main-content">
          <div className="loading"><div className="spinner" /><p>Chargement...</p></div>
        </main>

        <div className="fab" id="fab-action">📸</div>

        <div id="cart-summary">
          <div><span className="cart-count" id="cart-count">0</span><span style={{marginLeft:'8px'}}>article(s)</span></div>
          <div><strong id="cart-total">0 FCFA</strong></div>
          <button className="btn btn-secondary" style={{width:'auto',padding:'8px 16px',margin:0}}>Voir panier</button>
        </div>

        <nav className="bottom-nav">
          <div className="nav-item active" data-tab="home"><span className="nav-icon">🏠</span><span>Accueil</span></div>
          <div className="nav-item" data-tab="boutique"><span className="nav-icon">🛒</span><span>Boutique</span></div>
          <div className="nav-item" data-tab="diagnostic"><span className="nav-icon">🩺</span><span>Diagnostic</span></div>
          <div className="nav-item" data-tab="profil"><span className="nav-icon">👤</span><span>Profil</span></div>
        </nav>
      </div>

      <div className="modal" id="modal"><div className="modal-content" id="modal-content"></div></div>
      <div className="notification" id="notification"></div>
    </>
  )
}

function initApp() {
  // DONNÉES
  const PRODUITS = [
    {id:'HM-20',nom:'Harvest More 20-20-20',prix:9500,image:'🌿',description:'Engrais foliaire équilibré'},
    {id:'HM-10',nom:'Harvest More 10-52-10',prix:10500,image:'🌸',description:'Haute teneur en Phosphore'},
    {id:'HM-5',nom:'Harvest More 5-5-45',prix:11000,image:'🍎',description:'Finition fruits'},
    {id:'ENG-NPK',nom:'Engrais NPK 20-10-10',prix:18500,image:'🚜',description:'Fertilisation de fond'},
    {id:'UREE',nom:'Urée 46%',prix:16000,image:'⚪',description:'Source azote'},
    {id:'FONG-C',nom:'Fongicide Cuivre',prix:4500,image:'🛡️',description:'Anti pourriture'},
  ]

  const PATHOLOGIES = {
    "Cacao": [{nom:"Pourriture brune",symptomes:["Cabosses brunies","Odeur de poisson","Moisissure blanche"]}],
    "Maïs": [{nom:"Chenille Légionnaire",symptomes:["Feuilles perforées","Larves visibles","Sciure humide"]}],
    "Manioc": [{nom:"Mosaïque",symptomes:["Feuilles déformées","Taches jaunes/vertes"]}],
  }

  // ÉTAT
  window.AppState = {
    role: 'agriculteur',
    currentTab: 'home',
    panier: JSON.parse(localStorage.getItem('cafcoop_panier')) || [],
    diagnosticsList: [],
    commandesList: [],
    selectedProduct: null
  }

  // NAVIGATION
  window.navigateTo = (tab) => {
    AppState.currentTab = tab
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.remove('active')
      if(el.dataset.tab === tab) el.classList.add('active')
    })
    renderPage()
  }

  window.toggleRole = () => {
    AppState.role = AppState.role === 'agriculteur' ? 'personnel' : 'agriculteur'
    const badge = document.getElementById('current-role')
    if(badge) {
      badge.innerText = AppState.role === 'agriculteur' ? 'AGRICULTEUR' : 'PERSONNEL'
      badge.style.background = AppState.role === 'personnel' ? '#FFC107' : 'rgba(255,255,255,0.2)'
    }
    renderPage()
  }

  // RENDU
  window.renderPage = () => {
    const container = document.getElementById('main-content')
    if(!container) return
    switch(AppState.currentTab) {
      case 'home': renderHome(container); break
      case 'boutique': renderBoutique(container); break
      case 'diagnostic': renderDiagnostic(container); break
      case 'profil': renderProfil(container); break
      default: renderHome(container)
    }
  }

  function renderHome(c) {
    c.innerHTML = `
      <div class="fade-in">
        <h2 style="text-align:center;margin-bottom:20px;">🍃 CAFCOOP</h2>
        <div class="action-grid">
          <div class="action-btn primary" onclick="navigateTo('boutique')"><span style="font-size:40px;">🛒</span><span>Boutique</span></div>
          <div class="action-btn primary" onclick="navigateTo('diagnostic')"><span style="font-size:40px;">🩺</span><span>Diagnostic</span></div>
          <div class="action-btn" onclick="navigateTo('profil')"><span style="font-size:40px;">👤</span><span>Profil</span></div>
          <div class="action-btn" onclick="toggleRole()"><span style="font-size:40px;">🔄</span><span>Changer rôle</span></div>
        </div>
      </div>
    `
  }

  function renderBoutique(c) {
    c.innerHTML = `
      <div class="fade-in">
        <h2>🛒 Boutique</h2>
        ${PRODUITS.map(p => `
          <div class="card product-card" onclick="voirDetailProduit('${p.id}')">
            <div class="product-icon">${p.image}</div>
            <div class="product-info">
              <div class="product-name">${p.nom}</div>
              <div class="product-price">${p.prix.toLocaleString()} FCFA</div>
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  window.voirDetailProduit = (id) => {
    const p = PRODUITS.find(prod => prod.id === id)
    if(!p) return
    AppState.selectedProduct = p
    document.getElementById('modal-content').innerHTML = `
      <div class="modal-header">
        <div class="modal-title">${p.image} ${p.nom}</div>
        <div class="close-modal" onclick="closeModal()">✕</div>
      </div>
      <div style="font-size:24px;font-weight:700;color:var(--accent);margin:15px 0;">${p.prix.toLocaleString()} FCFA</div>
      <p>${p.description}</p>
      <div class="form-group" style="margin-top:20px;">
        <label>Quantité</label>
        <input type="number" id="product-quantity" value="1" min="1" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;">
      </div>
      <button class="btn btn-primary" onclick="ajouterAuPanier()">🛒 Ajouter au panier</button>
    `
    document.getElementById('modal').classList.add('active')
  }

  window.ajouterAuPanier = () => {
    const qte = parseInt(document.getElementById('product-quantity').value)
    const p = AppState.selectedProduct
    if(!p) return
    const existant = AppState.panier.find(item => item.id === p.id)
    if(existant) existant.quantite += qte
    else AppState.panier.push({...p, quantite: qte})
    localStorage.setItem('cafcoop_panier', JSON.stringify(AppState.panier))
    updateCartSummary()
    closeModal()
    afficherNotification(`✅ ${p.nom} ajouté`, 'success')
  }

  window.updateCartSummary = () => {
    const total = AppState.panier.reduce((sum,p) => sum + (p.prix * p.quantite), 0)
    const count = AppState.panier.reduce((sum,p) => sum + p.quantite, 0)
    const el1 = document.getElementById('cart-count')
    const el2 = document.getElementById('cart-total')
    const el3 = document.getElementById('cart-summary')
    if(el1) el1.innerText = count
    if(el2) el2.innerText = total.toLocaleString() + ' FCFA'
    if(el3) {
      if(count > 0) el3.classList.add('active')
      else el3.classList.remove('active')
    }
  }

  function renderDiagnostic(c) {
    c.innerHTML = `
      <div class="fade-in">
        <h2>🩺 Diagnostic</h2>
        <select id="diag-culture" onchange="chargerSymptomes()" style="width:100%;padding:12px;border-radius:8px;border:1px solid #ddd;margin-bottom:15px;">
          <option value="">-- Culture --</option>
          ${Object.keys(PATHOLOGIES).map(cu => `<option value="${cu}">${cu}</option>`).join('')}
        </select>
        <div id="zone-symptomes"></div>
      </div>
    `
  }

  window.chargerSymptomes = () => {
    const culture = document.getElementById('diag-culture').value
    if(!culture) {
      document.getElementById('zone-symptomes').innerHTML = ''
      return
    }
    const maladies = PATHOLOGIES[culture]
    document.getElementById('zone-symptomes').innerHTML = maladies.map(m => `
      <div class="card">
        <strong>${m.nom}</strong>
        ${m.symptomes.map(s => `<label style="display:block;margin:5px 0;"><input type="checkbox" value="${s}"> ${s}</label>`).join('')}
      </div>
    `).join('')
  }

  function renderProfil(c) {
    c.innerHTML = `
      <div class="fade-in">
        <h2>👤 Profil</h2>
        <div class="card">
          <p><strong>Nom:</strong> Utilisateur DEMO</p>
          <p><strong>Rôle:</strong> ${AppState.role}</p>
        </div>
      </div>
    `
  }

  window.afficherNotification = (msg, type) => {
    const n = document.getElementById('notification')
    n.innerText = msg
    n.style.backgroundColor = type === 'error' ? '#D32F2F' : type === 'success' ? '#388E3C' : '#333'
    n.classList.add('show')
    setTimeout(() => n.classList.remove('show'), 3000)
  }

  window.closeModal = () => { document.getElementById('modal').classList.remove('active') }

  // EVENT LISTENERS
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.tab))
  })

  document.getElementById('current-role')?.addEventListener('click', toggleRole)
  document.getElementById('fab-action')?.addEventListener('click', () => navigateTo('diagnostic'))

  // INIT
  renderPage()
  updateCartSummary()
}
