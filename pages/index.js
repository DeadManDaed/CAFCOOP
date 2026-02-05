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
        <title>CAFCOOP</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a7" />
      </Head>

      <div id="app-shell">
        <header>
          <div id="current-role">AGRICULTEUR</div>
        </header>

        <main id="main-content" />

        <div id="modal" className="modal"><div id="modal-content"></div></div>
        <div id="notification"></div>
        <footer id="cart-summary"><span id="cart-count">0</span><span id="cart-total">0 FCFA</span></footer>
      </div>

      {/* Chargement des scripts client depuis public/js */}
      <script type="module" src="/js/cafcoop_data.js"></script>
      <script type="module" src="/js/supabase-client.js"></script>
      <script type="module" src="/js/cafcoop_app.js"></script>
    </>
  )
}