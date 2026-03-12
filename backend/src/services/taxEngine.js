/**
 * taxEngine.js - Core Tax Calculation Service
 *
 * What this file does:
 *   Contains the main tax calculation logic. Given a sale amount, country, product type,
 *   and buyer type, it looks up the correct tax rule and returns a full tax breakdown.
 *
 * How it interacts with the system:
 *   - Uses datasetLoader.js to find the country rule from tax_rules.json
 *   - Called by routes/tax.js to handle POST /api/tax requests
 *
 * Key functions:
 *   - calculateTax(amount, country, productType, buyerType) → { taxRate, taxAmount, total, authority, taxName }
 */

const { getRuleByCountry } = require('./datasetLoader');

/**
 * Calculates tax for a cross-border sale.
 *
 * @param {number} amount - The sale amount (before tax), e.g. 1000
 * @param {string} country - ISO 2-letter country code, e.g. "DE"
 * @param {string} productType - Either "digital" or "physical"
 * @param {string} buyerType - Either "B2B" or "B2C"
 *
 * @returns {object} Tax breakdown:
 *   {
 *     taxRate,     // as a decimal, e.g. 0.19 for 19%
 *     taxAmount,   // calculated tax amount, e.g. 190
 *     total,       // amount + taxAmount, e.g. 1190
 *     authority,   // e.g. "German Federal Central Tax Office"
 *     taxName,     // e.g. "VAT (MwSt)"
 *     countryName, // e.g. "Germany"
 *     currency,    // e.g. "EUR"
 *     reverseCharge // whether reverse charge was applied
 *   }
 *
 * @throws {Error} If country is not supported or inputs are invalid
 */
function calculateTax(amount, country, productType, buyerType) {
  // --- Input Validation ---
  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number.');
  }
  if (!country) {
    throw new Error('Country code is required.');
  }
  if (!['digital', 'physical'].includes(productType)) {
    throw new Error('Product type must be "digital" or "physical".');
  }
  if (!['B2B', 'B2C'].includes(buyerType)) {
    throw new Error('Buyer type must be "B2B" or "B2C".');
  }

  // --- Find Country Rule ---
  const rule = getRuleByCountry(country);
  if (!rule) {
    throw new Error(
      `Country "${country}" is not supported. Please choose from the 20 supported countries.`
    );
  }

  // --- Determine Tax Rate ---
  // Pick the rate based on product type (digital vs physical)
  let taxRate =
    productType === 'digital' ? rule.digital_tax_rate : rule.physical_tax_rate;

  // Apply reverse charge: if the country supports reverse charge AND the buyer is a business (B2B),
  // then the buyer accounts for their own VAT — so the seller charges 0% tax.
  let reverseCharge = false;
  if (rule.reverse_charge && buyerType === 'B2B') {
    taxRate = 0;
    reverseCharge = true;
  }

  // --- Calculate Tax ---
  const parsedAmount = parseFloat(amount);
  const taxAmount = parseFloat((parsedAmount * taxRate).toFixed(2));
  const total = parseFloat((parsedAmount + taxAmount).toFixed(2));

  return {
    taxRate,
    taxRatePercent: `${(taxRate * 100).toFixed(1)}%`,
    taxAmount,
    total,
    authority: rule.authority,
    taxName: rule.tax_name,
    countryName: rule.name,
    countryCode: rule.country,
    currency: rule.currency,
    reverseCharge,
    originalAmount: parsedAmount
  };
}

module.exports = { calculateTax };
