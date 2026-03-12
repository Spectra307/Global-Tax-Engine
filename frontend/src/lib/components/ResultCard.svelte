<!--
  ResultCard.svelte - Tax Calculation Result Display

  What this component does:
    Shows the computed tax breakdown after a calculation:
    tax rate, tax amount, total price, and tax authority.
    Also renders action buttons for invoice generation and JSON export.

  How it interacts with the system:
    - Receives the "result" prop from Dashboard page
    - Contains InvoiceButton and export logic
    - Uses api.js for invoice generation and JSON export

  Props:
    result {object} - The full tax breakdown object from the backend
-->
<script>
  import { TrendingUp, Building2, FileText, Download, CheckCircle, AlertCircle } from 'lucide-svelte';
  import InvoiceButton from './InvoiceButton.svelte';
  import { exportJSON } from '$lib/api.js';

  export let result;

  function handleExportJSON() {
    exportJSON(result);
  }
</script>

{#if result}
<div class="card animate-fade-up space-y-6">

  <!-- Header -->
  <div class="flex items-center gap-3">
    <div class="icon-box-mint">
      <CheckCircle size={22} color="white" />
    </div>
    <div>
      <h2 class="text-xl font-bold text-gray-900">Tax Breakdown</h2>
      <p class="text-sm text-gray-500">{result.countryName} · {result.taxName}</p>
    </div>
  </div>

  <!-- Reverse charge notice -->
  {#if result.reverseCharge}
    <div class="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
      <AlertCircle size={16} class="mt-0.5 shrink-0" />
      <span><strong>Reverse Charge Applied</strong> — B2B transaction. The buyer accounts for VAT.</span>
    </div>
  {/if}

  <!-- Stats grid -->
  <div class="grid grid-cols-2 gap-4">

    <!-- Tax Rate -->
    <div class="bg-bg rounded-2xl p-4 border border-gray-100">
      <div class="flex items-center gap-2 mb-1">
        <TrendingUp size={14} class="text-primary" />
        <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Rate</span>
      </div>
      <p class="text-3xl font-bold" style="color: #6C63FF">
        {(result.taxRate * 100).toFixed(1)}%
      </p>
      <p class="text-xs text-gray-400 mt-1">{result.taxName}</p>
    </div>

    <!-- Tax Amount -->
    <div class="bg-bg rounded-2xl p-4 border border-gray-100">
      <div class="flex items-center gap-2 mb-1">
        <FileText size={14} style="color: #FF7A18" />
        <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Amount</span>
      </div>
      <p class="text-3xl font-bold" style="color: #FF7A18">
        {result.currency} {result.taxAmount.toFixed(2)}
      </p>
      <p class="text-xs text-gray-400 mt-1">Added to base price</p>
    </div>

    <!-- Original Amount -->
    <div class="bg-bg rounded-2xl p-4 border border-gray-100">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-xs">💰</span>
        <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</span>
      </div>
      <p class="text-2xl font-bold text-gray-700">
        {result.currency} {result.originalAmount.toFixed(2)}
      </p>
      <p class="text-xs text-gray-400 mt-1">Before tax</p>
    </div>

    <!-- Total -->
    <div class="rounded-2xl p-4 border-2" style="background: linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,217,165,0.08)); border-color: rgba(108,99,255,0.2)">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-xs">✅</span>
        <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</span>
      </div>
      <p class="text-2xl font-bold gradient-text">
        {result.currency} {result.total.toFixed(2)}
      </p>
      <p class="text-xs text-gray-400 mt-1">Buyer pays</p>
    </div>
  </div>

  <!-- Tax Authority -->
  <div class="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
    <Building2 size={18} class="text-gray-400 shrink-0 mt-0.5" />
    <div>
      <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">Tax Authority</p>
      <p class="text-sm font-semibold text-gray-800">{result.authority}</p>
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="flex gap-3">
    <InvoiceButton {result} />
    <button
      on:click={handleExportJSON}
      class="btn-ghost flex-1 justify-center py-3"
    >
      <Download size={16} />
      Export JSON
    </button>
  </div>

</div>
{/if}
