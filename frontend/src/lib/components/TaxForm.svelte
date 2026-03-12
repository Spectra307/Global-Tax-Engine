<!--
  TaxForm.svelte - Tax Calculation Input Form

  What this component does:
    Renders the main form with fields for: sale amount, product type, buyer country,
    and buyer type. Submits to the backend /api/tax and emits the result upward.

  How it interacts with the system:
    - Uses api.js to fetch countries and call the tax endpoint
    - Emits a "result" event with the tax breakdown data
    - Used on the Dashboard page (/dashboard/+page.svelte)

  Props:
    none

  Events:
    result → { taxRate, taxAmount, total, authority, ... } (the full tax breakdown)
-->
<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { Calculator, ChevronDown, Info, Loader2 } from 'lucide-svelte';
  import { fetchCountries, calculateTax } from '$lib/api.js';

  const dispatch = createEventDispatcher();

  // Form state
  let amount = '';
  let productType = 'digital';
  let country = '';
  let buyerType = 'B2C';

  // UI state
  let countries = [];
  let loading = false;
  let loadingCountries = true;
  let error = '';

  // Tooltip visibility
  let showTooltip = false;

  // Load countries on mount
  onMount(async () => {
    try {
      countries = await fetchCountries();
      if (countries.length > 0) country = countries[0].code;
    } catch (e) {
      error = 'Failed to load countries. Is the backend running?';
    } finally {
      loadingCountries = false;
    }
  });

  async function handleSubmit() {
    error = '';
    if (!amount || parseFloat(amount) <= 0) {
      error = 'Please enter a valid sale amount greater than 0.';
      return;
    }
    loading = true;
    try {
      const result = await calculateTax({ amount: parseFloat(amount), country, productType, buyerType });
      dispatch('result', result);
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="card animate-fade-up">
  <div class="flex items-center gap-3 mb-6">
    <div class="icon-box-purple">
      <Calculator size={22} color="white" />
    </div>
    <div>
      <h2 class="text-xl font-bold text-gray-900">Tax Calculator</h2>
      <p class="text-sm text-gray-500">Fill in your sale details below</p>
    </div>
  </div>

  <form on:submit|preventDefault={handleSubmit} class="space-y-5">

    <!-- Sale Amount -->
    <div>
      <label for="amount" class="form-label">Sale Amount</label>
      <div class="relative">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
        <input
          id="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          bind:value={amount}
          class="form-input pl-8"
          required
        />
      </div>
    </div>

    <!-- Product Type -->
    <div>
      <label class="form-label">Product Type</label>
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          on:click={() => productType = 'digital'}
          class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150
                 {productType === 'digital' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
        >
          💻 Digital
        </button>
        <button
          type="button"
          on:click={() => productType = 'physical'}
          class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150
                 {productType === 'physical' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
        >
          📦 Physical
        </button>
      </div>
    </div>

    <!-- Buyer Country -->
    <div>
      <label for="country" class="form-label">Buyer Country</label>
      {#if loadingCountries}
        <div class="form-input flex items-center gap-2 text-gray-400">
          <Loader2 size={16} class="animate-spin" /> Loading countries...
        </div>
      {:else}
        <select id="country" bind:value={country} class="form-input">
          {#each countries as c}
            <option value={c.code}>{c.flag} {c.name} ({c.taxName})</option>
          {/each}
        </select>
      {/if}
    </div>

    <!-- Buyer Type -->
    <div>
      <div class="flex items-center gap-2 mb-1.5">
        <label class="form-label mb-0">Buyer Type</label>
        <!-- Tooltip trigger -->
        <button
          type="button"
          class="text-gray-400 hover:text-primary transition-colors"
          on:mouseenter={() => showTooltip = true}
          on:mouseleave={() => showTooltip = false}
          aria-label="Learn about buyer types"
        >
          <Info size={14} />
        </button>
        {#if showTooltip}
          <div class="absolute z-10 mt-8 max-w-xs bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl animate-fade-in">
            <strong>B2B (Business to Business):</strong> If the buyer is a registered business,
            reverse charge may apply — meaning 0% tax is charged and the buyer accounts for VAT.
            <br/><br/>
            <strong>B2C (Business to Consumer):</strong> Standard tax rate always applies.
          </div>
        {/if}
      </div>
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          on:click={() => buyerType = 'B2C'}
          class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150
                 {buyerType === 'B2C' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
          style={buyerType === 'B2C' ? 'border-color: #00D9A5; color: #00D9A5; background: rgba(0,217,165,0.05)' : ''}
        >
          👤 B2C Consumer
        </button>
        <button
          type="button"
          on:click={() => buyerType = 'B2B'}
          class="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-150
                 {buyerType === 'B2B' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
        >
          🏢 B2B Business
        </button>
      </div>
    </div>

    <!-- Error message -->
    {#if error}
      <div class="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 animate-fade-in">
        <span class="mt-0.5">⚠️</span>
        <span>{error}</span>
      </div>
    {/if}

    <!-- Submit Button -->
    <button
      type="submit"
      disabled={loading || loadingCountries}
      class="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
    >
      {#if loading}
        <Loader2 size={18} class="animate-spin" />
        Calculating...
      {:else}
        <Calculator size={18} />
        Calculate Tax
      {/if}
    </button>

  </form>
</div>
