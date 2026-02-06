// pages/index.js - VERSION CONNECTÉE SUPABASE
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function Home() {
  const [supabase, setSupabase] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialiser Supabase
    async function initSupabase() {
      try {
        const resp = await fetch('/api/supabase-config')
        const cfg = await resp.json()
        const client = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
        setSupabase(client)
        
        // Initialiser l'app avec Supabase
        window.supabaseClient = client
        initApp(client)
        setLoading(false)
      } catch (err) {
        console.error('Erreur Supabase:', err)
        setLoading(false)
      }
    }
    initSupabase()
  }, [])

  return (
    <>
      <Head>
        <title>CAFCOOP App</title>
           
      </Head>

      <div className="phone-frame">
        <header className="app-header">
          <div className="header-content">
            <div className="app-title"><span>🍃</span><span>CAFCOOP</span></div>
            <div className="role-badge" id="current-role">AGRICULTEUR</div>
          </div>
        </header>

        <main className="content-area" id="main-content">
          <div className="loading">
            <div className="spinner" />
            <p>{loading ? 'Connexion à Supabase...' : 'Chargement...'}</p>
          </div>
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

function initApp(supabase) {
  const PATHOLOGIES = {
    "Cacao": [{nom:"Pourriture brune",symptomes:["Cabosses brunies","Odeur de poisson","Moisissure blanche"]}],
    "Maïs": [{nom:"Chenille Légionnaire",symptomes:["Feuilles perforées","Larves visibles","Sciure humide"]}],
    "Manioc": [{nom:"Mosaïque",symptomes:["Feuilles déformées","Taches jaunes/vertes"]}],
  }

  const getProductIcon = (categorie) => {
    const icons = {
      'engrais_foliaire': '🌿',
      'engrais_sol': '🚜',
      'phytosanitaire': '🛡️',
      'semences': '🌱',
      'materiel': '🔧',
      'biostimulant': '⚡'
    }
    return icons[categorie] || '📦'
  }

  window.AppState = {
    role: 'agriculteur',
    currentTab: 'home',
    panier: JSON.parse(localStorage.getItem('cafcoop_panier')) || [],
    produits: [],
    diagnosticsList: [],
    commandesList: [],
    selectedProduct: null,
    supabase: supabase
  }

  // CHARGER PRODUITS DEPUIS SUPABASE
  async function chargerProduits() {
    try {
      const { data, error } = await supabase
        .from('produits')
        .select('*')
        .eq('statut', 'actif')
        .order('nom_produit')
      
      if (error) throw error
      
      AppState.produits = data.map(p => ({
        id: p.code_produit,
        nom: p.nom_produit,
        prix: p.prix_unitaire,
        image: getProductIcon(p.categorie),
        description: p.description || '',
        stock: p.stock_disponible,
        categorie: p.categorie
      }))
      
      if (AppState.currentTab === 'boutique') renderPage()
    } catch (err) {
      console.error('Erreur chargement produits:', err)
      afficherNotification('❌ Erreur chargement produits', 'error')
    }
  }

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
        <div class="card">
          <p style="text-align:center;">✅ Connecté à Supabase</p>
          <p style="text-align:center;font-size:12px;margin-top:8px;">${AppState.produits.length} produits disponibles</p>
        </div>
      </div>
    `
  }

  function renderBoutique(c) {
    if (AppState.produits.length === 0) {
      c.innerHTML = '<div class="loading"><div class="spinner"></div><p>Chargement produits...</p></div>'
      chargerProduits()
      return
    }

    c.innerHTML = `
      <div class="fade-in">
        <h2>🛒 Boutique (${AppState.produits.length})</h2>
        ${AppState.produits.map(p => `
          <div class="card product-card" onclick="voirDetailProduit('${p.id}')">
            <div class="product-icon">${p.image}</div>
            <div class="product-info">
              <div class="product-name">${p.nom}</div>
              <div class="product-price">${p.prix.toLocaleString()} FCFA</div>
              ${p.stock > 0 ? `<div class="product-stock">Stock: ${p.stock}</div>` : '<div style="color:red;font-size:11px;">Rupture</div>'}
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  window.voirDetailProduit = (id) => {
    const p = AppState.produits.find(prod => prod.id === id)
    if(!p) return
    AppState.selectedProduct = p
    document.getElementById('modal-content').innerHTML = `
      <div class="modal-header">
        <div class="modal-title">${p.image} ${p.nom}</div>
        <div class="close-modal" onclick="closeModal()">✕</div>
      </div>
      <div style="font-size:24px;font-weight:700;color:var(--accent);margin:15px 0;">${p.prix.toLocaleString()} FCFA</div>
      <p>${p.description}</p>
      ${p.stock > 0 ? `
        <div class="form-group" style="margin-top:20px;">
          <label>Quantité (max: ${p.stock})</label>
          <input type="number" id="product-quantity" value="1" min="1" max="${p.stock}" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;">
        </div>
        <button class="btn btn-primary" onclick="ajouterAuPanier()">🛒 Ajouter au panier</button>
      ` : '<p style="color:red;text-align:center;padding:20px;">Produit en rupture de stock</p>'}
    `
    document.getElementById('modal').classList.add('active')
  }

  window.ajouterAuPanier = () => {
    const qte = parseInt(document.getElementById('product-quantity').value)
    const p = AppState.selectedProduct
    if(!p || qte > p.stock) {
      afficherNotification('❌ Stock insuffisant', 'error')
      return
    }
    const existant = AppState.panier.find(item => item.id === p.id)
    if(existant) {
      if(existant.quantite + qte > p.stock) {
        afficherNotification('❌ Stock insuffisant', 'error')
        return
      }
      existant.quantite += qte
    } else {
      AppState.panier.push({...p, quantite: qte})
    }
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
          <p><strong>Connexion:</strong> Supabase ✅</p>
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

  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.tab))
  })

  document.getElementById('current-role')?.addEventListener('click', toggleRole)
  document.getElementById('fab-action')?.addEventListener('click', () => navigateTo('diagnostic'))

  chargerProduits()
  renderPage()
  updateCartSummary()
}
