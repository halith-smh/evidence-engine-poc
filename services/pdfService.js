import fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { SignPdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';

/**
 * Adds a visual signature stamp to the PDF at specified coordinates
 */
export async function addVisualSignature(pdfPath, signerEmail, x, y, pageNumber = 0) {
  console.log(`📝 Adding visual signature for ${signerEmail} at (${x}, ${y}) on page ${pageNumber}`);

  const existingPdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const pages = pdfDoc.getPages();
  const targetPage = pages[pageNumber];
  const { height } = targetPage.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;

  const timestamp = new Date().toISOString();
  const signatureText = `Signed by: ${signerEmail}\n${timestamp}`;

  // Convert coordinates (PDF uses bottom-left origin)
  const adjustedY = height - y - 40;

  // Draw background rectangle
  targetPage.drawRectangle({
    x: x,
    y: adjustedY,
    width: 200,
    height: 40,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.2, 0.2, 0.8),
    borderWidth: 1
  });

  // Draw signature text
  targetPage.drawText(signatureText, {
    x: x + 5,
    y: adjustedY + 20,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0.5)
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(pdfPath, pdfBytes);

  console.log('✅ Visual signature added successfully');
}

/**
 * Applies cryptographic digital signature (P12) to the PDF
 */
export async function applyCryptographicSignature(pdfPath, p12Buffer, password) {
  console.log('🔒 Applying cryptographic P12 signature to PDF...');

  try {
    // Step 1: Load PDF with pdf-lib to normalize format
    console.log('📖 Loading and normalizing PDF...');
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Save to get a clean, normalized PDF buffer
    const normalizedPdfBytes = await pdfDoc.save({ useObjectStreams: false });
    let pdfBuffer = Buffer.from(normalizedPdfBytes);

    console.log(`📊 Normalized PDF size: ${pdfBuffer.length} bytes`);

    // Step 2: Add signature placeholder
    console.log('📋 Adding signature placeholder...');
    pdfBuffer = plainAddPlaceholder({
      pdfBuffer,
      reason: 'Document certified by KTern Evidence Engine',
      contactInfo: 'support@kternevidence.local',
      name: 'KTern Evidence Engine',
      location: 'Blockchain Network',
    });

    // Step 3: Create signer with P12 certificate
    console.log('🔑 Creating P12 signer...');
    const signer = new P12Signer(p12Buffer, { passphrase: password });

    // Step 4: Sign the PDF
    console.log('✍️ Signing PDF with P12 certificate...');
    const signPdf = new SignPdf();
    const signedPdf = await signPdf.sign(pdfBuffer, signer);

    // Step 5: Write the signed PDF back to disk
    console.log('💾 Writing signed PDF to disk...');
    fs.writeFileSync(pdfPath, signedPdf);

    console.log('✅ Cryptographic signature applied successfully');
    return true;
  } catch (error) {
    console.error('❌ Error applying cryptographic signature:', error);
    console.error('Error message:', error.message);
    throw error;
  }
}



/**
 * Calculates SHA-256 hash of the final PDF
 */
export async function calculatePdfHash(pdfPath) {
  const crypto = await import('crypto');
  const pdfBuffer = fs.readFileSync(pdfPath);
  const hash = crypto.default.createHash('sha256').update(pdfBuffer).digest('hex');
  console.log(`🔐 PDF Hash calculated: ${hash}`);
  return hash;
}

/**
 * Checks if all approvers have signed the document
 */
export function areAllApproversSigned(approvers) {
  return approvers.every((approver) => approver.signed === true);
}