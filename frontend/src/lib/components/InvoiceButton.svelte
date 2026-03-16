<!--
  InvoiceButton.svelte - PDF Invoice Download Button

  What this component does:
    A single button that calls the backend to generate a PDF invoice
    and automatically triggers a download in the browser.

  How it interacts with the system:
    - Uses api.js generateInvoice() to call POST /api/invoice
    - Used inside ResultCard.svelte

  Props:
    result {object} - The full tax result returned by the tax engine
-->
<script>
  import { FileText, Loader2 } from 'lucide-svelte';
  import { generateInvoice } from '$lib/api.js';

  export let result;

  let loading = false;
  let error = '';

  async function handleGenerate() {
    loading = true;
    error = '';
    try {
      await generateInvoice(result);
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex flex-col flex-1 gap-1">
  <button
    on:click={handleGenerate}
    disabled={loading}
    class="btn-accent flex-1 justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
  >
    {#if loading}
      <Loader2 size={16} class="animate-spin" />
      Generating...
    {:else}
      <FileText size={16} />
      Download PDF Invoice
    {/if}
  </button>
  {#if error}
    <p class="text-red-500 text-xs text-center">{error}</p>
  {/if}
</div>
