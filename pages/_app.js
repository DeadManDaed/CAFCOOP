// pages/_app.js
import { useEffect } from 'react';
import Head from 'next/head';
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
        {/* CORRECTION : On ferme la balise Head et on insère le lien avec version */}
        
      </Head>
      
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
