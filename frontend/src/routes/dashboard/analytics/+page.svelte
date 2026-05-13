<!--
  dashboard/analytics/+page.svelte - Analytics Dashboard Page

  Shows business insights based on stored tax_calculations.
  Metrics: Total Revenue, Tax Collected, Net Profit, Top Country.
  Charts rendered with Chart.js.
-->
<script>
  import { onMount } from 'svelte';
  import { BarChart3, TrendingUp, DollarSign, Globe, Download, RefreshCw, Loader2 } from 'lucide-svelte';

  let analytics = null;
  let loading = true;
  let err = '';
  let chartReady = false;

  let revenueChart = null;
  let countryChart = null;

  async function loadAnalytics() {
    loading = true;
    err = '';
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      analytics = data.analytics;
      if (data.demo) {
        err = 'Supabase not configured — showing demo state. Connect Supabase to see live metrics.';
      }
    } catch (e) {
      err = e.message;
    } finally {
      loading = false;
    }
  }

  function fmt(n) {
    return parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function downloadReport() {
    window.location.href = '/api/reports';
  }

  onMount(async () => {
    await loadAnalytics();

    // Dynamically import Chart.js from CDN
    if (!window.Chart) {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    chartReady = true;
    renderCharts();
  });

  function renderCharts() {
    if (!analytics || !chartReady || !window.Chart) return;

    // Trend chart
    const trendCanvas = document.getElementById('trendChart');
    if (trendCanvas && analytics.recentTrend?.length > 0) {
      if (revenueChart) revenueChart.destroy();
      revenueChart = new window.Chart(trendCanvas, {
        type: 'bar',
        data: {
          labels: analytics.recentTrend.map(d => d.date),
          datasets: [
            {
              label: 'Revenue (USD)',
              data: analytics.recentTrend.map(d => d.revenue),
              backgroundColor: 'rgba(108, 99, 255, 0.7)',
              borderRadius: 6
            },
            {
              label: 'Tax (USD)',
              data: analytics.recentTrend.map(d => d.tax),
              backgroundColor: 'rgba(0, 217, 165, 0.7)',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Country breakdown doughnut chart
    const countryCanvas = document.getElementById('countryChart');
    if (countryCanvas && analytics.countryBreakdown?.length > 0) {
      if (countryChart) countryChart.destroy();
      const palette = [
        '#6C63FF','#00D9A5','#FF7A18','#3B82F6','#EC4899',
        '#F59E0B','#10B981','#8B5CF6','#EF4444','#14B8A6'
      ];
      countryChart = new window.Chart(countryCanvas, {
        type: 'doughnut',
        data: {
          labels: analytics.countryBreakdown.map(c => c.country_name || c.country),
          datasets: [{
            data: analytics.countryBreakdown.map(c => c.count),
            backgroundColor: palette,
            borderWidth: 0,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 16 } } },
          cutout: '65%'
        }
      });
    }
  }

  // Re-render charts when analytics data changes
  $: if (analytics && chartReady) {
    // Give DOM time to update
    setTimeout(renderCharts, 100);
  }
</script>

<svelte:head>
  <title>Analytics – Global Tax Engine</title>
</svelte:head>

<!-- Page Header -->
<div style="background: linear-gradient(135deg, #6C63FF, #FF7A18)" class="py-10 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <TrendingUp size={28} color="white" />
          <h1 class="text-3xl font-bold text-white">Analytics Dashboard</h1>
        </div>
        <p class="text-white/80 text-base ml-11">
          Business insights from your tax calculation history.
        </p>
      </div>
      <div class="flex gap-3">
        <button
          on:click={loadAnalytics}
          class="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/20"
        >
          <RefreshCw size={15} class={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
        <button
          on:click={downloadReport}
          class="flex items-center gap-2 bg-white text-primary px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-gray-100"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>
    </div>
  </div>
</div>

<div class="max-w-6xl mx-auto px-6 py-10">

  <!-- Notice -->
  {#if err}
    <div class="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
      <span class="mt-0.5">⚠️</span>
      <span>{err}</span>
    </div>
  {/if}

  {#if loading}
    <div class="flex items-center justify-center py-24 text-gray-400 gap-3">
      <Loader2 size={28} class="animate-spin" />
      <span class="text-lg">Loading analytics...</span>
    </div>
  {:else if analytics}

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

      <!-- Total Revenue -->
      <div class="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</p>
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(108,99,255,0.12)">
            <DollarSign size={18} style="color:#6C63FF" />
          </div>
        </div>
        <p class="text-3xl font-extrabold text-gray-900">${fmt(analytics.totalRevenue)}</p>
        <p class="text-xs text-gray-400 mt-2">{analytics.totalTransactions} transactions</p>
      </div>

      <!-- Tax Collected -->
      <div class="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tax Collected</p>
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(255,122,24,0.12)">
            <BarChart3 size={18} style="color:#FF7A18" />
          </div>
        </div>
        <p class="text-3xl font-extrabold text-gray-900">${fmt(analytics.totalTaxCollected)}</p>
        <p class="text-xs text-gray-400 mt-2">Across all jurisdictions</p>
      </div>

      <!-- Net Profit -->
      <div class="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Net Profit</p>
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(0,217,165,0.12)">
            <TrendingUp size={18} style="color:#00D9A5" />
          </div>
        </div>
        <p class="text-3xl font-extrabold" style="color:#00D9A5">${fmt(analytics.totalNetProfit)}</p>
        <p class="text-xs text-gray-400 mt-2">After corporate tax</p>
      </div>

      <!-- Top Country -->
      <div class="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Top Market</p>
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(59,130,246,0.12)">
            <Globe size={18} style="color:#3B82F6" />
          </div>
        </div>
        <p class="text-2xl font-extrabold text-gray-900">{analytics.topCountry?.country_name || 'N/A'}</p>
        <p class="text-xs text-gray-400 mt-2">{analytics.topCountry?.count || 0} transactions</p>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid lg:grid-cols-3 gap-6 mb-8">

      <!-- Revenue Trend Chart (spans 2 cols) -->
      <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Revenue &amp; Tax Trend</h2>
            <p class="text-sm text-gray-500">Last 7 days</p>
          </div>
        </div>
        {#if analytics.recentTrend?.length > 0}
          <div style="height: 220px; position: relative;">
            <canvas id="trendChart"></canvas>
          </div>
        {:else}
          <div class="h-48 flex items-center justify-center text-gray-400 text-sm flex-col gap-2">
            <BarChart3 size={32} class="opacity-30" />
            <p>No data yet — run calculations to see trends.</p>
          </div>
        {/if}
      </div>

      <!-- Country Doughnut Chart -->
      <div class="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
        <div class="mb-5">
          <h2 class="text-lg font-bold text-gray-900">Top Markets</h2>
          <p class="text-sm text-gray-500">By transaction volume</p>
        </div>
        {#if analytics.countryBreakdown?.length > 0}
          <div style="height: 220px; position: relative;">
            <canvas id="countryChart"></canvas>
          </div>
        {:else}
          <div class="h-48 flex items-center justify-center text-gray-400 text-sm flex-col gap-2">
            <Globe size={32} class="opacity-30" />
            <p>No country data yet.</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Country Breakdown Table -->
    {#if analytics.countryBreakdown?.length > 0}
    <div class="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-100">
        <h2 class="text-lg font-bold text-gray-900">Country Breakdown</h2>
        <p class="text-sm text-gray-500">Transaction volume by destination market</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</th>
              <th class="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transactions</th>
              <th class="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Share</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            {#each analytics.countryBreakdown as row, i}
              <tr class="hover:bg-gray-50/60 transition-colors">
                <td class="px-5 py-3.5 font-medium text-gray-800">
                  <span class="text-gray-400 mr-2 text-xs font-mono">{row.country}</span>{row.country_name || row.country}
                </td>
                <td class="px-5 py-3.5 text-right font-semibold" style="color:#6C63FF">{row.count}</td>
                <td class="px-5 py-3.5 text-right text-gray-500">
                  {analytics.totalTransactions > 0 ? ((row.count / analytics.totalTransactions) * 100).toFixed(1) : '0.0'}%
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    {/if}

  {/if}
</div>
