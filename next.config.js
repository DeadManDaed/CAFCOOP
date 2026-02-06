// next.config.js
/*let withPWA = (config) => config

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
*/

// next.config.js
const fs = require('fs')
const path = require('path')

// --- ZONE DE DIAGNOSTIC PERSONNALISÉ ---
console.log('-------------------------------------------------------')
console.log('🔍 DÉMARRAGE DU DIAGNOSTIC CAFCOOP (BUILD TIME)')
console.log('-------------------------------------------------------')

try {
  // 1. Vérification du fichier CSS principal
  const cssPath = path.join(__dirname, 'styles', 'main.css') // Attention: on cherche main.css maintenant
  if (fs.existsSync(cssPath)) {
    const stats = fs.statSync(cssPath)
    console.log(`✅ [CSS] styles/main.css TROUVÉ.`)
    console.log(`   📊 Taille: ${stats.size} octets (${(stats.size / 1024).toFixed(2)} KB)`)
    
    // Petit bonus : lire les 50 premiers caractères pour voir si c'est le bon contenu
    const content = fs.readFileSync(cssPath, 'utf8')
    console.log(`   👀 Aperçu: "${content.substring(0, 50).replace(/\n/g, ' ')}..."`)
  } else {
    console.error('❌ [CSS] ALERTE: styles/main.css est INTROUVABLE !')
    // On liste le dossier styles pour voir ce qu'il y a dedans
    const stylesDir = path.join(__dirname, 'styles')
    if (fs.existsSync(stylesDir)) {
      console.log('   📂 Contenu du dossier styles:', fs.readdirSync(stylesDir))
    } else {
      console.log('   ❌ Le dossier styles/ n\'existe même pas.')
    }
  }

  // 2. Vérification de l'import dans _app.js
  const appPath = path.join(__dirname, 'pages', '_app.js')
  if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf8')
    if (appContent.includes("import '../styles/main.css'")) {
      console.log('✅ [_app.js] L\'import CSS pointe bien vers main.css')
    } else {
      console.error('❌ [_app.js] ATTENTION : L\'import semble incorrect ou pointe encore vers globals.css')
      console.log(`   Trouvé : ${appContent.match(/import.*;/)?.[0] || 'Aucun import trouvé'}`)
    }
  }

} catch (e) {
  console.error('💥 Erreur lors du diagnostic:', e)
}
console.log('-------------------------------------------------------')
// --- FIN DU DIAGNOSTIC ---


module.exports = {
  reactStrictMode: true,
}
