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
function calculateTax(amount, destCountry, sourceCountry, productType, buyerType, destState = null) {
  // --- Input Validation ---
  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number.');
  }
  if (!destCountry) {
    throw new Error('Destination country code is required.');
  }
  if (!sourceCountry) {
    throw new Error('Source country code is required.');
  }
  if (!['digital', 'physical'].includes(productType)) {
    throw new Error('Product type must be "digital" or "physical".');
  }
  if (!['B2B', 'B2C'].includes(buyerType)) {
    throw new Error('Buyer type must be "B2B" or "B2C".');
  }

  // --- Find Country Rules ---
  const destRule = getRuleByCountry(destCountry);
  if (!destRule) {
    throw new Error(
      `Destination country "${destCountry}" is not supported.`
    );
  }

  const sourceRule = getRuleByCountry(sourceCountry);
  if (!sourceRule) {
    throw new Error(
      `Source country "${sourceCountry}" is not supported.`
    );
  }

  // --- Standardized on USD ---
  const parsedAmountUSD = parseFloat(amount);
  const convertedAmount = parsedAmountUSD;

  // --- Determine Tax Rate ---
  // Pick the rate based on product type (digital vs physical)
  let taxRate =
    productType === 'digital' ? destRule.digital_tax_rate : destRule.physical_tax_rate;

  // Apply state-specific US tax rates if applicable
  if (destCountry === 'US' && destState) {
    const stateRates = {
      'CA': 0.0725, // California
      'NY': 0.088,  // New York
      'TX': 0.0625, // Texas
      'FL': 0.06,   // Florida
      'WA': 0.065   // Washington
    };
    if (stateRates[destState] !== undefined) {
      taxRate = stateRates[destState];
    }
  }

  // Apply reverse charge: if the country supports reverse charge AND the buyer is a business (B2B),
  // then the buyer accounts for their own VAT — so the seller charges 0% tax.
  let reverseCharge = false;
  if (destRule.reverse_charge && buyerType === 'B2B') {
    taxRate = 0;
    reverseCharge = true;
  }

  // --- Calculate Tax ---
  // 1. Calculate Tax to Remit (Destination VAT/GST)
  const taxAmount = parseFloat((convertedAmount * taxRate).toFixed(2));
  
  // 2. Calculate Gross Revenue (What the buyer pays)
  const total = parseFloat((convertedAmount + taxAmount).toFixed(2)); // Base + VAT

  // 3. Calculate Corporate Tax based on the SOURCE country rate, applied to the Net Revenue (Base Price)
  const corporateTaxRate = sourceRule.corporate_tax_rate || 0.20; // Defaulting to 20% if missing
  const corporateTaxAmount = parseFloat((convertedAmount * corporateTaxRate).toFixed(2));

  // 4. Calculate Net Profit (Base Price - Corporate Tax)
  const netProfit = parseFloat((convertedAmount - corporateTaxAmount).toFixed(2));

  return {
    taxRate,
    taxRatePercent: `${(taxRate * 100).toFixed(1)}%`,
    taxAmount,
    total,
    grossRevenue: total,
    corporateTaxRate,
    corporateTaxRatePercent: `${(corporateTaxRate * 100).toFixed(1)}%`,
    corporateTaxAmount,
    netProfit,
    authority: destRule.authority,
    taxName: destRule.tax_name,
    countryName: destRule.name,
    countryCode: destRule.country,
    sourceCountryCode: sourceRule.country,
    currency: 'USD',
    reverseCharge,
    originalAmount: convertedAmount,
    originalAmountUSD: parsedAmountUSD,
    exchangeRate: 1.0
  };
}

/**
 * Iterates through all countries and returns an array of what taxes WOULD be
 * for each country.
 */
function calculateWhatIf(amount, productType, buyerType) {
  const { getAllRules } = require('./datasetLoader');
  const allRules = getAllRules();
  
  const results = allRules.map(rule => {
    let taxRate = productType === 'digital' ? rule.digital_tax_rate : rule.physical_tax_rate;
    if (rule.reverse_charge && buyerType === 'B2B') {
      taxRate = 0;
    }
    
    // Assuming amount passed is in USD.
    const taxAmountUSD = amount * taxRate;
    
    return {
      countryCode: rule.country,
      countryName: rule.name,
      taxRate: taxRate,
      taxRatePercent: `${(taxRate * 100).toFixed(0)}%`, // Keeping it zero decimal places for preview
      taxAmountUSD: taxAmountUSD,
    };
  });

  return results.sort((a, b) => b.taxAmountUSD - a.taxAmountUSD);
}

module.exports = { calculateTax, calculateWhatIf };
