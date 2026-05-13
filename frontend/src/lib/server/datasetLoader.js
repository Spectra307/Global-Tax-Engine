/**
 * datasetLoader.js - Tax Rules Dataset Loader (Supabase Integrated)
 *
 * Now attempts to fetch the latest tax rules from the Supabase 'tax_rules' table.
 * Falls back to the local JSON file if Supabase is unavailable or the fetch fails.
 */
import rules from './data/tax_rules.json';
import { supabase } from './supabaseClient.js';

/**
 * Returns all tax rules.
 * Attempts Supabase first, falls back to local JSON.
 */
export async function getAllRules() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('tax_rules')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }
      if (error) console.warn('Supabase tax_rules fetch error:', error.message);
    } catch (e) {
      console.warn('Failed to fetch tax_rules from Supabase:', e.message);
    }
  }

  // Fallback to local JSON
  return rules;
}

/**
 * Finds the tax rule for a specific country.
 * @param {string} countryCode - ISO 2-letter country code, e.g. "DE"
 */
export async function getRuleByCountry(countryCode) {
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
