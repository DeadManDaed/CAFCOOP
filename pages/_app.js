//pages/_app.js
/*
import '../styles/globals.css' // Importation du CSS que nous avons réparé
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

*/
*/
// pages/_app.js
import { useEffect } from 'react';
import Head from 'next/head';
// On garde l'import pour le build, mais on va le "doubler" dans le Head
import '../styles/globals.css'; 

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .catch(err => console.log('SW fail', err));
    }
  }, []);

  return (
    <>
      <Head>
        {/* On ajoute cette ligne : le "?v=1.0.1" force le navigateur à ignorer le vieux cache */}
        <link rel="stylesheet" href="/_next/static/css/styles.css?v=1.0.1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
export default MyApp;

