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
 */
router.get('/countries', async (req, res) => {
  try {
    const rules = await getAllRules();
    const countries = rules.map((rule) => ({
      code: rule.country,
      name: rule.name,
      flag: rule.flag,
      currency: rule.currency,
      taxName: rule.tax_name
    }));
    res.json({ countries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/tax
 */
router.post('/', async (req, res) => {
  try {
    const { amount, sourceCountry, destCountry, productType, buyerType, destState } = req.body;

    if (!amount || !sourceCountry || !destCountry || !productType || !buyerType) {
      return res.status(400).json({
        error: 'Missing required fields: amount, sourceCountry, destCountry, productType, buyerType'
      });
    }

    const result = await calculateTax(
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
 */
router.post('/whatif', async (req, res) => {
  try {
    const { amount, productType, buyerType } = req.body;
    
    if (!amount || !productType || !buyerType) {
      return res.status(400).json({
        error: 'Missing required fields: amount, productType, buyerType'
      });
    }

    const results = await calculateWhatIf(parseFloat(amount), productType, buyerType);
    res.json({ results });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
