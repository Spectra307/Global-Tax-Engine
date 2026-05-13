<!--
  dashboard/+page.svelte - Tax Calculator Dashboard Page

  The main working page of the app.
  Shows TaxForm on the left and ResultCard on the right.
  Saves each successful calculation to history automatically.
  Includes CheckoutSimulator panel below.
-->
<script>
  import TaxForm from '$lib/components/TaxForm.svelte';
  import ResultCard from '$lib/components/ResultCard.svelte';
  import WhatIfScenario from '$lib/components/WhatIfScenario.svelte';
  import CheckoutSimulator from '$lib/components/CheckoutSimulator.svelte';
  import { saveHistory, getWhatIfScenario } from '$lib/api.js';
  import { BarChart3, ShoppingCart, TrendingUp } from 'lucide-svelte';

  let result = null;
  let whatIfData = [];

  async function handleResult(event) {
    result = event.detail;
    // Auto-save to history (non-blocking — doesn't affect UI)
    saveHistory(result);

    try {
      whatIfData = await getWhatIfScenario({
        amount: result.originalAmountUSD,
        productType: result.productType,
        buyerType: result.buyerType
      });
    } catch (e) {
      console.error("Failed to load what-if scenario", e);
    }
  }
</script>

<svelte:head>
  <title>Dashboard – Global Tax Engine</title>
</svelte:head>

<!-- Page header -->
<div style="background: linear-gradient(135deg, #6C63FF, #00D9A5)" class="py-10 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <BarChart3 size={28} color="white" />
          <h1 class="text-3xl font-bold text-white">Tax Calculator</h1>
        </div>
        <p class="text-white/80 text-base ml-11">
          Enter your sale details to instantly calculate international tax obligations.
        </p>
      </div>
      <a
        href="/dashboard/analytics"
        class="hidden md:flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/20"
      >
        <TrendingUp size={15} />
        Analytics
      </a>
    </div>
  </div>
</div>

<!-- Main content -->
<div class="max-w-6xl mx-auto px-6 py-10">
  <div class="grid lg:grid-cols-2 gap-8 items-start">

    <!-- Left: Input Form -->
    <div>
      <TaxForm on:result={handleResult} />
    </div>

    <!-- Right: Result or Placeholder -->
    <div>
      {#if result}
        <ResultCard {result} />
        {#if whatIfData.length > 0}
          <WhatIfScenario data={whatIfData} amount={result.originalAmountUSD} productType={result.productType} buyerType={result.buyerType} />
        {/if}
      {:else}
        <!-- Placeholder card shown before first calculation -->
        <div class="card border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-20 text-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <BarChart3 size={28} class="text-gray-400" />
          </div>
          <div>
            <p class="text-gray-500 font-medium">No result yet</p>
            <p class="text-sm text-gray-400 mt-1">Fill in the form and click <strong>Calculate Tax</strong></p>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Quick tips -->
  <div class="mt-8 grid sm:grid-cols-3 gap-4">
    <div class="bg-primary/5 border border-primary/15 rounded-xl p-4 text-sm">
      <p class="font-semibold text-primary mb-1">💡 Reverse Charge</p>
      <p class="text-gray-600">B2B sales to EU businesses often have 0% tax with reverse charge applied.</p>
    </div>
    <div class="bg-secondary/5 border rounded-xl p-4 text-sm" style="border-color: rgba(0,217,165,0.15)">
      <p class="font-semibold mb-1" style="color: #00D9A5">🌍 20 Countries</p>
      <p class="text-gray-600">Covers US, EU nations, UK, Canada, Australia, Japan, India and more.</p>
    </div>
    <div class="bg-accent/5 border rounded-xl p-4 text-sm" style="border-color: rgba(255,122,24,0.15)">
      <p class="font-semibold mb-1" style="color: #FF7A18">📄 PDF Invoices</p>
      <p class="text-gray-600">Generate a professional branded invoice PDF after any calculation.</p>
    </div>
  </div>

  <!-- Checkout Tax Simulator Section -->
  <div class="mt-12">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, #6C63FF, #00D9A5)">
        <ShoppingCart size={18} color="white" />
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-900">Checkout Tax Simulator</h2>
        <p class="text-sm text-gray-500">Preview how tax appears in a customer-facing checkout flow</p>
      </div>
    </div>
    <div class="max-w-lg">
      <CheckoutSimulator />
    </div>
  </div>

</div>
