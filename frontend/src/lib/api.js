/**
 * api.js - Frontend API Helper
 *
 * What this file does:
 *   Provides clean functions to call the backend Express API.
 *   Centralizes the API base URL so it's easy to change.
 *
 * How it interacts with the system:
 *   - Used by TaxForm.svelte, InvoiceButton.svelte, and HistoryTable.svelte
 *   - Calls backend running at http://localhost:3001
 */

// Change this to your deployed backend URL in production
const API_BASE = 'http://localhost:3001/api';

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
 * @param {{ amount: number, country: string, productType: string, buyerType: string }} params
 * @returns {object} Tax breakdown result
 */
export async function calculateTax({ amount, country, productType, buyerType }) {
  const res = await fetch(`${API_BASE}/tax`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, country, productType, buyerType })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Tax calculation failed');
  return data;
}

/**
 * Saves a calculation to history.
 * @param {object} record - The tax result object from calculateTax()
 */
export async function saveHistory(record) {
  try {
    await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (e) {
    // Non-critical — don't block the UI if history saving fails
    console.warn('History save failed:', e.message);
  }
}

/**
 * Fetches all calculation history records.
 * @returns {Array} Array of history records
 */
export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/history`);
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
  a.href = url;
  a.download = `tax-invoice-${taxResult.countryCode}-${Date.now()}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Exports a tax result as a JSON file download.
 * @param {object} taxResult - The tax result to export
 */
export function exportJSON(taxResult) {
  const json = JSON.stringify(taxResult, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tax-result-${taxResult.countryCode}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
