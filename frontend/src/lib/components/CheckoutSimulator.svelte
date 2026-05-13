<!--
  CheckoutSimulator.svelte - Checkout Tax Simulator

  Simulates how tax would appear in a real checkout flow.
  Visually resembles a Stripe-style checkout summary card.

  Props:
    none (self-contained, uses /api/tax internally)
-->
<script>
  import { onMount } from 'svelte';
  import { ShoppingCart, Loader2, ChevronDown } from 'lucide-svelte';
  import { fetchCountries } from '$lib/api.js';

  // Inputs
  let price = '';
  let destCountry = 'DE';
  let destState = '';
  let productType = 'digital';

  // Result
  let result = null;
  let loading = false;
  let error = '';
  let countries = [];

  onMount(async () => {
    try {
      countries = await fetchCountries();
      if (countries.length > 0) destCountry = countries[0].code;
    } catch (e) {
      console.warn('Could not load countries', e);
    }
  });

  async function simulate() {
    if (!price || parseFloat(price) <= 0) {
      error = 'Enter a valid price.';
      return;
    }
    error = '';
    loading = true;
    result = null;
    try {
      const res = await fetch('/api/tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(price),
          destCountry,
          destState: destState || null,
          sourceCountry: 'US',
          productType,
          buyerType: 'B2C'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Simulation failed');
      result = data;
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">

  <!-- Header -->
  <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
    <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg,#6C63FF,#00D9A5)">
      <ShoppingCart size={18} color="white" />
    </div>
    <div>
      <h3 class="font-bold text-gray-900">Checkout Tax Simulator</h3>
      <p class="text-xs text-gray-500">See how tax appears to your customer at checkout</p>
    </div>
  </div>

  <div class="p-6">
    <!-- Inputs -->
    <div class="grid sm:grid-cols-2 gap-4 mb-5">

      <!-- Price -->
      <div class="sm:col-span-2">
        <label for="sim-price" class="form-label">Product Price (USD)</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-base">$</span>
          <input
            id="sim-price"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="99.00"
            bind:value={price}
            on:input={simulate}
            class="form-input pl-8"
          />
        </div>
      </div>

      <!-- Destination Country -->
      <div>
        <label for="sim-dest-country" class="form-label">Destination Country</label>
        <select id="sim-dest-country" bind:value={destCountry} on:change={() => { destState = ''; simulate(); }} class="form-input">
          {#each countries as c}
            <option value={c.code}>{c.flag} {c.name}</option>
          {/each}
        </select>
      </div>

      <!-- Product Type -->
      <div>
        <label for="sim-product-type" class="form-label">Product Type</label>
        <select id="sim-product-type" bind:value={productType} on:change={simulate} class="form-input">
          <option value="digital">💻 Digital Service</option>
          <option value="physical">📦 Physical Product</option>
        </select>
      </div>

      <!-- US State (conditional) -->
      {#if destCountry === 'US'}
      <div class="sm:col-span-2 animate-fade-in">
        <label for="sim-dest-state" class="form-label">US State</label>
        <select id="sim-dest-state" bind:value={destState} on:change={simulate} class="form-input">
          <option value="" disabled selected>— Select state —</option>
          <option value="CA">California (7.25%)</option>
          <option value="NY">New York (8.80%)</option>
          <option value="TX">Texas (6.25%)</option>
          <option value="FL">Florida (6.00%)</option>
          <option value="WA">Washington (6.50%)</option>
        </select>
      </div>
      {/if}
    </div>

    <!-- Error -->
    {#if error}
      <p class="text-sm text-red-500 mb-4">⚠️ {error}</p>
    {/if}

    <!-- Simulate Button -->
    <button
      on:click={simulate}
      disabled={loading}
      class="btn-primary w-full justify-center mb-6 py-3 disabled:opacity-60"
    >
      {#if loading}
        <Loader2 size={16} class="animate-spin" /> Simulating...
      {:else}
        <ShoppingCart size={16} /> Simulate Checkout
      {/if}
    </button>

    <!-- Checkout Summary Card -->
    {#if result}
    <div class="rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden animate-fade-up">

      <!-- Checkout Header -->
      <div class="px-5 py-3 bg-gray-50 border-b border-gray-200">
        <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Order Summary</p>
      </div>

      <div class="px-5 py-4 space-y-3">

        <!-- Line items -->
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">{productType === 'digital' ? 'Digital Product' : 'Physical Product'}</span>
          <span class="font-medium text-gray-900">${parseFloat(price).toFixed(2)}</span>
        </div>

        <div class="flex justify-between text-sm">
          <span class="text-gray-500 flex items-center gap-1.5">
            {result.taxName}
            <span class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">
              {result.taxRatePercent}
            </span>
          </span>
          <span class="font-medium" style="color:#FF7A18">
            {result.reverseCharge ? 'Reverse Charge' : `+$${result.taxAmount.toFixed(2)}`}
          </span>
        </div>

        <div class="border-t border-gray-100 pt-3">
          <div class="flex justify-between">
            <span class="font-bold text-gray-900">Total</span>
            <span class="text-xl font-extrabold" style="color:#6C63FF">${result.total.toFixed(2)}</span>
          </div>
        </div>

      </div>

      <!-- Tax Authority footer -->
      <div class="px-5 py-3 bg-gray-50 border-t border-gray-200">
        <p class="text-xs text-gray-400">
          <span class="font-semibold text-gray-600">Authority:</span> {result.authority}
        </p>
        {#if result.reverseCharge}
          <p class="text-xs text-amber-600 mt-1">⚡ Reverse charge applies — buyer accounts for VAT</p>
        {/if}
      </div>
    </div>
    {/if}

  </div>
</div>
