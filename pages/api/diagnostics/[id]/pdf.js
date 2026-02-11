// /pages/api/diagnostics/[id]/pdf.js
// API route: POST -> génère un PDF pour le diagnostic id et renvoie l'URL stockée dans Supabase Storage.
// Dépendances: "pdfkit" (npm install pdfkit) et accès Supabase Storage configuré.
// Ce fichier est un squelette fonctionnel ; adapte le style du PDF selon tes besoins.

import { getSupabase } from '../../../../lib/supabase-client';
import PDFDocument from 'pdfkit';
import stream from 'stream';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { id } = req.query;
  const id_diagnostic = parseInt(id, 10);
  if (!id_diagnostic) return res.status(400).json({ ok: false, error: 'ID invalide' });

  try {
    const supabase = await getSupabase();

    // Récupérer diagnostic et données associées
    const { data: diagData, error: diagErr } = await supabase
      .from('diagnostics')
      .select('*, diagnostic_photos(*), traitements_recommandes(*)')
      .eq('id_diagnostic', id_diagnostic)
      .single();

    if (diagErr || !diagData) return res.status(404).json({ ok: false, error: diagErr || 'Diagnostic introuvable' });

    // Générer PDF en mémoire
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const passthrough = new stream.PassThrough();
    const chunks = [];
    passthrough.on('data', (chunk) => chunks.push(chunk));
    passthrough.on('end', async () => {
      const pdfBuffer = Buffer.concat(chunks);

      // Uploader le PDF dans Supabase Storage (bucket 'diagnostic-pdfs' à créer)
      const filePath = `diagnostics/${id_diagnostic}/diagnostic_${Date.now()}.pdf`;
      try {
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('diagnostic-pdfs')
          .upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: false });

        if (uploadErr) {
          console.error('Upload PDF error', uploadErr);
          return res.status(500).json({ ok: false, error: uploadErr.message || uploadErr });
        }

        const { publicURL } = supabase.storage.from('diagnostic-pdfs').getPublicUrl(uploadData.path);
        return res.status(200).json({ ok: true, url: publicURL });
      } catch (e) {
        console.error('Erreur upload PDF', e);
        return res.status(500).json({ ok: false, error: e.message || 'Erreur upload' });
      }
    });

    // Pipe PDFDocument to passthrough
    doc.pipe(passthrough);

    // Contenu du PDF (simple template)
    doc.fontSize(18).text(`Diagnostic ${diagData.code_diagnostic}`, { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Agriculteur: ${diagData.id_agriculteur}`);
    doc.text(`Culture: ${diagData.id_culture}`);
    doc.text(`Date: ${new Date(diagData.date_creation).toLocaleString()}`);
    doc.moveDown();
    doc.fontSize(12).text('Commentaire:');
    doc.fontSize(11).text(diagData.commentaire_agriculteur || '-', { indent: 10 });
    doc.moveDown();

    if (diagData.traitements_recommandes && diagData.traitements_recommandes.length > 0) {
      doc.fontSize(12).text('Traitements recommandés:');
      diagData.traitements_recommandes.forEach((t, i) => {
        doc.fontSize(11).text(`${i + 1}. Produit ID: ${t.id_produit} — Dose: ${t.dose_recommandee || '-'}`, { indent: 10 });
      });
      doc.moveDown();
    }

    if (diagData.diagnostic_photos && diagData.diagnostic_photos.length > 0) {
      doc.addPage();
      doc.fontSize(14).text('Photos', { underline: true });
      for (const p of diagData.diagnostic_photos) {
        // Note: pdfkit can embed images from URLs only if accessible; for robustness, skip if not accessible.
        try {
          if (p.url_photo) {
            // attempt to embed image (may fail if remote URL not supported)
            doc.image(p.url_photo, { fit: [400, 300], align: 'center' });
            doc.moveDown();
          }
        } catch (e) {
          doc.fontSize(10).text(`(Impossible d'inclure l'image ${p.url_photo})`);
        }
      }
    }

    doc.end();
  } catch (e) {
    console.error('Erreur génération PDF', e);
    return res.status(500).json({ ok: false, error: e.message || 'Erreur serveur' });
  }
}