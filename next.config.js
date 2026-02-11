// next.config.js
module.exports = {
  reactStrictMode: true,
  
  // Build ID unique pour éviter le cache
  generateBuildId: async () => {
    return `v${Date.now()}`
  },

  // Headers anti-cache pour CSS
  async headers() {
    return [
      {
        source: '/css/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ]
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**', pathname: '/**' }
    ],
  },
  
  i18n: { 
    locales: ['fr', 'en'], 
    defaultLocale: 'fr' 
  }
}
