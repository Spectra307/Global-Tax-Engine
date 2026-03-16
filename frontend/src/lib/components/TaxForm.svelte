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

  let amount = '';
  let productType = 'digital';
  let destCountry = '';
  let destState = '';
  let sourceCountry = '';
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
      if (countries.length > 0) {
        destCountry = countries[0].code;
        sourceCountry = countries[0].code;
      }
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
    if (destCountry === 'US' && !destState) {
      error = 'Please select a US State.';
      return;
    }
    loading = true;
    try {
      const result = await calculateTax({ amount: parseFloat(amount), destCountry, sourceCountry, productType, buyerType, destState });
      dispatch('result', { ...result, productType, buyerType });
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
    <fieldset class="border-0 p-0 m-0 min-w-0">
      <legend class="form-label">Product Type</legend>
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
    </fieldset>

    <!-- Location Routing -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Source Country -->
      <div>
        <label for="sourceCountry" class="form-label">Source Country</label>
        {#if loadingCountries}
          <div class="form-input flex items-center gap-2 text-gray-400">
            <Loader2 size={16} class="animate-spin" /> Loading...
          </div>
        {:else}
          <select id="sourceCountry" bind:value={sourceCountry} class="form-input">
            {#each countries as c}
              <option value={c.code}>{c.flag} {c.name}</option>
            {/each}
          </select>
        {/if}
      </div>

    <!-- Buyer Country -->
      <div>
        <label for="destCountry" class="form-label">Buyer Country</label>
        {#if loadingCountries}
          <div class="form-input flex items-center gap-2 text-gray-400">
            <Loader2 size={16} class="animate-spin" /> Loading...
          </div>
        {:else}
          <select id="destCountry" bind:value={destCountry} class="form-input" on:change={() => destState = ''}>
            {#each countries as c}
              <option value={c.code}>{c.flag} {c.name}</option>
            {/each}
          </select>
        {/if}
      </div>
    </div>

    <!-- US State Dropdown -->
    {#if destCountry === 'US'}
    <div class="animate-fade-in mt-4">
      <div class="flex items-center gap-2 mb-1.5">
        <label for="destState" class="form-label mb-0">US State</label>
        <span class="text-xs font-semibold text-[#FF7A18] bg-[#FF7A18]/10 px-2 py-0.5 rounded-full">Required for USA</span>
      </div>
      <select id="destState" bind:value={destState} class="form-input">
        <option value="" disabled selected>— Select a state —</option>
        <option value="CA">California (7.25%)</option>
        <option value="NY">New York (8.80%)</option>
        <option value="TX">Texas (6.25%)</option>
        <option value="FL">Florida (6.00%)</option>
        <option value="WA">Washington (6.50%)</option>
      </select>
    </div>
    {/if}

    <!-- Buyer Type -->
    <fieldset class="border-0 p-0 m-0 min-w-0">
      <legend class="flex items-center gap-2 mb-1.5">
        <span class="form-label mb-0">Buyer Type</span>
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
      </legend>
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
    </fieldset>

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
