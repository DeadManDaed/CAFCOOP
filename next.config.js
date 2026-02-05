// next.config.js
let withPWA = (config) => config

if (process.env.NODE_ENV === 'production') {
  try {
    const nextPwa = require('next-pwa')
    withPWA = nextPwa({
      dest: 'public',
      register: true,
      skipWaiting: true,
      fallbacks: { document: '/offline.html' }
    })
  } catch (e) {
    console.warn('next-pwa non disponible, PWA désactivée en production build.')
  }
}

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**'
      }
    ],
    formats: ['image/avif', 'image/webp']
  },
  i18n: { 
    locales: ['fr', 'en'], 
    defaultLocale: 'fr' 
  }
})
