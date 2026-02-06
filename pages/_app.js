// C'est cette ligne qui fait la magie !
import '../styles/main.css' 
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Enregistrement du Service Worker pour le mode Hors-ligne (PWA)
    /*if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW fail', err))
    }*/
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
