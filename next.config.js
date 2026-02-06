//next config.js
/** @type {import('next').NextConfig} */
const nextPwa = require('next-pwa');

const withPWA = nextPwa({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Désactivé en dev pour faciliter le debug
  fallbacks: {
    document: '/offline.html',
  },
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Autorise toutes les images HTTPS (utile pour tes données distantes)
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
  },
  // On garde une trace minimale du diagnostic si besoin, mais on nettoie le reste
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = withPWA(nextConfig);
