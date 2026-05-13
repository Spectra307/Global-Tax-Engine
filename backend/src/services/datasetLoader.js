/**
 * datasetLoader.js - Tax Rules Dataset Loader (Supabase Integrated)
 */
const path = require('path');
const rules = require(path.join(__dirname, '../data/tax_rules.json'));
const supabase = require('./supabaseClient');

/**
 * Returns all tax rules.
 * Attempts Supabase first, falls back to local JSON.
 */
async function getAllRules() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('tax_rules')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Backend: Failed to fetch tax_rules from Supabase:', e.message);
    }
  }

  // Fallback to local JSON
  return rules;
}

/**
 * Finds the tax rule for a specific country.
 * @param {string} countryCode - ISO 2-letter country code, e.g. "DE"
 */
async function getRuleByCountry(countryCode) {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('tax_rules')
        .select('*')
        .eq('country', code)
        .single();

      if (!error && data) {
        return data;
      }
    } catch (e) {
      // Fall through to local
    }
  }

  // Fallback: search the local JSON array
  return rules.find(r => r.country.toUpperCase() === code) || null;
}

module.exports = { getAllRules, getRuleByCountry };
