<!--
  Navbar.svelte - Top Navigation Bar
  
  What this component does:
    Renders the main navigation header with the GT logo, nav links, and a "Get Started" button.
    Highlights the active page link automatically using SvelteKit's $page store.

  How it interacts with the system:
    Used in the root layout (+layout.svelte) so it appears on every page.
-->
<script>
  import { page } from '$app/stores';
  import { Globe } from 'lucide-svelte';
  
  // Reactive: check which page is currently active
  $: currentPath = $page.url.pathname;
</script>

<nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
  <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

    <!-- Logo -->
    <a href="/" class="flex items-center gap-2.5 group">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
           style="background: linear-gradient(135deg, #6C63FF, #00D9A5)">
        GT
      </div>
      <span class="font-bold text-gray-900 text-lg tracking-tight">Global Tax Engine</span>
    </a>

    <!-- Nav Links (desktop) -->
    <div class="hidden md:flex items-center gap-1">
      <a href="/"
         class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                {currentPath === '/' ? 'text-primary bg-primary/8' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}">
        Home
      </a>
      <a href="/dashboard"
         class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                {currentPath === '/dashboard' ? 'text-primary bg-primary/8' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}">
        Calculator
      </a>
      <a href="/history"
         class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                {currentPath === '/history' ? 'text-primary bg-primary/8' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}">
        History
      </a>
    </div>

    <!-- CTA Button -->
    <a href="/dashboard" class="btn-primary py-2 text-sm">
      Get Started
    </a>
  </div>
</nav>
