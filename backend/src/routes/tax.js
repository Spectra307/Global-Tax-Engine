/**
 * routes/tax.js - Tax Calculation Route
 *
 * What this file does:
 *   Defines the POST /api/tax endpoint. Receives sale details, runs the tax engine,
 *   and returns the full tax breakdown.
 *
 * How it interacts with the system:
 *   - Mounted in server.js at /api/tax
 *   - Calls taxEngine.js to perform the actual calculation
 *
 * GET /api/tax/countries → returns list of all supported countries (for the dropdown)
 * POST /api/tax         → calculates tax for a given sale
 */

const express = require('express');
const router = express.Router();
const { calculateTax, calculateWhatIf } = require('../services/taxEngine');
const { getAllRules } = require('../services/datasetLoader');

/**
 * GET /api/tax/countries
 * Returns all supported countries with their basic info.
 * Used by the frontend to populate the country dropdown.
 */
router.get('/countries', (req, res) => {
  const countries = getAllRules().map((rule) => ({
    code: rule.country,
    name: rule.name,
    flag: rule.flag,
    currency: rule.currency,
    taxName: rule.tax_name
  }));
  res.json({ countries });
});

/**
 * POST /api/tax
 * Calculates tax for a cross-border sale.
 *
 * Request body:
 *   { amount: number, sourceCountry: string, destCountry: string, productType: string, buyerType: string }
 */
router.post('/', (req, res) => {
  try {
    const { amount, sourceCountry, destCountry, productType, buyerType, destState } = req.body;

    if (!amount || !sourceCountry || !destCountry || !productType || !buyerType) {
      return res.status(400).json({
        error: 'Missing required fields: amount, sourceCountry, destCountry, productType, buyerType'
      });
    }

    const result = calculateTax(
      parseFloat(amount),
      destCountry,
      sourceCountry,
      productType,
      buyerType,
      destState
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/tax/whatif
 * Calculates what-if taxation for all countries
 */
router.post('/whatif', (req, res) => {
  try {
    const { amount, productType, buyerType } = req.body;
    
    if (!amount || !productType || !buyerType) {
      return res.status(400).json({
        error: 'Missing required fields: amount, productType, buyerType'
      });
    }

    const results = calculateWhatIf(parseFloat(amount), productType, buyerType);
    res.json({ results });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
