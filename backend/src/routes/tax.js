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
const { calculateTax } = require('../services/taxEngine');
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
 *   { amount: number, country: string, productType: string, buyerType: string }
 *
 * Response:
 *   { taxRate, taxAmount, total, authority, taxName, countryName, ... }
 */
router.post('/', (req, res) => {
  try {
    const { amount, country, productType, buyerType } = req.body;

    // Validate that all required fields are present
    if (!amount || !country || !productType || !buyerType) {
      return res.status(400).json({
        error: 'Missing required fields: amount, country, productType, buyerType'
      });
    }

    // Run the tax engine
    const result = calculateTax(
      parseFloat(amount),
      country,
      productType,
      buyerType
    );

    res.json(result);
  } catch (err) {
    // Return a friendly error message to the frontend
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
