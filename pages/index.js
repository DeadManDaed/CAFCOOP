// pages/index.js
import Head from 'next/head'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err)
      })
    }
  }, [])

  return (
    <>
      <Head>
        <title>CAFCOOP - Application Mobile Agricole</title>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2E7D32" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
      </Head>

      {/* Contrôles de démonstration */}
      <div className="demo-controls">
        <button className="switch-role" onClick={() => toggleRole()}>🔄 Changer Vue</button>
      </div>

      {/* Cadre du téléphone */}
      <div className="phone-frame">
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <div className="app-title">
              <span>🍃</span>
              <span>CAFCOOP</span>
            </div>
            <div className="role-badge" id="current-role" onClick={() => toggleRole()}>
              AGRICULTEUR
            </div>
          </div>
        </header>

        {/* Zone de contenu */}
        <main className="content-area" id="main-content">
          <div className="loading">
            <div className="spinner"></div>
            <p>Chargement de CAFCOOP...</p>
          </div>
        </main>

        {/* FAB */}
        <div className="fab" id="fab-action" onClick={() => fabAction()}>📸</div>

        {/* Résumé du panier */}
        <div id="cart-summary">
          <div>
            <span className="cart-count" id="cart-count">0</span>
            <span style={{ marginLeft: '8px' }}>article(s)</span>
          </div>
          <div>
            <strong id="cart-total">0 FCFA</strong>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => viewCart()}
            style={{ width: 'auto', padding: '8px 16px', margin: 0 }}
          >
            Voir le panier
          </button>
        </div>

        {/* Navigation */}
        <nav className="bottom-nav">
          <div className="nav-item active" onClick={() => navigateTo('home')} data-tab="home">
            <span className="nav-icon">🏠</span>
            <span>Accueil</span>
          </div>
          <div className="nav-item" onClick={() => navigateTo('boutique')} data-tab="boutique">
            <span className="nav-icon">🛒</span>
            <span>Boutique</span>
          </div>
          <div className="nav-item" onClick={() => navigateTo('diagnostic')} data-tab="diagnostic">
            <span className="nav-icon">🩺</span>
            <span>Diagnostic</span>
          </div>
          <div className="nav-item" onClick={() => navigateTo('profil')} data-tab="profil">
            <span className="nav-icon">👤</span>
            <span>Profil</span>
          </div>
        </nav>
      </div>

      {/* Modal */}
      <div className="modal" id="modal">
        <div className="modal-content" id="modal-content"></div>
      </div>

      {/* Notification */}
      <div className="notification" id="notification"></div>

      {/* Scripts client depuis public/js */}
      <script type="module" src="/js/cafcoop_data.js"></script>
      <script type="module" src="/js/supabase-client.js"></script>
      <script type="module" src="/js/cafcoop_app.js"></script>
    </>
  )
}