#!/usr/bin/env node

/**
 * Script de diagnostic CAFCOOP
 * Vérifie que tout est correctement configuré
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSTIC CAFCOOP\n');

const checks = {
  success: [],
  warnings: [],
  errors: []
};

// 1. Vérifier les fichiers essentiels
const requiredFiles = [
  'package.json',
  'next.config.js',
  'pages/index.js',
  'pages/_app.js',
  'pages/_document.js',
  'pages/api/supabase-config.js',
  'public/js/cafcoop_app.js',
  'public/js/cafcoop_data.js',
  'public/js/supabase-client.js',
  'public/manifest.json',
  'public/sw.js',
  'styles/globals.css'
];

console.log('📁 Vérification des fichiers...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    checks.success.push(`✅ ${file}`);
  } else {
    checks.errors.push(`❌ Manquant: ${file}`);
  }
});

// 2. Vérifier .env.local
console.log('\n🔐 Vérification de la configuration Supabase...');
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL=https://') && 
      !envContent.includes('votre-projet')) {
    checks.success.push('✅ NEXT_PUBLIC_SUPABASE_URL configurée');
  } else {
    checks.errors.push('❌ NEXT_PUBLIC_SUPABASE_URL non configurée');
  }
  
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && 
      !envContent.includes('votre-cle')) {
    checks.success.push('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY configurée');
  } else {
    checks.errors.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY non configurée');
  }
} else {
  checks.errors.push('❌ Fichier .env.local manquant');
  checks.warnings.push('⚠️  Copiez .env.local.example vers .env.local et remplissez-le');
}

// 3. Vérifier node_modules
console.log('\n📦 Vérification des dépendances...');
if (fs.existsSync('node_modules')) {
  checks.success.push('✅ node_modules présent');
  
  // Vérifier les dépendances critiques
  const criticalDeps = ['next', 'react', '@supabase/supabase-js'];
  criticalDeps.forEach(dep => {
    if (fs.existsSync(`node_modules/${dep}`)) {
      checks.success.push(`✅ ${dep} installé`);
    } else {
      checks.errors.push(`❌ ${dep} manquant`);
    }
  });
} else {
  checks.errors.push('❌ node_modules manquant');
  checks.warnings.push('⚠️  Exécutez: npm install');
}

// 4. Afficher le résumé
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 RÉSUMÉ DU DIAGNOSTIC\n');

if (checks.success.length > 0) {
  console.log('✅ SUCCÈS (' + checks.success.length + ')');
  checks.success.forEach(msg => console.log('  ' + msg));
}

if (checks.warnings.length > 0) {
  console.log('\n⚠️  AVERTISSEMENTS (' + checks.warnings.length + ')');
  checks.warnings.forEach(msg => console.log('  ' + msg));
}

if (checks.errors.length > 0) {
  console.log('\n❌ ERREURS (' + checks.errors.length + ')');
  checks.errors.forEach(msg => console.log('  ' + msg));
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (checks.errors.length === 0) {
  console.log('\n🎉 Tout est OK ! Vous pouvez lancer:');
  console.log('   npm run dev');
} else {
  console.log('\n⚠️  Corrigez les erreurs ci-dessus avant de continuer.');
  console.log('   Consultez le README.md pour plus d\'informations.');
  process.exit(1);
}
