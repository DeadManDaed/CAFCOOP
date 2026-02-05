import Head from 'next/head'
import Script from 'next/script'

export default function Home() {
  return (
    <>
      <Head>
        <title>CAFCOOP App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#2E7D32" />
      </Head>

      {/* Structure correspondant exactement à ton CSS styles/globals.css */}
      <div className="phone-frame">
        
        {/* HEADER */}
        <header className="app-header">
          <div className="header-content">
            <div className="app-title">
              <span>🍃</span> CAFCOOP
            </div>
            {/* Le badge de rôle (cliquable pour changer) */}
            <div id="current-role" className="role-badge">
              Chargement...
            </div>
          </div>
        </header>

        {/* ZONE DE CONTENU PRINCIPAL */}
        <main id="main-content" className="content-area">
          <div className="loading">
             <div className="spinner"></div>
             Chargement de CAFCOOP...
          </div>
        </main>

        {/* BOUTON FLOTTANT (FAB) - Pour la caméra */}
        <div id="fab-camera" className="fab">
          📷
        </div>

        {/* BARRE DE NAVIGATION DU BAS */}
        <nav className="bottom-nav">
          <div className="nav-item active" data-target="accueil">
            <span className="nav-icon">🏠</span>
            <span>Accueil</span>
          </div>
          <div className="nav-item" data-target="boutique">
            <span className="nav-icon">🛒</span>
            <span>Boutique</span>
          </div>
          <div className="nav-item" data-target="diagnostic">
             <span className="nav-icon">🩺</span>
             <span>Diagnostic</span>
          </div>
          <div className="nav-item" data-target="profil">
            <span className="nav-icon">👤</span>
            <span>Profil</span>
          </div>
        </nav>

        {/* RÉSUMÉ PANIER FLOTTANT */}
        <div id="cart-summary" className="cart-summary">
            <span>Votre Panier</span>
            <span className="cart-count"><span id="cart-count">0</span> art.</span>
        </div>

        {/* MODALE GÉNÉRIQUE */}
        <div id="app-modal" className="modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 id="modal-title" className="modal-title">Titre</h3>
                    <span id="close-modal" className="close-modal">&times;</span>
                </div>
                <div id="modal-body">
                    {/* Le contenu sera injecté par JS */}
                </div>
            </div>
        </div>

        {/* NOTIFICATION TOAST */}
        <div id="notification" className="notification">
            Message de notification
        </div>

      </div>

      {/* CHARGEMENT DU SCRIPT PRINCIPAL */}
      {/* On utilise 'defer' implicitement avec strategy="afterInteractive" */}
      <Script 
        src="/js/cafcoop_app.js" 
        strategy="afterInteractive" 
      />
    </>
  )
}
