/**
 * datasetLoader.js - Tax Rules Dataset Loader
 *
 * What this file does:
 *   Loads the tax_rules.json file once and provides a fast lookup function
 *   so we can find tax rules for any country by its ISO code (e.g. "DE", "US").
 *
 * How it interacts with the system:
 *   - Used by taxEngine.js to find country-specific tax rules.
 *
 * Key functions:
 *   - getAllRules()  → returns the full list of tax rules
 *   - getRuleByCountry(countryCode) → finds the tax rule for one country
 */

const path = require('path');
const rules = require(path.join(__dirname, '../data/tax_rules.json'));

// Build a lookup map (key = country ISO code, value = rule object)
// This makes lookups O(1) instead of searching the array every time
const rulesMap = {};
rules.forEach((rule) => {
  rulesMap[rule.country.toUpperCase()] = rule;
});

/**
 * Returns all tax rules as an array.
 * Useful for populating the country dropdown in the frontend.
 */
function getAllRules() {
  return rules;
}

/**
 * Finds the tax rule for a specific country.
 * @param {string} countryCode - ISO 2-letter country code, e.g. "DE"
 * @returns {object|null} The tax rule object, or null if not found
 */
function getRuleByCountry(countryCode) {
  if (!countryCode) return null;
  return rulesMap[countryCode.toUpperCase()] || null;
}

module.exports = { getAllRules, getRuleByCountry };
