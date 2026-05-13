/**
 * api.js - Frontend API Helper
 *
 * What this file does:
 *   Provides clean functions to call the SvelteKit API routes.
 *   Centralizes the API base URL so it's easy to change.
 *
 * How it interacts with the system:
 *   - Used by TaxForm.svelte, InvoiceButton.svelte, HistoryTable.svelte, and CheckoutSimulator.svelte
 *   - Calls SvelteKit routes at /api/*
 */

// Change this to your deployed backend URL in production
const API_BASE = '/api';

/**
 * Fetches all supported countries from the backend.
 * Used to populate the country dropdown in TaxForm.
 */
export async function fetchCountries() {
  const res = await fetch(`${API_BASE}/tax/countries`);
  if (!res.ok) throw new Error('Failed to load countries');
  const data = await res.json();
  return data.countries;
}

/**
 * Calculates tax for a sale.
 * @param {{ amount: number, destCountry: string, sourceCountry: string, productType: string, buyerType: string, destState?: string }} params
 * @returns {object} Tax breakdown result
 */
export async function calculateTax({ amount, destCountry, sourceCountry, productType, buyerType, destState }) {
  const res = await fetch(`${API_BASE}/tax`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, destCountry: destCountry, sourceCountry: sourceCountry, productType, buyerType, destState })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Tax calculation failed');
  return data;
}

/**
 * Saves a calculation to history.
 * Maps the full tax result object to the POST /api/history schema.
 * @param {object} record - The tax result object from calculateTax()
 */
export async function saveHistory(record) {
  try {
    await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: record.originalAmountUSD || record.amount,
        countryCode: record.countryCode,
        country: record.countryCode,       // legacy compat
        countryName: record.countryName,
        taxRate: record.taxRate,
        taxAmount: record.taxAmount,
        total: record.total,
        netProfit: record.netProfit,
        taxName: record.taxName,
        buyerType: record.buyerType,
        productType: record.productType,
        authority: record.authority,
        reverseCharge: record.reverseCharge,
        destState: record.destState || null,
        sourceCountry: record.sourceCountryCode || null
      })
    });
  } catch (e) {
    // Non-critical — don't block the UI if history saving fails
    console.warn('History save failed:', e.message);
  }
}

/**
 * Fetches all calculation history records.
 * @param {object} [filters] - Optional { country, dateFrom, dateTo }
 * @returns {Array} Array of history records
 */
export async function fetchHistory(filters = {}) {
  const params = new URLSearchParams();
  if (filters.country) params.set('country', filters.country);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  const qs = params.toString();
  const res = await fetch(`${API_BASE}/history${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Failed to load history');
  const data = await res.json();
  return data.history;
}

/**
 * Generates and downloads a PDF invoice.
 * @param {object} taxResult - The full tax result object
 */
export async function generateInvoice(taxResult) {
  const res = await fetch(`${API_BASE}/invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taxResult)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Invoice generation failed');
  }
  // Trigger file download in browser
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `tax-invoice-${taxResult.countryCode}-${Date.now()}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Fetches what-if scenario breakdown across all countries.
 */
export async function getWhatIfScenario({ amount, productType, buyerType }) {
  const res = await fetch(`${API_BASE}/tax/whatif`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, productType, buyerType })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'What-If generation failed');
  return data.results;
}

/**
 * Fetches aggregated analytics from the analytics API.
 * @returns {object} Analytics metrics
 */
export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to load analytics');
  return res.json();
}
