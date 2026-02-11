// pages/api/diagnostics/[id]/pdf.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase server env vars');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Récupérer le diagnostic
    const { data: diag, error: diagErr } = await supabase
      .from('diagnostics')
      .select('*')
      .eq('id_diagnostic', id)
      .single();

    if (diagErr || !diag) return res.status(404).json({ error: 'Diagnostic not found' });

    // import dynamique pour éviter bundling côté client
    const PDFDocument = (await import('pdfkit')).default;

    // Génération PDF en mémoire
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    const endPromise = new Promise((resolve) => doc.on('end', resolve));

    doc.fontSize(18).text(`Diagnostic ${diag.code_diagnostic || id}`, { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Agriculteur: ${diag.id_agriculteur}`);
    doc.text(`Culture: ${diag.id_culture}`);
    doc.text(`Commentaire: ${diag.commentaire_agriculteur || ''}`);
    doc.text(`Date: ${new Date(diag.date_creation).toLocaleString()}`);
    doc.moveDown();

    // Si tu veux inclure des images stockées, récupère-les ici via supabase.storage (service_role)
    // Exemple (optionnel) :
    // if (diag.photo_paths && diag.photo_paths.length) {
    //   for (const path of diag.photo_paths) {
    //     const { data: fileData, error: fileErr } = await supabase.storage.from('diagnostic-photos').download(path);
    //     if (!fileErr) {
    //       const buffer = await fileData.arrayBuffer();
    //       doc.addPage();
    //       doc.image(Buffer.from(buffer), { fit: [500, 400] });
    //     }
    //   }
    // }

    doc.end();
    await endPromise;
    const pdfBuffer = Buffer.concat(chunks);

    const filePath = `diagnostics/${id}.pdf`;
    const { error: uploadErr } = await supabase.storage
      .from('diagnostic-pdfs')
      .upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });

    if (uploadErr) {
      console.error('Upload error', uploadErr);
      return res.status(500).json({ error: 'Upload failed' });
    }

    const { data: urlData, error: urlErr } = await supabase.storage
      .from('diagnostic-pdfs')
      .createSignedUrl(filePath, 60 * 60);

    if (urlErr) {
      console.error('Signed URL error', urlErr);
      return res.status(500).json({ error: 'Signed URL failed' });
    }

    return res.status(200).json({ url: urlData.signedUrl });
  } catch (err) {
    console.error('PDF generation error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}