// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <meta name="description" content="CAFCOOP - Application agricole du Cameroun" />
        <meta name="theme-color" content="#2E7D32" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}