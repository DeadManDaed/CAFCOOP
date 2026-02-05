/**
 * cafcoop_data.js
 * Données statiques : Régions, Pathologies et Catalogue Produit Complet
 * Adapté pour ES Modules (Firebase)
 */

// 1. RÉGIONS ET CULTURES DU CAMEROUN
export const REGIONS_CAMEROUN = {
    "Centre": {
        cultures: ["Cacao", "Manioc", "Maïs", "Plantain"],
        climat: "Équatorial",
        pluviometrie: "1500-2000mm"
    },
    "Littoral": {
        cultures: ["Palmier à huile", "Plantain", "Cacao", "Ananas"],
        climat: "Équatorial côtier",
        pluviometrie: "2500-3000mm"
    },
    "Sud": {
        cultures: ["Cacao", "Caoutchouc", "Palmier à huile"],
        climat: "Équatorial",
        pluviometrie: "1500-2000mm"
    },
    "Sud-Ouest": {
        cultures: ["Cacao", "Palmier à huile", "Hévéa", "Banane"],
        climat: "Équatorial humide",
        pluviometrie: ">3000mm"
    },
    "Ouest": {
        cultures: ["Maïs", "Café", "Haricot", "Pomme de terre"],
        climat: "Tropical d'altitude",
        pluviometrie: "1500-2000mm"
    },
    "Nord-Ouest": {
        cultures: ["Café", "Plantain", "Maïs", "Solanacées"],
        climat: "Tropical d'altitude",
        pluviometrie: "2000-2500mm"
    },
    "Est": {
        cultures: ["Cacao", "Café", "Manioc", "Bois"],
        climat: "Équatorial",
        pluviometrie: "1500-2000mm"
    },
    "Adamaoua": {
        cultures: ["Coton", "Maïs", "Igname", "Bovins"],
        climat: "Tropical de savane",
        pluviometrie: "1000-1500mm"
    },
    "Nord": {
        cultures: ["Coton", "Arachide", "Sorgho", "Oignon"],
        climat: "Tropical sec",
        pluviometrie: "800-1000mm"
    },
    "Extrême-Nord": {
        cultures: ["Sorgho", "Mil", "Coton", "Niébé"],
        climat: "Sahélien",
        pluviometrie: "400-800mm"
    }
};

// 2. BASE DE CONNAISSANCES PATHOLOGIES (Pour le diagnostic)
export const BASE_PATHOLOGIES = {
    "Cacao": [
        { nom: "Pourriture brune", symptomes: ["Cabosses brunies", "Odeur de poisson", "Progression rapide", "Moisissure blanche"] },
        { nom: "Mirides (Piqueurs)", symptomes: ["Taches noires sur cabosses", "Dessèchement des rameaux", "Fentes sur l'écorce"] },
        { nom: "Foreurs de tiges", symptomes: ["Sciure à la base du tronc", "Jaunissement des feuilles", "Mort subite de branches"] }
    ],
    "Maïs": [
        { nom: "Chenille Légionnaire", symptomes: ["Feuilles perforées", "Larves visibles dans le cornet", "Sciure humide"] },
        { nom: "Charbon", symptomes: ["Excroissances grisâtres", "Poudre noire sur épis"] },
        { nom: "Stries du maïs", symptomes: ["Raies jaunes sur les feuilles", "Nanisme"] }
    ],
    "Manioc": [
        { nom: "Mosaïque", symptomes: ["Feuilles déformées", "Taches jaunes/vertes", "Croissance ralentie"] },
        { nom: "Pourriture racinaire", symptomes: ["Racines molles", "Odeur désagréable", "Flétrissement"] }
    ],
    "Tomate": [
        { nom: "Mildiou", symptomes: ["Taches huileuses sur feuilles", "Brunissement des fruits"] },
        { nom: "Flétrissement bactérien", symptomes: ["Plante flétrie le jour", "Coupe de tige laiteuse"] }
    ],
    "Plantain": [
        { nom: "Cercosporiose (Sigatoka)", symptomes: ["Nécroses sur les feuilles", "Mûrissement précoce"] },
        { nom: "Charançon du bananier", symptomes: ["Galeries dans le bulbe", "Chute du pied"] }
    ],
    "Café": [
        { nom: "Rouille", symptomes: ["Pustules oranges sous les feuilles", "Chute des feuilles"] },
        { nom: "Scolyte", symptomes: ["Perforation des cerises", "Noircissement des grains"] }
    ]
};

// 3. CATALOGUE COMPLET DES PRODUITS (Stoller + Standards)
export const PRODUITS_AGRICOLES = [
    // --- GAMME EXPERT STOLLER (Fiches Techniques Détaillées) ---
    {
        id: 'HM-20',
        nom: 'Harvest More 20-20-20',
        categorie: 'Engrais Foliaire',
        prix: 9500,
        unite: '1kg',
        image: '🌿',
        description: 'Équilibre parfait pour la croissance générale.',
        fiche: {
            composition: 'N: 20%, P: 20%, K: 20% + Chélates Stoller.',
            dose: '2.5 kg/ha dans 200L d\'eau.',
            moment: 'Stade végétatif et post-récolte.',
            avantages: 'Absorption foliaire ultra-rapide, corrige les carences.'
        }
    },
    {
        id: 'HM-10',
        nom: 'Harvest More 10-52-10',
        categorie: 'Engrais Foliaire',
        prix: 10500,
        unite: '1kg',
        image: '🌸',
        description: 'Haute teneur en Phosphore pour racines et fleurs.',
        fiche: {
            composition: 'N: 10%, P: 52%, K: 10% + Micro-nutriments.',
            dose: '2 kg/ha.',
            moment: 'Pré-floraison et développement racinaire.',
            avantages: 'Stimule une floraison homogène et renforce l\'ancrage.'
        }
    },
    {
        id: 'HM-5',
        nom: 'Harvest More 5-5-45',
        categorie: 'Engrais Foliaire',
        prix: 11000,
        unite: '1kg',
        image: '🍎',
        description: 'Finition : Poids, Sucre et Conservation.',
        fiche: {
            composition: 'N: 5%, P: 5%, K: 45%. Potasse maximale.',
            dose: '3 kg/ha.',
            moment: 'Formation et remplissage des fruits/cabosses.',
            avantages: 'Augmente le poids spécifique et la qualité.'
        }
    },
    {
        id: 'HM-30',
        nom: 'Harvest More 30-10-10',
        categorie: 'Engrais Foliaire',
        prix: 9000,
        unite: '1kg',
        image: '🥬',
        description: 'Boost Azoté pour le démarrage.',
        fiche: {
            composition: 'N: 30%, P: 10%, K: 10%.',
            dose: '2 kg/ha.',
            moment: 'Démarrage végétatif intense.',
            avantages: 'Verdissement rapide des feuilles.'
        }
    },
    {
        id: 'BIO-F',
        nom: 'Stoller Bioforge',
        categorie: 'Biostimulant',
        prix: 15000,
        unite: '1L',
        image: '⚡',
        description: 'Gestion du stress climatique.',
        fiche: {
            composition: 'Anti-oxydants brevetés Stoller.',
            dose: '1L/ha.',
            moment: 'Après sécheresse ou excès d\'eau.',
            avantages: 'Relance la plante bloquée par le stress.'
        }
    },

    // --- PRODUITS STANDARDS (Génériques) ---
    {
        id: 'ENG-NPK',
        nom: 'Engrais NPK 20-10-10',
        categorie: 'Engrais Sol',
        prix: 18500,
        unite: 'Sac 50kg',
        image: '🚜',
        description: 'Fertilisation de fond pour toutes cultures.',
        fiche: { composition: 'Azote, Phosphore, Potasse', dose: 'Selon culture', moment: 'Début de saison', avantages: 'Standard économique' }
    },
    {
        id: 'UREE',
        nom: 'Urée 46%',
        categorie: 'Engrais Sol',
        prix: 16000,
        unite: 'Sac 50kg',
        image: '⚪',
        description: 'Source concentrée d\'azote.',
        fiche: { composition: '46% Azote', dose: 'Fractionner les apports', moment: 'Croissance', avantages: 'Croissance rapide' }
    },
    {
        id: 'FONG-C',
        nom: 'Fongicide Cuivre (Nordox)',
        categorie: 'Phytosanitaire',
        prix: 4500,
        unite: 'Sachet 1kg',
        image: '🛡️',
        description: 'Contre la pourriture brune du cacao.',
        fiche: { composition: 'Oxyde de cuivre', dose: '50g/15L eau', moment: 'Préventif', avantages: 'Longue durée d\'action' }
    },
    {
        id: 'INS-L',
        nom: 'Insecticide Cypercal',
        categorie: 'Phytosanitaire',
        prix: 3000,
        unite: '1L',
        image: '🦟',
        description: 'Lutte contre les mirides et foreurs.',
        fiche: { composition: 'Cyperméthrine', dose: '40ml/15L', moment: 'Attaque visible', avantages: 'Effet choc' }
    },
    {
        id: 'HERB-T',
        nom: 'Herbicide Total',
        categorie: 'Phytosanitaire',
        prix: 3500,
        unite: '1L',
        image: '☠️',
        description: 'Désherbage systémique (Glyphosate).',
        fiche: { composition: 'Glyphosate 360', dose: '200ml/15L', moment: 'Avant semis', avantages: 'Détruit les racines' }
    },
    {
        id: 'SEM-MAIS',
        nom: 'Semences Maïs Hybride',
        categorie: 'Semences',
        prix: 12000,
        unite: 'Dose 1ha',
        image: '🌽',
        description: 'Variété à haut rendement (PANAR).',
        fiche: { composition: 'Hybride F1', dose: '20kg/ha', moment: 'Début des pluies', avantages: 'Résistant sécheresse' }
    },
    {
        id: 'MAT-PUL',
        nom: 'Pulvérisateur à dos',
        categorie: 'Matériel',
        prix: 25000,
        unite: '16 Litres',
        image: '🎒',
        description: 'Matériel de traitement manuel.',
        fiche: { composition: 'Plastique renforcé', dose: 'N/A', moment: 'N/A', avantages: 'Robuste et réparable' }
    },
    {
        id: 'MAT-BOT',
        nom: 'Bottes de sécurité',
        categorie: 'Matériel',
        prix: 6000,
        unite: 'Paire',
        image: '👢',
        description: 'Protection pour l\'application.',
        fiche: { composition: 'PVC', dose: 'Taille 40-45', moment: 'Toujours', avantages: 'Protection chimique' }
    }
];

// 4. DONNÉES UTILISATEUR DÉMO
export const UTILISATEUR_DEMO = {
    nom: 'Jean NKOUAM',
    telephone: '699 00 00 00',
    region: 'Centre',
    village: 'Obala',
    role: 'agriculteur'
};