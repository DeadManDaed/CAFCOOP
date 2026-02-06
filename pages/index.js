// pages/index.js
import Head from 'next/head'
import Script from 'next/script'
//import '../styles/globals.css' 

export default function Home() {
  return (
    <>
      <Head>
        <title>CAFCOOP - Application Mobile Agricole</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </Head>

      {/* Contrôles de démonstration */}
      <div className="demo-controls">
        <button className="switch-role" onClick={() => window.toggleRole?.()}>🔄 Changer Vue</button>
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
            <div className="role-badge" id="current-role" onClick={() => window.toggleRole?.()}>
              AGRICULTEUR
            </div>
          </div>
        </header>

        {/* Zone de contenu */}
        <main className="content-area" id="main-content">
          <div className="loading">
            <div className="spinner" />
            <p>Chargement de CAFCOOP...</p>
          </div>
        </main>

        {/* FAB */}
        <div className="fab" id="fab-action" onClick={() => window.fabAction?.()}>📸</div>

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
            onClick={() => window.viewCart?.()}
            style={{ width: 'auto', padding: '8px 16px', margin: 0 }}
          >
            Voir le panier
          </button>
        </div>

        {/* Navigation */}
        <nav className="bottom-nav">
          <div className="nav-item active" onClick={() => window.navigateTo?.('home')} data-tab="home">
            <span className="nav-icon">🏠</span>
            <span>Accueil</span>
          </div>
          <div className="nav-item" onClick={() => window.navigateTo?.('boutique')} data-tab="boutique">
            <span className="nav-icon">🛒</span>
            <span>Boutique</span>
          </div>
          <div className="nav-item" onClick={() => window.navigateTo?.('diagnostic')} data-tab="diagnostic">
            <span className="nav-icon">🩺</span>
            <span>Diagnostic</span>
          </div>
          <div className="nav-item" onClick={() => window.navigateTo?.('profil')} data-tab="profil">
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

      {/* Scripts - Chargement correct pour Next.js */}
      <Script src="../public/js/cafcoop_data.js" type="module" strategy="afterInteractive" />
      <Script src="../public/js/supabase-client.js" type="module" strategy="afterInteractive" />
      <Script src="../public/js/cafcoop_app.js" type="module" strategy="afterInteractive" />
    </>
  )
}
