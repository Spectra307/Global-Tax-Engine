<!--
  dashboard/+page.svelte - Tax Calculator Dashboard Page

  What this file does:
    The main working page of the app.
    Shows TaxForm on the left and ResultCard on the right.
    Saves each successful calculation to history automatically.

  How it interacts with the system:
    - TaxForm emits a "result" event with tax data
    - ResultCard receives and displays the result
    - saveHistory() is called automatically after each calculation
-->
<script>
  import TaxForm from '$lib/components/TaxForm.svelte';
  import ResultCard from '$lib/components/ResultCard.svelte';
  import { saveHistory } from '$lib/api.js';
  import { BarChart3 } from 'lucide-svelte';

  let result = null;

  async function handleResult(event) {
    result = event.detail;
    // Auto-save to history (non-blocking — doesn't affect UI)
    await saveHistory(result);
  }
</script>

<svelte:head>
  <title>Dashboard – Global Tax Engine</title>
</svelte:head>

<!-- Page header -->
<div style="background: linear-gradient(135deg, #6C63FF, #00D9A5)" class="py-10 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center gap-3 mb-2">
      <BarChart3 size={28} color="white" />
      <h1 class="text-3xl font-bold text-white">Tax Calculator</h1>
    </div>
    <p class="text-white/80 text-base ml-11">
      Enter your sale details to instantly calculate international tax obligations.
    </p>
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
</div>
