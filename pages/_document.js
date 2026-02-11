// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

// Version CSS - Incrémentez manuellement après chaque modif CSS
const CSS_VERSION = '1.0.2'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <meta name="description" content="CAFCOOP - Application agricole du Cameroun" />
        <meta name="theme-color" content="#2E7D32" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* CSS avec version pour forcer rechargement */}
        <link rel="stylesheet" href={`/css/main.css?v=${CSS_VERSION}`} />
        
        {/* Meta pour désactiver le cache navigateur */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
