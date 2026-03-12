<!--
  +layout.svelte - Root Application Layout

  What this file does:
    Wraps every page in the app with a persistent Navbar at the top.
    Also imports app.css so Tailwind styles apply everywhere.

  How it interacts with the system:
    SvelteKit automatically applies this layout to all child routes.
    The <slot> renders the actual page content.
-->
<script>
  import '../app.css';
  import Navbar from '$lib/components/Navbar.svelte';
</script>

<div class="min-h-screen flex flex-col bg-bg">
  <Navbar />
  <main class="flex-1">
    <slot />
  </main>
</div>
