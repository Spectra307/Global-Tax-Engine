<!--
  history/+page.svelte - Calculation History Page

  What this file does:
    Displays all past tax calculations stored in Supabase (or in-memory fallback).
    Shows a table with date, country, amounts, tax, and totals.

  How it interacts with the system:
    - Renders HistoryTable component which calls GET /api/history
    - Linked from Navbar and Dashboard page
-->
<script>
  import HistoryTable from '$lib/components/HistoryTable.svelte';
  import { History, Plus } from 'lucide-svelte';
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
    <a href="/dashboard" class="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 border border-white/20">
      <Plus size={16} />
      New Calculation
    </a>
  </div>
</div>

<!-- Table -->
<div class="max-w-6xl mx-auto px-6 py-10">
  <HistoryTable />
</div>
