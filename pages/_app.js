// pages/_app.js
import Head from 'next/head';
import '../styles/globals.css'; // Next.js gère le hash et le cache tout seul ici

function MyApp({ Component, pageProps }) {
  // Le bloc useEffect de registration du SW a été supprimé.
  // Cela empêche toute nouvelle tentative d'installation du worker.

  return (
    <>
      <Head>
        <title>CAFCOOP App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        {/* On ne met PAS de <link rel="stylesheet"> ici si on l'importe déjà plus haut */}
      </Head>
      
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
