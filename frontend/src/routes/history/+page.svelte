<!--
  history/+page.svelte - Calculation History Page

  Displays all past tax calculations stored in Supabase (or in-memory fallback).
  Now includes country filter, date filter, and CSV export.
-->
<script>
  import HistoryTable from '$lib/components/HistoryTable.svelte';
  import { History, Plus, Download, Filter } from 'lucide-svelte';
  import { fetchCountries } from '$lib/api.js';
  import { onMount } from 'svelte';

  let countries = [];
  let filterCountry = '';
  let filterDateFrom = '';
  let filterDateTo = '';
  let showFilters = false;

  onMount(async () => {
    try {
      countries = await fetchCountries();
    } catch {}
  });

  function downloadReport() {
    const params = new URLSearchParams();
    if (filterCountry) params.set('country', filterCountry);
    if (filterDateFrom) params.set('dateFrom', filterDateFrom);
    if (filterDateTo) params.set('dateTo', filterDateTo);
    window.location.href = `/api/reports?${params.toString()}`;
  }

  // Reactive filter object passed to HistoryTable
  $: filters = {
    country: filterCountry || null,
    dateFrom: filterDateFrom || null,
    dateTo: filterDateTo || null
  };
</script>

<svelte:head>
  <title>History – Global Tax Engine</title>
</svelte:head>

<!-- Page header -->
<div style="background: linear-gradient(135deg, #00D9A5, #6C63FF)" class="py-10 px-6">
  <div class="max-w-6xl mx-auto flex items-center justify-between">
    <div>
      <div class="flex items-center gap-3 mb-2">
        <History size={28} color="white" />
        <h1 class="text-3xl font-bold text-white">Calculation History</h1>
      </div>
      <p class="text-white/80 text-base ml-11">
        All your past tax calculations in one place.
      </p>
    </div>
    <div class="flex gap-3">
      <button
        on:click={() => showFilters = !showFilters}
        class="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/20"
      >
        <Filter size={15} />
        Filters
      </button>
      <button
        on:click={downloadReport}
        class="flex items-center gap-2 bg-white text-primary px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-gray-100"
      >
        <Download size={15} />
        Export CSV
      </button>
      <a href="/dashboard" class="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 border border-white/20">
        <Plus size={16} />
        New Calculation
      </a>
    </div>
  </div>
</div>

<!-- Filters Panel -->
{#if showFilters}
<div class="bg-gray-50 border-b border-gray-200 px-6 py-4 animate-fade-in">
  <div class="max-w-6xl mx-auto">
    <div class="grid sm:grid-cols-3 gap-4">
      <!-- Country Filter -->
      <div>
        <label for="hist-country" class="form-label">Filter by Country</label>
        <select id="hist-country" bind:value={filterCountry} class="form-input">
          <option value="">All Countries</option>
          {#each countries as c}
            <option value={c.code}>{c.flag} {c.name}</option>
          {/each}
        </select>
      </div>
      <!-- Date From -->
      <div>
        <label for="hist-date-from" class="form-label">Date From</label>
        <input id="hist-date-from" type="date" bind:value={filterDateFrom} class="form-input" />
      </div>
      <!-- Date To -->
      <div>
        <label for="hist-date-to" class="form-label">Date To</label>
        <input id="hist-date-to" type="date" bind:value={filterDateTo} class="form-input" />
      </div>
    </div>
    <div class="mt-3 flex gap-3">
      <button
        on:click={() => { filterCountry = ''; filterDateFrom = ''; filterDateTo = ''; }}
        class="text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  </div>
</div>
{/if}

<!-- Table -->
<div class="max-w-6xl mx-auto px-6 py-10">
  <HistoryTable {filters} />
</div>
