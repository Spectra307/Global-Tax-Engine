<!--
  HistoryTable.svelte - Calculation History Table

  What this component does:
    Fetches and displays all previous tax calculations from the backend.
    Shows a table with Date, Country, Amount, Tax, and Total columns.

  How it interacts with the system:
    - Uses api.js fetchHistory() to GET /api/history
    - Used on the History page (/history/+page.svelte)
-->
<script>
  import { onMount } from 'svelte';
  import { History, RefreshCw, Loader2 } from 'lucide-svelte';
  import { fetchHistory } from '$lib/api.js';

  let records = [];
  let loading = true;
  let error = '';

  async function loadHistory() {
    loading = true;
    error = '';
    try {
      records = await fetchHistory();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  onMount(loadHistory);

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function formatMoney(n, currency = '') {
    return `${currency} ${parseFloat(n).toFixed(2)}`.trim();
  }
</script>

<div class="card">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <div class="icon-box-purple">
        <History size={22} color="white" />
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-900">Calculation History</h2>
        <p class="text-sm text-gray-500">{records.length} records found</p>
      </div>
    </div>
    <button on:click={loadHistory} class="btn-ghost py-2 text-sm" aria-label="Refresh history">
      <RefreshCw size={15} class={loading ? 'animate-spin' : ''} />
      Refresh
    </button>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-16 text-gray-400 gap-3">
      <Loader2 size={24} class="animate-spin" />
      <span>Loading history...</span>
    </div>

  {:else if error}
    <div class="text-center py-16">
      <p class="text-red-500 mb-2">⚠️ {error}</p>
      <p class="text-sm text-gray-400">Make sure the backend is running.</p>
    </div>

  {:else if records.length === 0}
    <div class="text-center py-16">
      <div class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gray-100">
        <History size={28} class="text-gray-400" />
      </div>
      <p class="text-gray-500 font-medium">No calculations yet</p>
      <p class="text-sm text-gray-400 mt-1">Go to the <a href="/dashboard" class="text-primary hover:underline">Calculator</a> to get started.</p>
    </div>

  {:else}
    <div class="overflow-x-auto rounded-xl border border-gray-100">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tax</th>
            <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
            <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          {#each records as row, i}
            <tr class="hover:bg-gray-50/60 transition-colors duration-100 animate-fade-in" style="animation-delay: {i * 30}ms">
              <td class="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">{formatDate(row.created_at)}</td>
              <td class="px-4 py-3.5">
                <span class="font-medium text-gray-800">{row.country_name || row.country}</span>
                <span class="text-gray-400 ml-1">({row.country})</span>
              </td>
              <td class="px-4 py-3.5">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                             {row.buyer_type === 'B2B' ? 'bg-primary/10 text-primary' : 'bg-secondary/10'}">
                  {row.buyer_type} · {row.product_type}
                </span>
              </td>
              <td class="px-4 py-3.5 text-right font-medium text-gray-800">{formatMoney(row.amount)}</td>
              <td class="px-4 py-3.5 text-right" style="color: #FF7A18; font-weight: 600">
                {formatMoney(row.tax_amount)}
              </td>
              <td class="px-4 py-3.5 text-right">
                <span class="font-bold gradient-text">{formatMoney(row.total)}</span>
              </td>
              <td class="px-4 py-3.5 text-center">
                <span class="font-semibold" style="color: #6C63FF">
                  {(parseFloat(row.tax_rate) * 100).toFixed(1)}%
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
