// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline.html',
  },
})

module.exports = withPWA({
  reactStrictMode: true,
  swcMinify: true,

  // Réécritures éventuelles (utile si tu veux des alias d’API)
  async rewrites() {
    return [
      {
        source: '/api/supabase-config',
        destination: '/api/supabase-config',
      },
    ]
  },

  // Headers HTTP pour PWA et sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  // Images optimisées (si tu en ajoutes plus tard)
  images: {
    domains: ['ccjidfxcctmqgpbftiga.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },

  // Internationalisation (si tu veux gérer plusieurs langues)
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
  },
})