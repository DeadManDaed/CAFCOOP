//pages/_app.js
//import '../styles/main.css' // Importation du CSS que nous avons réparé
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>CAFCOOP App</title>
      </Head>

      {/* Ici, nous pourrons plus tard envelopper Component avec 
          <AuthProvider> ou <NotificationProvider> pour tes notifications style WhatsApp 
      */}
      <Component {...pageProps} />

      <style jsx global>{`
        /* Optimisations pour le mode App Mobile */
        html, body {
          overscroll-behavior-y: contain; /* Empêche le "pull-to-refresh" natif du navigateur */
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </>
  )
}

export default MyApp
