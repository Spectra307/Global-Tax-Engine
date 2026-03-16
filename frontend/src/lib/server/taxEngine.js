/**
 * taxEngine.js - Core Tax Calculation Service (SvelteKit ESM Version)
 */
import { getRuleByCountry, getAllRules } from './datasetLoader.js';

/**
 * Calculates tax for a cross-border sale.
 */
export function calculateTax(amount, destCountry, sourceCountry, productType, buyerType, destState = null) {
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
    throw new Error(`Destination country "${destCountry}" is not supported.`);
  }

  const sourceRule = getRuleByCountry(sourceCountry);
  if (!sourceRule) {
    throw new Error(`Source country "${sourceCountry}" is not supported.`);
  }

  // --- Standardized on USD ---
  const parsedAmountUSD = parseFloat(amount);
  const convertedAmount = parsedAmountUSD;

  // --- Determine Tax Rate ---
  let taxRate = productType === 'digital' ? destRule.digital_tax_rate : destRule.physical_tax_rate;

  // Apply state-specific US tax rates if applicable
  if (destCountry === 'US' && destState) {
    const stateRates = {
      'CA': 0.0725,
      'NY': 0.088,
      'TX': 0.0625,
      'FL': 0.06,
      'WA': 0.065
    };
    if (stateRates[destState] !== undefined) {
      taxRate = stateRates[destState];
    }
  }

  // Apply reverse charge
  let reverseCharge = false;
  if (destRule.reverse_charge && buyerType === 'B2B') {
    taxRate = 0;
    reverseCharge = true;
  }

  // --- Calculate Tax ---
  const taxAmount = parseFloat((convertedAmount * taxRate).toFixed(2));
  const total = parseFloat((convertedAmount + taxAmount).toFixed(2));
  const corporateTaxRate = sourceRule.corporate_tax_rate || 0.20;
  const corporateTaxAmount = parseFloat((convertedAmount * corporateTaxRate).toFixed(2));
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
 */
export function calculateWhatIf(amount, productType, buyerType) {
  const allRules = getAllRules();
  
  const results = allRules.map(rule => {
    let taxRate = productType === 'digital' ? rule.digital_tax_rate : rule.physical_tax_rate;
    if (rule.reverse_charge && buyerType === 'B2B') {
      taxRate = 0;
    }
    
    const taxAmountUSD = amount * taxRate;
    
    return {
      countryCode: rule.country,
      countryName: rule.name,
      taxRate: taxRate,
      taxRatePercent: `${(taxRate * 100).toFixed(0)}%`,
      taxAmountUSD: taxAmountUSD,
    };
  });

  return results.sort((a, b) => b.taxAmountUSD - a.taxAmountUSD);
}
