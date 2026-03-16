<script>
  import { BarChart3 } from 'lucide-svelte';

  export let data = []; // Array of country breakdown results
  export let amount = 0;
  export let productType = 'digital';
  export let buyerType = 'B2C';

  // Find the max tax amount so we can scale the bars relatively
  $: maxTax = data.length > 0 ? Math.max(...data.map(d => d.taxAmountUSD)) : 0;
</script>

<div class="card animate-fade-up mt-8">
  <div class="mb-6">
    <div class="flex items-center gap-2 mb-1">
      <BarChart3 size={20} class="text-gray-500" />
      <h3 class="font-bold text-gray-900 text-lg">What-If Scenario</h3>
    </div>
    <p class="text-sm text-gray-500">
      Comparing ${amount.toFixed(2)} &middot; {productType} &middot; {buyerType} across countries
    </p>
  </div>

  <div class="space-y-3">
    {#each data as item}
      <div class="flex items-center bg-gray-50/50 rounded-xl p-4 border border-gray-100/50">
        
        <!-- Country Code -->
        <div class="w-12 font-bold text-gray-700 text-sm">
          {item.countryCode}
        </div>
        
        <!-- Country Name and Bar -->
        <div class="flex-1 space-y-2">
          <div class="text-sm font-semibold text-gray-900">{item.countryName}</div>
          
          <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full rounded-full transition-all duration-1000 ease-out"
              style="width: {(item.taxAmountUSD / maxTax) * 100}%; background: #6C63FF;"
            ></div>
          </div>
        </div>

        <!-- Tax Rate & Amount -->
        <div class="w-24 text-right flex flex-col justify-end ml-4">
          <div class="text-xs font-bold" style="color: #6C63FF">{item.taxRatePercent}</div>
          <div class="font-bold text-gray-900">
            <span class="text-xs text-gray-400 font-normal mr-0.5">Tax</span>
            ${item.taxAmountUSD.toFixed(0)}
          </div>
        </div>

      </div>
    {/each}
  </div>
</div>
