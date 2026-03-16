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

