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
 */
router.post('/', async (req, res) => {
  try {
    const {
      originalAmount, taxRate, taxAmount, total, authority,
      taxName, countryName, countryCode, currency, buyerType,
      productType, reverseCharge, taxRatePercent,
      grossRevenue, corporateTaxRate, corporateTaxRatePercent,
      corporateTaxAmount, netProfit, sourceCountryCode
    } = req.body;

    const numOriginalAmount = parseFloat(originalAmount) || 0;
    const numTaxRate = parseFloat(taxRate) || 0;
    const numTaxAmount = parseFloat(taxAmount) || 0;
    const numTotal = parseFloat(total) || 0;
    const numGrossRev = parseFloat(grossRevenue) || numTotal;
    const numCorpTax = parseFloat(corporateTaxAmount) || 0;
    const numNetProfit = parseFloat(netProfit) || (numOriginalAmount - numCorpTax);
    
    const strCurrency = String(currency || 'USD');
    const strCountryName = String(countryName || 'Unknown');
    const strCountryCode = String(countryCode || 'XX');
    const strAuthority = String(authority || 'Tax Authority');
    const strTaxName = String(taxName || 'Tax');
    const strBuyerType = String(buyerType || 'B2C');
    const strProductType = String(productType || 'digital');
    const strSourceCode = String(sourceCountryCode || 'XX');
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Exact mockup colors
    const blueBg = rgb(0.35, 0.33, 0.89); 
    const white = rgb(1, 1, 1);
    const dark = rgb(0.1, 0.1, 0.1);
    const gray = rgb(0.4, 0.4, 0.4);
    const lightGray = rgb(0.96, 0.96, 0.97);
    const green = rgb(0.0, 0.65, 0.4); 

    // Header Background
    page.drawRectangle({
      x: 0,
      y: height - 160,
      width,
      height: 160,
      color: blueBg
    });

    // Header Left
    page.drawText('INVOICE', { x: 50, y: height - 60, size: 28, font: boldFont, color: white });
    page.drawText('Global Tax Engine', { x: 50, y: height - 100, size: 12, font: regularFont, color: white });

    // Header Right
    const invoiceNum = `GTE-${Math.floor(Math.random() * 100000)}`;
    const today = new Date().toLocaleDateString('en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
    
    page.drawText(`Date: ${today}`, { x: 420, y: height - 60, size: 10, font: regularFont, color: white });
    page.drawText(`Invoice #: ${invoiceNum}`, { x: 420, y: height - 85, size: 10, font: regularFont, color: white });

    // Bill To
    let y = height - 220;
    page.drawText('Bill To:', { x: 50, y, size: 14, font: boldFont, color: dark });
    y -= 30;
    page.drawText(`${strCountryName} — ${strAuthority.split(' ')[0] || 'Tax Dept'}`, { x: 50, y, size: 11, font: regularFont, color: dark });
    y -= 25;
    page.drawText(`Buyer Type: ${strBuyerType}`, { x: 50, y, size: 11, font: regularFont, color: dark });
    y -= 50;

    // Table Header
    page.drawRectangle({ x: 35, y: y - 10, width: 525, height: 35, color: lightGray });
    page.drawText('DESCRIPTION', { x: 50, y, size: 10, font: boldFont, color: gray });
    page.drawText('RATE', { x: 280, y, size: 10, font: boldFont, color: gray });
    page.drawText(`AMOUNT (${strCurrency})`, { x: 430, y, size: 10, font: boldFont, color: gray });
    y -= 45;

    // Row 1
    page.drawText(strProductType === 'digital' ? 'Digital Product/Service' : 'Physical Product', { x: 50, y, size: 11, font: regularFont, color: dark });
    page.drawText('—', { x: 280, y, size: 11, font: regularFont, color: dark });
    page.drawText(`${numOriginalAmount.toFixed(2)}`, { x: 430, y, size: 11, font: regularFont, color: dark }); 
    y -= 45;

    // Row 2
    page.drawText(strTaxName || 'Sales Tax', { x: 50, y, size: 11, font: regularFont, color: dark });
    page.drawText(taxRatePercent || `${(numTaxRate * 100).toFixed(2)}%`, { x: 280, y, size: 11, font: regularFont, color: dark });
    page.drawText(`${numTaxAmount.toFixed(2)}`, { x: 430, y, size: 11, font: regularFont, color: dark });
    y -= 30;

    // Divider
    page.drawRectangle({ x: 35, y, width: 525, height: 1, color: rgb(0.9, 0.9, 0.9) });
    y -= 30;

    // TOTAL row
    page.drawText('TOTAL', { x: 50, y, size: 14, font: boldFont, color: dark });
    page.drawText(`${numTotal.toFixed(2)}`, { x: 430, y, size: 14, font: boldFont, color: blueBg });
    y -= 50;

    // Breakdown right aligned text (roughly)
    const breakdownX = 220;
    const valueX = 430;
    
    page.drawText('Gross Revenue (from buyer)', { x: breakdownX, y, size: 11, font: regularFont, color: gray });
    page.drawText(`${numGrossRev.toFixed(2)}`, { x: valueX, y, size: 11, font: regularFont, color: gray });
    y -= 25;

    page.drawText('Tax Remitted', { x: breakdownX, y, size: 11, font: regularFont, color: gray });
    page.drawText(`-${numTaxAmount.toFixed(2)}`, { x: valueX, y, size: 11, font: regularFont, color: gray });
    y -= 25;

    page.drawText(`Corporate Tax (${corporateTaxRatePercent} ${strSourceCode})`, { x: breakdownX, y, size: 11, font: regularFont, color: gray });
    page.drawText(`-${numCorpTax.toFixed(2)}`, { x: valueX, y, size: 11, font: regularFont, color: gray });
    y -= 40;

    page.drawText('NET PROFIT', { x: breakdownX, y, size: 12, font: boldFont, color: dark });
    page.drawText(`${numNetProfit.toFixed(2)}`, { x: valueX, y, size: 12, font: boldFont, color: green });
    y -= 40;

    // Footer
    page.drawText(`Tax Authority: ${strAuthority}`, { x: 50, y, size: 9, font: regularFont, color: gray });
    y -= 30;

    page.drawText('This invoice was generated by Global Tax Engine for informational purposes only.', { x: 50, y, size: 9, font: regularFont, color: gray });
    y -= 20;
    page.drawText('Consult a qualified tax professional before filing. globaltaxengine.io', { x: 50, y, size: 9, font: regularFont, color: gray });

    // Output Base PDF
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
