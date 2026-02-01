import { db } from "./cafcoop_app.js";
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";

/**
 * SCRIPT DE MIGRATION CAFCOOP : SQL -> FIRESTORE
 * Ce script fusionne tes 25 tables en 4 collections majeures.
 */

export const MigrationTool = {
    
    // 1. FUSION : utilisateurs + roles + regions + localites
    async migrerUtilisateurs(donneesCombineesSQL) {
        const batch = writeBatch(db);
        donneesCombineesSQL.forEach(u => {
            const userRef = doc(collection(db, "utilisateurs"), u.id.toString());
            batch.set(userRef, {
                nom: u.nom,
                telephone: u.telephone,
                role: u.role_libelle, // Fusion de la table 'roles'
                localisation: {
                    region: u.region_nom, // Fusion de la table 'regions'
                    village: u.village_nom
                },
                date_inscription: serverTimestamp()
            });
        });
        await batch.commit();
        console.log("✅ Table Utilisateurs migrée.");
    },

    // 2. FUSION : diagnostics + pathologies + fiches_experts + photos
    async migrerDiagnostics(donneesDiagnosticsSQL) {
        const batch = writeBatch(db);
        donneesDiagnosticsSQL.forEach(d => {
            const diagRef = doc(collection(db, "diagnostics"), d.id.toString());
            batch.set(diagRef, {
                producteurId: d.user_id,
                culture: d.culture_nom,
                symptomes: d.liste_symptomes, // Tableau JSON extrait de tes tables liées
                photoUrl: d.chemin_image,
                statut: d.statut_label,
                expertise: d.commentaire_expert || null, // Fusion de la table 'expertises'
                date: serverTimestamp()
            });
        });
        await batch.commit();
        console.log("✅ Table Diagnostics migrée.");
    },

    // 3. FUSION : produits + stocks + categories + fiches_techniques
    async migrerCatalogue(donneesProduitsSQL) {
        const batch = writeBatch(db);
        donneesProduitsSQL.forEach(p => {
            const prodRef = doc(collection(db, "boutique"), p.sku);
            batch.set(prodRef, {
                nom: p.nom,
                prix: p.prix_vente,
                unite: p.unite_mesure,
                categorie: p.cat_nom,
                stock: p.quantite_disponible,
                fiche_stoller: {
                    composition: p.comp_chimique,
                    dose: p.dosage_ha,
                    avantages: p.points_forts
                }
            });
        });
        await batch.commit();
        console.log("✅ Catalogue Stoller migré.");
    },

    // 4. FUSION : commandes + details_commande + paiements
    async migrerCommandes(donneesCommandesSQL) {
        const batch = writeBatch(db);
        donneesCommandesSQL.forEach(c => {
            const orderRef = doc(collection(db, "commandes"), c.numero_facture);
            batch.set(orderRef, {
                clientId: c.user_id,
                items: c.produits_achetes, // Tableau d'objets [{id, qte, prix}]
                total: c.montant_total,
                moyen_paiement: "Mobile Money",
                reference_momo: c.momo_ref,
                statut: c.etat_livraison,
                date: serverTimestamp()
            });
        });
        await batch.commit();
        console.log("✅ Table Commandes migrée.");
    }
};
