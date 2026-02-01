/**
 * cafcoop_data.js
 * Données statiques (Catalogue & Connaissances Agricoles)
 */

export const REGIONS_CAMEROUN = [
    "Centre", "Littoral", "Sud", "Sud-Ouest", "Ouest", "Nord-Ouest", "Est", "Adamaoua", "Nord", "Extrême-Nord"
];

// Base de connaissances pour le diagnostic (Alimente le menu déroulant)
export const BASE_PATHOLOGIES = {
    "Cacao": [
        { nom: "Pourriture brune", symptomes: ["Cabosses brunies", "Odeur de poisson", "Progression rapide"] },
        { nom: "Mirides (Piqueurs)", symptomes: ["Taches noires sur cabosses", "Dessèchement des rameaux"] },
        { nom: "Foreurs de tiges", symptomes: ["Sciure à la base du tronc", "Jaunissement des feuilles"] }
    ],
    "Maïs": [
        { nom: "Chenille Légionnaire", symptomes: ["Feuilles perforées", "Larves visibles dans le cornet", "Sciure humide"] },
        { nom: "Charbon", symptomes: ["Excroissances grisâtres", "Poudre noire"] }
    ],
    "Manioc": [
        { nom: "Mosaïque", symptomes: ["Feuilles déformées", "Taches jaunes/vertes", "Croissance ralentie"] },
        { nom: "Pourriture racinaire", symptomes: ["Racines molles", "Odeur désagréable", "Flétrissement"] }
    ],
    "Tomate": [
        { nom: "Mildiou", symptomes: ["Taches huileuses sur feuilles", "Brunissement des fruits"] },
        { nom: "Flétrissement bactérien", symptomes: ["Plante flétrie le jour", "Coupe de tige laiteuse"] }
    ]
};

// Catalogue Stoller & Autres
export const PRODUITS_AGRICOLES = [
    {
        id: 'HM-20',
        nom: 'Harvest More 20-20-20',
        prix: 9500,
        unite: '1kg',
        image: '🌿',
        desc: 'Croissance générale et équilibre.',
        fiche: { comp: 'N:20 P:20 K:20', dose: '2kg/ha', moment: 'Croissance végétative' }
    },
    {
        id: 'HM-10',
        nom: 'Harvest More 10-52-10',
        prix: 10500,
        unite: '1kg',
        image: '🌸',
        desc: 'Booster racinaire et floraison.',
        fiche: { comp: 'N:10 P:52 K:10', dose: '2kg/ha', moment: 'Avant floraison' }
    },
    {
        id: 'HM-5',
        nom: 'Harvest More 5-5-45',
        prix: 11000,
        unite: '1kg',
        image: '🍎',
        desc: 'Maturation et poids des fruits.',
        fiche: { comp: 'N:5 P:5 K:45', dose: '3kg/ha', moment: 'Fructification' }
    }
];
