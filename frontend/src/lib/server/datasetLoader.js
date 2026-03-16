/**
 * datasetLoader.js - Tax Rules Dataset Loader (SvelteKit ESM Version)
 */
import rules from './data/tax_rules.json';

// Build a lookup map (key = country ISO code, value = rule object)
const rulesMap = {};
rules.forEach((rule) => {
  rulesMap[rule.country.toUpperCase()] = rule;
});

/**
 * Returns all tax rules as an array.
 */
export function getAllRules() {
  return rules;
}

/**
 * Finds the tax rule for a specific country.
 * @param {string} countryCode - ISO 2-letter country code, e.g. "DE"
 * @returns {object|null} The tax rule object, or null if not found
 */
export function getRuleByCountry(countryCode) {
  if (!countryCode) return null;
  return rulesMap[countryCode.toUpperCase()] || null;
}
