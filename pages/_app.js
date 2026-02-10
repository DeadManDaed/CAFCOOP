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
      <Component {...pageProps} />
    </>
  );
}
export default MyApp;

