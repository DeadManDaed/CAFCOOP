/**
 * cafcoop_data.js
 * Base de données complète pour l'application CAFCOOP
 * Produits réels + Diagnostic agricole + Régions du Cameroun
 */

// RÉGIONS ET CULTURES DU CAMEROUN
const REGIONS_CAMEROUN = {
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
        cultures: ["Café", "Plantain", "Maïs"],
        climat: "Tropical d'altitude",
        pluviometrie: "1500-2000mm"
    },
    "Nord": {
        cultures: ["Millet", "Sorgho", "Coton", "Arachide"],
        climat: "Soudano-sahélien",
        pluviometrie: "600-1000mm"
    },
    "Extrême-Nord": {
        cultures: ["Millet", "Sorgho", "Coton", "Oignon"],
        climat: "Sahélien",
        pluviometrie: "400-800mm"
    },
    "Adamaoua": {
        cultures: ["Maïs", "Sorgho", "Bétail (fourrage)"],
        climat: "Tropical d'altitude",
        pluviometrie: "1000-1500mm"
    },
    "Est": {
        cultures: ["Cacao", "Hévéa", "Plantain"],
        climat: "Équatorial",
        pluviometrie: "1500-2000mm"
    }
};

// CATALOGUE PRODUITS CAFCOOP (Produits réels du site cafcoop.cm)
const CATALOGUE_CAFCOOP = {
    // ENGRAIS FOLIAIRES HARVEST MORE
    engrais: [
        {
            id: 'HM-30-10-10',
            nom: 'HARVEST MORE 30-10-10 + TE',
            categorie: 'Engrais',
            marque: 'Stoller',
            icon: '🌿',
            description: 'Engrais foliaire de qualité supérieure pour croissance végétative',
            composition: 'N: 30%, P: 10%, K: 10% + Oligo-éléments chélatés',
            dose: '2-3 kg/ha en pulvérisation foliaire (200-400g/100L)',
            moment: 'Phase végétative, tous les 15 jours',
            cultures: ['Cacao', 'Café', 'Maïs', 'Palmier à huile', 'Banane'],
            prix: 12500,
            unite: '1kg',
            stock: 'En stock',
            regions: ['Centre', 'Sud', 'Sud-Ouest', 'Littoral', 'Est', 'Ouest']
        },
        {
            id: 'HM-20-20-20',
            nom: 'HARVEST MORE 20-20-20',
            categorie: 'Engrais',
            marque: 'Stoller',
            icon: '🌾',
            description: 'Formule équilibrée pour toutes les phases de croissance',
            composition: 'N: 20%, P: 20%, K: 20% + Bore, Zinc, Cuivre',
            dose: '2-3 kg/ha (200-400g/100L)',
            moment: 'Tout au long du cycle végétatif',
            cultures: ['Toutes cultures'],
            prix: 9500,
            unite: '1kg',
            stock: 'En stock',
            regions: ['Toutes']
        },
        {
            id: 'HM-10-52-10',
            nom: 'HARVEST MORE 10-52-10',
            categorie: 'Engrais',
            marque: 'Stoller',
            icon: '🌸',
            description: 'Haute teneur en Phosphore pour racines et floraison',
            composition: 'N: 10%, P: 52%, K: 10% + Micro-nutriments',
            dose: '2.5 kg/ha (250g/100L)',
            moment: 'Repiquage, 15 jours avant floraison',
            cultures: ['Tomates', 'Maïs', 'Haricot', 'Café', 'Cacao'],
            prix: 10500,
            unite: '1kg',
            stock: 'En stock',
            regions: ['Toutes']
        },
        {
            id: 'HM-5-5-45',
            nom: 'HARVEST MORE 5-5-45',
            categorie: 'Engrais',
            marque: 'Stoller',
            icon: '🍎',
            description: 'Haute potasse pour remplissage des fruits',
            composition: 'N: 5%, P: 5%, K: 45%',
            dose: '3 kg/ha',
            moment: 'Formation et remplissage des fruits/cabosses',
            cultures: ['Cacao', 'Tomate', 'Banane', 'Ananas', 'Palmier'],
            prix: 11000,
            unite: '1kg',
            stock: 'En stock',
            regions: ['Centre', 'Sud', 'Sud-Ouest', 'Littoral']
        }
    ],

    // MICRONUTRIMENTS KEYLATE
    micronutriments: [
        {
            id: 'KEY-IRON',
            nom: 'KEYLATE IRON',
            categorie: 'Micronutriment',
            marque: 'Stoller',
            icon: '🔬',
            description: 'Fer chélaté pour chlorophylle et photosynthèse',
            composition: 'Fe-EDTA 13%',
            dose: '200-300g/100L en foliaire',
            moment: 'Dès apparition de chlorose',
            cultures: ['Toutes cultures'],
            prix: 8500,
            unite: '500g',
            stock: 'En stock',
            regions: ['Toutes']
        },
        {
            id: 'KEY-MAGNESIUM',
            nom: 'KEYLATE MAGNESIUM',
            categorie: 'Micronutriment',
            marque: 'Stoller',
            icon: '🔬',
            description: 'Magnésium chélaté pour chlorophylle',
            composition: 'MgO 15%',
            dose: '250-400g/100L',
            moment: 'Toute la saison',
            cultures: ['Cacao', 'Café', 'Palmier', 'Banane'],
            prix: 7800,
            unite: '500g',
            stock: 'En stock',
            regions: ['Toutes']
        },
        {
            id: 'KEY-MANGANESE',
            nom: 'KEYLATE MANGANÈSE',
            categorie: 'Micronutriment',
            marque: 'Stoller',
            icon: '🔬',
            description: 'Activateur enzymatique pour croissance',
            composition: 'Mn-EDTA 13%',
            dose: '150-250g/100L',
            moment: 'Croissance active',
            cultures: ['Toutes cultures'],
            prix: 8200,
            unite: '500g',
            stock: 'En stock',
            regions: ['Toutes']
        },
        {
            id: 'KEY-COPPER',
            nom: 'KEYLATE COPPER',
            categorie: 'Micronutriment',
            marque: 'Stoller',
            icon: '🔬',
            description: 'Cuivre chélaté, catalyseur de croissance',
            composition: 'Cu-EDTA 14%',
            dose: '100-200g/100L',
            moment: 'Prévention maladies fongiques',
            cultures: ['Cacao', 'Café', 'Tomate'],
            prix: 9000,
            unite: '500g',
            stock: 'En stock',
            regions: ['Toutes']
        },
        {
            id: 'KEY-MOLYBDENUM',
            nom: 'KEYLATE MOLYBDENUM',
            categorie: 'Micronutriment',
            marque: 'Stoller',
            icon: '🔬',
            description: 'Molybdène pour fixation azote',
            composition: 'Mo 8%',
            dose: '50-100g/100L',
            moment: 'Début végétation',
            cultures: ['Légumineuses', 'Toutes cultures'],
            prix: 7500,
            unite: '250g',
            stock: 'En stock',
            regions: ['Toutes']
        }
    ],

    // BIOSTIMULANTS
    biostimulants: [
        {
            id: 'ROOT-FEED',
            nom: 'ROOT FEED SP',
            categorie: 'Biostimulant',
            marque: 'Stoller',
            icon: '🌱',
            description: 'Favorise la croissance racinaire continue',
            composition: 'Acides aminés + Auxines naturelles',
            dose: '2-3 L/ha',
            moment: 'Tout le cycle, surtout repiquage',
            cultures: ['Toutes cultures'],
            prix: 15000,
            unite: '1L',
            stock: 'En stock',
            regions: ['Toutes']
        }
    ],

    // PRODUITS PHYTOSANITAIRES
    phytosanitaires: [
        {
            id: 'GOLDEN-PEST',
            nom: 'GOLDEN PEST SPRAY OIL',
            categorie: 'Insecticide',
            marque: 'Bio certifié OMRI',
            icon: '🛡️',
            description: 'Insecticide biologique certifié contre cochenilles et pucerons',
            composition: 'Huile minérale paraffinique 95%',
            dose: '1-2 L/100L d\'eau',
            moment: 'Dès apparition des ravageurs',
            cultures: ['Cacao', 'Café', 'Agrumes', 'Palmier'],
            prix: 8500,
            unite: '1L',
            stock: 'En stock',
            regions: ['Centre', 'Sud', 'Sud-Ouest', 'Littoral', 'Est']
        },
        {
            id: 'FONGICIDE-CACAO',
            nom: 'NORDOX 75 WG',
            categorie: 'Fongicide',
            marque: 'Adama',
            icon: '🍄',
            description: 'Fongicide cuprique contre pourriture brune du cacao',
            composition: 'Oxyde cuivreux 75%',
            dose: '3-4 kg/ha (300-400g/100L)',
            moment: 'Préventif: toutes les 3 semaines en saison pluies',
            cultures: ['Cacao'],
            prix: 12000,
            unite: '1kg',
            stock: 'En stock',
            regions: ['Centre', 'Sud', 'Sud-Ouest', 'Littoral', 'Est']
        },
        {
            id: 'INSECTICIDE-MIRIDES',
            nom: 'ACTARA 25 WG',
            categorie: 'Insecticide',
            marque: 'Syngenta',
            icon: '🐛',
            description: 'Contre mirides et capsides du cacaoyer',
            composition: 'Thiamethoxam 25%',
            dose: '200g/ha (20g/100L)',
            moment: 'Dès détection des mirides',
            cultures: ['Cacao', 'Café'],
            prix: 18000,
            unite: '500g',
            stock: 'Stock limité',
            regions: ['Centre', 'Sud', 'Sud-Ouest', 'Littoral']
        },
        {
            id: 'HERBICIDE-MAIS',
            nom: 'GALLANT SUPER',
            categorie: 'Herbicide',
            marque: 'Dow AgroSciences',
            icon: '🌿',
            description: 'Herbicide sélectif pour maïs et sorgho',
            composition: 'Haloxyfop-R-méthyl 10.8%',
            dose: '1-2 L/ha',
            moment: 'Post-levée, adventices 2-4 feuilles',
            cultures: ['Maïs', 'Sorgho', 'Millet'],
            prix: 9500,
            unite: '1L',
            stock: 'En stock',
            regions: ['Ouest', 'Nord', 'Extrême-Nord', 'Adamaoua']
        },
        {
            id: 'INSECTICIDE-FAW',
            nom: 'AMPLIGO',
            categorie: 'Insecticide',
            marque: 'Syngenta',
            icon: '🦗',
            description: 'Contre chenille légionnaire d\'automne (FAW)',
            composition: 'Lambda-cyhalothrine + Chlorantraniliprole',
            dose: '300ml/ha',
            moment: 'Dès apparition larves',
            cultures: ['Maïs', 'Sorgho'],
            prix: 16500,
            unite: '500ml',
            stock: 'En stock',
            regions: ['Toutes']
        },
        {
            id: 'FONGICIDE-CERCOSPORIOSE',
            nom: 'BANKO PLUS',
            categorie: 'Fongicide',
            marque: 'Syngenta',
            icon: '🍌',
            description: 'Contre cercosporiose (Sigatoka) du bananier',
            composition: 'Difenoconazole + Propiconazole',
            dose: '0.5-0.75 L/ha',
            moment: 'Préventif toutes les 2-3 semaines',
            cultures: ['Banane', 'Plantain'],
            prix: 22000,
            unite: '1L',
            stock: 'En stock',
            regions: ['Littoral', 'Sud-Ouest', 'Ouest', 'Centre']
        }
    ]
};

// BASE DE CONNAISSANCES : PATHOLOGIES PAR CULTURE
const BASE_PATHOLOGIES = {
    "Cacao": [
        {
            id: 'cacao-pb',
            nom: 'Pourriture brune (Phytophthora)',
            symptomes: [
                'Taches brunes/noires sur cabosses',
                'Odeur de poisson pourri',
                'Moisissure blanche sur cabosses',
                'Pourriture des fèves'
            ],
            causes: 'Champignon Phytophthora palmivora/megakarya',
            traitement: [
                'NORDOX 75 WG: 300-400g/100L eau',
                'Récolte sanitaire (enlever cabosses malades)',
                'Écabossage hors plantation',
                'Améliorer drainage'
            ],
            prevention: [
                'Élagage régulier pour aération',
                'Pulvérisation préventive toutes les 3 semaines',
                'Éviter blessures sur cabosses'
            ],
            gravite: 'Élevée'
        },
        {
            id: 'cacao-mirides',
            nom: 'Mirides / Capsides',
            symptomes: [
                'Rameaux desséchés (die-back)',
                'Taches noires déprimées sur cabosses',
                'Exsudation gommeuse',
                'Jeunes pousses flétries'
            ],
            causes: 'Insectes piqueurs-suceurs (Sahlbergella, Distantiella)',
            traitement: [
                'ACTARA 25 WG: 20g/100L eau',
                'GOLDEN PEST SPRAY OIL: 1-2L/100L',
                'Tailler rameaux morts'
            ],
            prevention: [
                'Surveillance régulière',
                'Maintenir ombrage modéré',
                'Éliminer adventices'
            ],
            gravite: 'Élevée'
        },
        {
            id: 'cacao-swollen-shoot',
            nom: 'Swollen Shoot (Virus)',
            symptomes: [
                'Renflements sur branches',
                'Marbrures jaunes sur feuilles',
                'Déformation des cabosses',
                'Dépérissement progressif'
            ],
            causes: 'Virus transmis par cochenilles',
            traitement: [
                'Arracher et brûler arbres infectés',
                'Lutter contre cochenilles vecteurs'
            ],
            prevention: [
                'Utiliser plants sains',
                'Contrôle cochenilles'
            ],
            gravite: 'Très élevée'
        }
    ],

    "Maïs": [
        {
            id: 'mais-faw',
            nom: 'Chenille Légionnaire d\'Automne (FAW)',
            symptomes: [
                'Feuilles perforées en "vitraux"',
                'Larves visibles dans verticille',
                'Sciure au cœur de la plante',
                'Déjections sur feuilles'
            ],
            causes: 'Spodoptera frugiperda (lépidoptère)',
            traitement: [
                'AMPLIGO: 300ml/ha',
                'Ramassage manuel des larves',
                'Traiter tôt le matin'
            ],
            prevention: [
                'Semis synchronisé',
                'Rotation culturale',
                'Surveillance hebdomadaire'
            ],
            gravite: 'Très élevée'
        },
        {
            id: 'mais-helminthosporiose',
            nom: 'Helminthosporiose',
            symptomes: [
                'Taches allongées brun-gris sur feuilles',
                'Dessèchement foliaire',
                'Réduction rendement'
            ],
            causes: 'Champignon (Helminthosporium)',
            traitement: [
                'Fongicides à base de cuivre',
                'Éliminer résidus de culture'
            ],
            prevention: [
                'Variétés résistantes',
                'Rotation'
            ],
            gravite: 'Moyenne'
        }
    ],

    "Banane/Plantain": [
        {
            id: 'banane-sigatoka',
            nom: 'Cercosporiose noire (Sigatoka)',
            symptomes: [
                'Stries noires sur feuilles',
                'Brunissement et nécrose foliaire',
                'Réduction taille régimes',
                'Maturation précoce'
            ],
            causes: 'Champignon Mycosphaerella fijiensis',
            traitement: [
                'BANKO PLUS: 0.5-0.75L/ha',
                'Effeuillage sanitaire',
                'Rotation de matières actives'
            ],
            prevention: [
                'Variétés tolérantes',
                'Drainage correct',
                'Pulvérisations préventives'
            ],
            gravite: 'Élevée'
        },
        {
            id: 'banane-charançon',
            nom: 'Charançon du bananier',
            symptomes: [
                'Jaunissement feuilles',
                'Affaiblissement plante',
                'Galeries dans pseudo-tronc',
                'Chute régimes'
            ],
            causes: 'Cosmopolites sordidus',
            traitement: [
                'Insecticides systémiques',
                'Pièges à phéromones',
                'Destruction rejets infestés'
            ],
            prevention: [
                'Utiliser rejets sains',
                'Paillage épais'
            ],
            gravite: 'Moyenne'
        }
    ],

    "Café": [
        {
            id: 'cafe-rouille',
            nom: 'Rouille du caféier',
            symptomes: [
                'Taches jaune-orangé sous feuilles',
                'Défoliation prématurée',
                'Baisse production',
                'Affaiblissement arbustes'
            ],
            causes: 'Champignon Hemileia vastatrix',
            traitement: [
                'Fongicides cupriques',
                'KEYLATE COPPER en préventif',
                'Ramasser feuilles malades'
            ],
            prevention: [
                'Aération plantation',
                'Fertilisation équilibrée',
                'Variétés résistantes'
            ],
            gravite: 'Élevée'
        },
        {
            id: 'cafe-scolyte',
            nom: 'Scolyte des grains (Borer)',
            symptomes: [
                'Trous dans cerises',
                'Grains perforés',
                'Chute cerises prématurée',
                'Baisse qualité'
            ],
            causes: 'Hypothenemus hampei',
            traitement: [
                'Récolte complète et régulière',
                'Insecticides spécifiques',
                'Pièges à alcool'
            ],
            prevention: [
                'Récolte sanitaire',
                'Gestion ombrage'
            ],
            gravite: 'Élevée'
        }
    ],

    "Palmier à huile": [
        {
            id: 'palmier-fusariose',
            nom: 'Fusariose du palmier',
            symptomes: [
                'Jaunissement unilatéral feuilles',
                'Dessèchement progressif',
                'Mort du palmier',
                'Brunissement tissus vasculaires'
            ],
            causes: 'Champignon Fusarium oxysporum',
            traitement: [
                'Pas de traitement curatif',
                'Arracher et brûler',
                'Désinfecter outils'
            ],
            prevention: [
                'Matériel végétal sain',
                'Drainage adéquat',
                'Rotation longue'
            ],
            gravite: 'Très élevée'
        }
    ],

    "Manioc": [
        {
            id: 'manioc-mosaique',
            nom: 'Mosaïque du manioc (CMD)',
            symptomes: [
                'Mosaïque jaune-vert sur feuilles',
                'Déformation foliaire',
                'Nanisme',
                'Réduction tubercules'
            ],
            causes: 'Virus transmis par aleurodes',
            traitement: [
                'Arracher plants infectés',
                'Lutte contre aleurodes',
                'Pas de traitement viral'
            ],
            prevention: [
                'Boutures saines',
                'Variétés résistantes',
                'Contrôle vecteurs'
            ],
            gravite: 'Très élevée'
        }
    ],

    "Tomate": [
        {
            id: 'tomate-mildiou',
            nom: 'Mildiou de la tomate',
            symptomes: [
                'Taches brunes sur feuilles',
                'Duvet blanc sous feuilles',
                'Pourriture des fruits',
                'Dessèchement rapide'
            ],
            causes: 'Phytophthora infestans',
            traitement: [
                'Fongicides systémiques',
                'Bouillie bordelaise',
                'Éliminer plants atteints'
            ],
            prevention: [
                'Espacement adéquat',
                'Éviter arrosage feuillage',
                'Variétés résistantes'
            ],
            gravite: 'Très élevée'
        }
    ]
};

// SYSTÈME DE GESTION DES DIAGNOSTICS
const SystemeDiagnostic = {
    stockageKey: 'cafcoop_diagnostics',

    creer(donnees) {
        const diagnostic = {
            id: 'DIAG-' + Date.now(),
            date: new Date().toLocaleString('fr-FR'),
            statut: 'En attente',
            ...donnees
        };
        
        const liste = this.obtenirTous();
        liste.unshift(diagnostic);
        localStorage.setItem(this.stockageKey, JSON.stringify(liste));
        
        return diagnostic;
    },

    obtenirTous() {
        const data = localStorage.getItem(this.stockageKey);
        return data ? JSON.parse(data) : [];
    },

    mettreAJour(id, modifications) {
        const liste = this.obtenirTous();
        const index = liste.findIndex(d => d.id === id);
        
        if (index !== -1) {
            liste[index] = { ...liste[index], ...modifications };
            localStorage.setItem(this.stockageKey, JSON.stringify(liste));
            return liste[index];
        }
        return null;
    },

    transferer(id, expert) {
        return this.mettreAJour(id, {
            statut: 'Transféré',
            expert: expert,
            dateTransfert: new Date().toLocaleString('fr-FR')
        });
    },

    supprimer(id) {
        const liste = this.obtenirTous();
        const nouvelleListe = liste.filter(d => d.id !== id);
        localStorage.setItem(this.stockageKey, JSON.stringify(nouvelleListe));
    }
};

// SYSTÈME DE GESTION DES COMMANDES
const SystemeCommande = {
    stockageKey: 'cafcoop_commandes',

    creer(articles, total) {
        const commande = {
            id: 'CMD-' + Math.floor(Math.random() * 90000 + 10000),
            date: new Date().toLocaleString('fr-FR'),
            articles: articles,
            total: total,
            statut: 'En cours',
            paiement: 'Mobile Money'
        };
        
        const liste = this.obtenirTous();
        liste.unshift(commande);
        localStorage.setItem(this.stockageKey, JSON.stringify(liste));
        
        return commande;
    },

    obtenirTous() {
        const data = localStorage.getItem(this.stockageKey);
        return data ? JSON.parse(data) : [];
    },

    mettreAJour(id, modifications) {
        const liste = this.obtenirTous();
        const index = liste.findIndex(c => c.id === id);
        
        if (index !== -1) {
            liste[index] = { ...liste[index], ...modifications };
            localStorage.setItem(this.stockageKey, JSON.stringify(liste));
            return liste[index];
        }
        return null;
    }
};

// Données utilisateur de démo
const UTILISATEUR_DEMO = {
    nom: 'Jean NKOUAM',
    telephone: '+237 6XX XX XX XX',
    region: 'Centre',
    commune: 'Obala',
    cultures: ['Cacao', 'Maïs'],
    superficie: '3.5 ha',
    role: 'agriculteur'
};