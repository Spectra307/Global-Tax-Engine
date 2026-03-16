<!--
  ResultCard.svelte - Tax Calculation Result Display (Invoice Preview)
-->
<script>
  import { FileText } from 'lucide-svelte';
  import InvoiceButton from './InvoiceButton.svelte';

  export let result;
</script>

{#if result}
<div class="space-y-4 animate-fade-up">

  <!-- Top Summary -->
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 max-w-2xl mx-auto mb-6">
    
    <!-- Header -->
    <div class="flex justify-between items-start mb-8">
      <div>
        <h2 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span class="text-gray-400 font-normal tracking-wide">{result.countryCode}</span> {result.countryName}
        </h2>
        <p class="text-lg text-gray-400 mt-2 font-medium">
          {result.taxName} · {result.buyerType} · {result.productType}
        </p>
      </div>
      <div class="badge {result.reverseCharge ? 'badge-orange text-[#FF7A18] bg-[#FF7A18]/10' : 'badge-purple'} px-4 py-2">
        {result.reverseCharge ? 'Reverse Charge' : 'Standard Rate'}
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="flex flex-wrap gap-3 mb-8 w-full">
      <div class="flex-1 min-w-max bg-gray-50 rounded-2xl p-3 sm:p-4 text-center flex flex-col justify-center">
        <p class="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-1.5 whitespace-nowrap">Tax Rate</p>
        <p class="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-primary whitespace-nowrap leading-tight tracking-tight">{result.taxRatePercent}</p>
      </div>
      <div class="flex-1 min-w-max bg-gray-50 rounded-2xl p-3 sm:p-4 text-center flex flex-col justify-center">
        <p class="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-1.5 whitespace-nowrap">Tax Amount</p>
        <p class="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-gray-900 whitespace-nowrap leading-tight tracking-tight">${result.taxAmount.toFixed(2)}</p>
      </div>
      <div class="flex-1 min-w-max bg-emerald-50 rounded-2xl p-3 sm:p-4 text-center border border-emerald-100 flex flex-col justify-center">
        <p class="text-xs sm:text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1.5 whitespace-nowrap">Total Price</p>
        <p class="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#00D9A5] whitespace-nowrap leading-tight tracking-tight">${result.total.toFixed(2)}</p>
      </div>
    </div>

    <!-- Progress Bar (Subtotal vs Tax) -->
    <div class="mb-8">
      <div class="flex justify-between text-sm font-medium text-gray-400 mb-3">
        <span>Subtotal</span>
        <span>Tax</span>
      </div>
      <div class="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
        <!-- Subtotal portion -->
        <div class="h-full bg-gradient-to-r from-primary to-indigo-400" style="width: {result.total > 0 ? (result.originalAmount / result.total) * 100 : 0}%"></div>
        <!-- Tax portion -->
        <div class="h-full bg-[#00D9A5]" style="width: {result.total > 0 ? (result.taxAmount / result.total) * 100 : 0}%"></div>
      </div>
    </div>

    <!-- Tax Authority Block -->
    <div class="bg-gray-50 rounded-2xl p-5 flex items-center gap-5 mb-6">
      <div class="w-12 h-12 rounded-xl bg-indigo-100 text-primary flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
      </div>
      <div>
        <p class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Tax Authority</p>
        <p class="text-lg font-bold text-gray-800">{result.authority}</p>
      </div>
    </div>
    
    <!-- Note -->
    <div class="bg-[#F4F6FB] border border-blue-50 rounded-2xl p-5 flex items-start gap-4">
      <div class="text-primary font-bold mt-0.5 text-lg">i</div>
      <p class="text-base text-blue-900">
        {result.countryName} applies {result.taxRatePercent} {result.taxName}. 
        {#if result.reverseCharge} B2B sales use EU reverse charge.{/if}
      </p>
    </div>

  </div>

  <div class="flex items-center gap-2 mb-2">
    <FileText size={20} class="text-gray-400" />
    <h3 class="font-bold text-gray-700">Invoice Preview</h3>
  </div>

  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-lg font-mono text-sm leading-loose">
    
    <!-- Header -->
    <div class="flex justify-between items-center mb-4 font-sans font-bold text-gray-900 border-b border-gray-100 pb-4">
      <span class="tracking-widest">INVOICE</span>
      <span>Global Tax Engine</span>
    </div>

    <!-- Subtotal & Tax details -->
    <div class="flex justify-between text-gray-500">
      <span>Product</span>
      <span class="text-gray-900">Digital Service</span>
    </div>
    <div class="flex justify-between text-gray-500">
      <span>Subtotal</span>
      <span class="text-gray-900">${result.originalAmount.toFixed(2)}</span>
    </div>
    <div class="flex justify-between text-gray-500 mb-4 border-b border-gray-100 pb-4">
      <span>{result.taxName} ({result.taxRatePercent})</span>
      <span class="text-gray-900">${result.taxAmount.toFixed(2)}</span>
    </div>

    <!-- Gross Revenue -->
    <div class="flex justify-between font-bold text-primary mb-6">
      <span>TOTAL (Gross Revenue)</span>
      <span>${result.total.toFixed(2)}</span>
    </div>

    <!-- Deductions -->
    <div class="flex justify-between text-gray-500">
      <span>Tax to Remit</span>
      <span>-${result.taxAmount.toFixed(2)}</span>
    </div>
    <div class="flex justify-between text-gray-500 mb-4 border-b border-gray-100 pb-4">
      <span>Corporate Tax ({result.corporateTaxRatePercent})</span>
      <span>-${result.corporateTaxAmount.toFixed(2)}</span>
    </div>

    <!-- Net Profit -->
    <div class="flex justify-between font-bold" style="color: #00D9A5;">
      <span>NET PROFIT</span>
      <span>${result.netProfit.toFixed(2)}</span>
    </div>

    <!-- Authority Footer -->
    <div class="mt-6 pt-4 text-xs text-gray-400 font-sans">
      Authority: {result.authority}
    </div>

  </div>

  <!-- Action Buttons -->
  <div class="flex gap-3 mt-4">
    <InvoiceButton {result} />
  </div>

</div>
{/if}
