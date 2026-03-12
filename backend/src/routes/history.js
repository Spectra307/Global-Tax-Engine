/**
 * routes/history.js - Calculation History Routes
 *
 * What this file does:
 *   Provides GET and POST endpoints to store and retrieve calculation history
 *   using Supabase (a free Postgres-as-a-service database).
 *
 * How it interacts with the system:
 *   - Mounted in server.js at /api/history
 *   - Connects to Supabase using environment variables SUPABASE_URL and SUPABASE_ANON_KEY
 *
 * Supabase table required:
 *   tax_history (id, amount, country, country_name, tax_rate, tax_amount, total,
 *                tax_name, buyer_type, product_type, authority, created_at)
 *
 * GET  /api/history    → returns all past calculations (newest first)
 * POST /api/history    → stores a new calculation record
 */

const express = require('express');
const router = express.Router();

// Try to connect to Supabase. If credentials are missing, history will still work
// in memory (so the app doesn't crash during development without credentials).
let supabase = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('your-project-ref')
  ) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase connected successfully.');
  } else {
    console.warn(
      '⚠️  Supabase credentials not set. History will be stored in-memory only.'
    );
  }
} catch (e) {
  console.warn('⚠️  Supabase not available:', e.message);
}

// In-memory fallback for when Supabase is not configured
const inMemoryHistory = [];

/**
 * GET /api/history
 * Returns all calculation history records, newest first.
 */
router.get('/', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('tax_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return res.json({ history: data });
    }

    // Fallback: return in-memory history
    const sorted = [...inMemoryHistory].reverse();
    res.json({ history: sorted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/history
 * Stores a new calculation record.
 *
 * Request body (matches tax engine output):
 *   { amount, country, countryName, taxRate, taxAmount, total, taxName, buyerType, productType, authority }
 */
router.post('/', async (req, res) => {
  try {
    const {
      amount,
      country,
      countryName,
      taxRate,
      taxAmount,
      total,
      taxName,
      buyerType,
      productType,
      authority
    } = req.body;

    const record = {
      amount: parseFloat(amount),
      country,
      country_name: countryName,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      tax_name: taxName,
      buyer_type: buyerType,
      product_type: productType,
      authority,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('tax_history')
        .insert([record])
        .select();
      if (error) throw error;
      return res.status(201).json({ record: data[0] });
    }

    // Fallback: store in memory
    const withId = { id: inMemoryHistory.length + 1, ...record };
    inMemoryHistory.push(withId);
    res.status(201).json({ record: withId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
