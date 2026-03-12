/**
 * routes/invoice.js - PDF Invoice Generation Route
 *
 * What this file does:
 *   Receives a tax calculation result and generates a downloadable PDF invoice
 *   using the pdf-lib library. No external APIs — everything is done locally.
 *
 * How it interacts with the system:
 *   - Mounted in server.js at /api/invoice
 *   - Uses pdf-lib to build a professional-looking PDF in memory
 *   - Returns the PDF as a downloadable file
 *
 * POST /api/invoice → generates and returns a PDF invoice
 */

const express = require('express');
const router = express.Router();
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

/**
 * POST /api/invoice
 * Generates a PDF invoice from a tax calculation result.
 *
 * Request body:
 *   { amount, country, countryName, taxRate, taxAmount, total, taxName,
 *     buyerType, productType, authority, currency }
 */
router.post('/', async (req, res) => {
  try {
    const {
      originalAmount,
      taxRate,
      taxAmount,
      total,
      authority,
      taxName,
      countryName,
      countryCode,
      currency,
      buyerType,
      productType,
      reverseCharge,
      taxRatePercent
    } = req.body;

    // ─── Input Validation & Type Conversion ────────────────────────────────────
    // Ensure all numeric values are properly converted to numbers for calculations
    const numOriginalAmount = parseFloat(originalAmount) || 0;
    const numTaxRate = parseFloat(taxRate) || 0;
    const numTaxAmount = parseFloat(taxAmount) || 0;
    const numTotal = parseFloat(total) || 0;
    
    // Ensure string values
    const strCurrency = String(currency || 'USD');
    const strCountryName = String(countryName || 'Unknown');
    const strCountryCode = String(countryCode || 'XX');
    const strAuthority = String(authority || 'Tax Authority');
    const strTaxName = String(taxName || 'Tax');
    const strBuyerType = String(buyerType || 'B2C');
    const strProductType = String(productType || 'digital');
    const strTaxRatePercent = taxRatePercent ? String(taxRatePercent) : null;
    const boolReverseCharge = Boolean(reverseCharge);

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a standard A4-like page (595 x 842 points)
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    // Load fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // ─── Color Palette ────────────────────────────────────────────────────────
    const purple = rgb(0.424, 0.388, 1.0);    // #6C63FF
    const mint = rgb(0.0, 0.851, 0.647);       // #00D9A5
    const dark = rgb(0.1, 0.1, 0.15);
    const gray = rgb(0.5, 0.5, 0.55);
    const lightGray = rgb(0.95, 0.96, 0.99);
    const white = rgb(1, 1, 1);

    // ─── Header Banner ────────────────────────────────────────────────────────
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width,
      height: 100,
      color: purple
    });

    page.drawText('Global Tax Engine', {
      x: 40,
      y: height - 45,
      size: 22,
      font: boldFont,
      color: white
    });

    page.drawText('TAX INVOICE', {
      x: 40,
      y: height - 70,
      size: 12,
      font: regularFont,
      color: rgb(0.8, 0.8, 1.0)
    });

    const invoiceNum = `INV-${Date.now()}`;
    const today = new Date().toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    page.drawText(`Invoice #${invoiceNum}`, {
      x: width - 200,
      y: height - 45,
      size: 11,
      font: regularFont,
      color: rgb(0.8, 0.8, 1.0)
    });

    page.drawText(today, {
      x: width - 200,
      y: height - 65,
      size: 10,
      font: regularFont,
      color: rgb(0.8, 0.8, 1.0)
    });

    // ─── Details Section ──────────────────────────────────────────────────────
    let y = height - 140;

    page.drawText('Sale Details', {
      x: 40,
      y,
      size: 14,
      font: boldFont,
      color: dark
    });

    y -= 30;
    const detailRows = [
      ['Destination Country', `${strCountryName} (${strCountryCode})`],
      ['Product Type', strProductType === 'digital' ? 'Digital Product' : 'Physical Product'],
      ['Buyer Type', strBuyerType === 'B2B' ? 'Business (B2B)' : 'Consumer (B2C)'],
      ['Tax Authority', strAuthority],
      ['Tax Type', strTaxName]
    ];

    detailRows.forEach(([label, value]) => {
      page.drawText(label, {
        x: 40,
        y,
        size: 11,
        font: regularFont,
        color: gray
      });
      page.drawText(String(value), {
        x: 220,
        y,
        size: 11,
        font: regularFont,
        color: dark
      });
      y -= 22;
    });

    // ─── Divider ──────────────────────────────────────────────────────────────
    y -= 10;
    page.drawRectangle({ x: 40, y, width: width - 80, height: 1, color: rgb(0.88, 0.89, 0.95) });
    y -= 30;

    // ─── Calculation Breakdown ────────────────────────────────────────────────
    page.drawText('Tax Breakdown', {
      x: 40,
      y,
      size: 14,
      font: boldFont,
      color: dark
    });
    y -= 20;

    // Table header
    page.drawRectangle({ x: 40, y: y - 8, width: width - 80, height: 26, color: lightGray });

    page.drawText('Description', { x: 50, y: y, size: 11, font: boldFont, color: dark });
    page.drawText('Rate', { x: 340, y: y, size: 11, font: boldFont, color: dark });
    page.drawText(`Amount (${strCurrency})`, { x: 430, y: y, size: 11, font: boldFont, color: dark });
    y -= 30;

    // Line: Base amount
    page.drawText('Sale Amount (before tax)', { x: 50, y, size: 11, font: regularFont, color: dark });
    page.drawText('—', { x: 340, y, size: 11, font: regularFont, color: dark });
    page.drawText(numOriginalAmount.toFixed(2), { x: 430, y, size: 11, font: regularFont, color: dark });
    y -= 25;

    // Line: Tax
    const taxLabel = boolReverseCharge ? `${strTaxName} (Reverse Charge)` : strTaxName;
    page.drawText(taxLabel, { x: 50, y, size: 11, font: regularFont, color: dark });
    page.drawText(strTaxRatePercent || `${(numTaxRate * 100).toFixed(1)}%`, { x: 340, y, size: 11, font: regularFont, color: dark });
    page.drawText(numTaxAmount.toFixed(2), { x: 430, y, size: 11, font: regularFont, color: dark });
    y -= 10;

    // Total row
    page.drawRectangle({ x: 40, y: y - 8, width: width - 80, height: 30, color: purple });
    page.drawText('TOTAL', { x: 50, y: y + 3, size: 12, font: boldFont, color: white });
    page.drawText(`${strCurrency} ${numTotal.toFixed(2)}`, { x: 390, y: y + 3, size: 13, font: boldFont, color: white });
    y -= 40;

    // ─── Reverse Charge Notice ────────────────────────────────────────────────
    if (boolReverseCharge) {
      y -= 10;
      page.drawRectangle({ x: 40, y: y - 10, width: width - 80, height: 40, color: rgb(0.9, 1.0, 0.96) });
      page.drawText(
        '⚡ Reverse Charge applies: The buyer is responsible for accounting for the VAT.',
        { x: 50, y: y + 5, size: 10, font: regularFont, color: rgb(0, 0.5, 0.35) }
      );
      y -= 30;
    }

    // ─── Footer ───────────────────────────────────────────────────────────────
    page.drawText('Generated by Global Tax Engine  •  globaltaxengine.app', {
      x: 40,
      y: 30,
      size: 9,
      font: regularFont,
      color: gray
    });

    page.drawText('This invoice is for informational purposes only. Consult a tax professional for compliance.', {
      x: 40,
      y: 18,
      size: 8,
      font: regularFont,
      color: rgb(0.7, 0.7, 0.75)
    });

    // Mint accent bar at bottom
    page.drawRectangle({ x: 0, y: 0, width, height: 6, color: mint });

    // ─── Serialize PDF ────────────────────────────────────────────────────────
    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="tax-invoice-${invoiceNum}.pdf"`
    );
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Invoice generation error:', err);
    res.status(500).json({ error: 'Failed to generate invoice: ' + err.message });
  }
});

module.exports = router;
