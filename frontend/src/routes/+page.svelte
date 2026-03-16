<!--
  +page.svelte - Landing Page (/)

  What this file does:
    The public-facing landing page for Global Tax Engine.
    Matches the uploaded screenshots exactly.

  Sections:
    1. Hero  – headline, CTA buttons
    2. Stats bar  – 15+ Countries, 95% Accuracy, Instant Calculation
    3. Features  – 3 feature cards
    4. How it works  – 3 numbered steps
    5. Footer  – links and copyright

  How it interacts with the system:
    Uses Lucide-Svelte icons and links to /dashboard and /history.
-->
<script>
  import {
    ArrowRight,
    BookOpen,
    Calculator,
    Globe,
    FileText,
    ChevronRight,
    BarChart3,
  } from "lucide-svelte";
</script>

<svelte:head>
  <title>Global Tax Engine – Calculate International Taxes Instantly</title>
</svelte:head>

<!-- ── HERO ──────────────────────────────────────────────────────────── -->
<section class="relative overflow-hidden" style="background: #F7F8FC">
  <!-- Decorative blobs -->
  <div
    class="absolute top-10 right-10 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
    style="background: #6C63FF"
  ></div>
  <div
    class="absolute bottom-10 left-10 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
    style="background: #00D9A5"
  ></div>

  <div class="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
    <!-- Trust badge -->
    <div
      class="inline-flex items-center gap-2 badge-purple mb-8 animate-fade-up"
    >
      <span class="w-1.5 h-1.5 rounded-full" style="background:#6C63FF"></span>
      Trusted by businesses worldwide
    </div>

    <!-- Headline -->
    <h1
      class="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 animate-fade-up delay-100"
    >
      Calculate international<br />
      taxes <span class="gradient-text">instantly</span>
    </h1>

    <!-- Subheadline -->
    <p
      class="text-lg text-gray-500 max-w-xl mx-auto mb-10 animate-fade-up delay-200"
    >
      Global Tax Engine helps small and medium businesses calculate cross-border
      taxes for international sales with precision and ease.
    </p>

    <!-- CTA Buttons -->
    <div
      class="flex flex-wrap items-center justify-center gap-4 animate-fade-up delay-300"
    >
      <a href="/dashboard" class="btn-primary px-8 py-4 text-base">
        Start Calculating <ArrowRight size={18} />
      </a>
      <a href="/history" class="btn-ghost px-8 py-4 text-base">
        <BookOpen size={18} />
        Documentation
      </a>
    </div>
  </div>
</section>

<!-- ── STATS BAR ──────────────────────────────────────────────────────── -->
<section class="max-w-3xl mx-auto px-6 -mt-4 pb-12">
  <div
    class="card flex flex-col sm:flex-row items-center justify-around gap-6 py-8 animate-fade-up delay-200"
  >
    <div class="text-center">
      <div class="icon-box-purple w-12 h-12 mx-auto mb-3">
        <Calculator size={20} color="white" />
      </div>
      <p class="text-3xl font-extrabold text-gray-900">15+</p>
      <p class="text-sm text-gray-500 mt-1">Countries</p>
    </div>

    <div class="hidden sm:block w-px h-12 bg-gray-100"></div>

    <div class="text-center">
      <div class="icon-box-mint w-12 h-12 mx-auto mb-3">
        <Globe size={20} color="white" />
      </div>
      <p class="text-3xl font-extrabold text-gray-900">95%</p>
      <p class="text-sm text-gray-500 mt-1">Accuracy</p>
    </div>

    <div class="hidden sm:block w-px h-12 bg-gray-100"></div>

    <div class="text-center">
      <div class="icon-box-orange w-12 h-12 mx-auto mb-3">
        <FileText size={20} color="white" />
      </div>
      <p class="text-3xl font-extrabold text-gray-900">Instant</p>
      <p class="text-sm text-gray-500 mt-1">Calculation</p>
    </div>
  </div>
</section>

<!-- ── FEATURES ──────────────────────────────────────────────────────── -->
<section class="max-w-6xl mx-auto px-6 py-16">
  <div class="text-center mb-12">
    <h2 class="text-4xl font-bold text-gray-900 mb-3">
      Everything you need for global commerce
    </h2>
    <p class="text-gray-500 text-lg">
      Powerful features designed to simplify international tax calculations
    </p>
  </div>

  <div class="grid md:grid-cols-3 gap-6">
    <!-- Feature 1 -->
    <div class="card text-center hover:shadow-card-hover group">
      <div
        class="icon-box-purple w-14 h-14 mx-auto mb-5 group-hover:scale-110 transition-transform duration-200"
      >
        <Calculator size={24} color="white" />
      </div>
      <h3 class="font-bold text-gray-900 mb-2">Smart Tax Calculator</h3>
      <p class="text-sm text-gray-500 leading-relaxed">
        Calculate taxes instantly for any country with our intelligent engine.
        Supports both <span class="text-primary font-medium">B2B and B2C</span> transactions.
      </p>
    </div>

    <!-- Feature 2 -->
    <div class="card text-center hover:shadow-card-hover group">
      <div
        class="icon-box-mint w-14 h-14 mx-auto mb-5 group-hover:scale-110 transition-transform duration-200"
      >
        <FileText size={24} color="white" />
      </div>
      <h3 class="font-bold text-gray-900 mb-2">Exportable Invoices</h3>
      <p class="text-sm text-gray-500 leading-relaxed">
        Generate professional invoices and export calculation data in
        <span class="text-primary font-medium">PDF format</span> for your records.
      </p>
    </div>

    <!-- Feature 3 -->
    <div class="card text-center hover:shadow-card-hover group">
      <div
        class="icon-box-orange w-14 h-14 mx-auto mb-5 group-hover:scale-110 transition-transform duration-200"
      >
        <Globe size={24} color="white" />
      </div>
      <h3 class="font-bold text-gray-900 mb-2">Multiple Countries</h3>
      <p class="text-sm text-gray-500 leading-relaxed">
        Support for <span class="text-primary font-medium">20+ countries</span> including
        US, Canada, UK, EU nations, Australia, Japan, and more.
      </p>
    </div>
  </div>
</section>

<!-- ── HOW IT WORKS ──────────────────────────────────────────────────────── -->
<section style="background: #F0F1FA" class="py-20">
  <div class="max-w-4xl mx-auto px-6">
    <div class="text-center mb-14">
      <h2 class="text-4xl font-bold text-gray-900 mb-3">How it works</h2>
      <p class="text-gray-500">
        Three simple steps to calculate your international taxes
      </p>
    </div>

    <div
      class="flex flex-col md:flex-row items-start justify-center gap-4 md:gap-0"
    >
      <!-- Step 1 -->
      <div class="flex-1 text-center px-6">
        <div
          class="icon-box-purple w-16 h-16 mx-auto mb-5 text-white text-2xl font-bold flex items-center justify-center rounded-2xl"
        >
          1
        </div>
        <h3 class="font-bold text-gray-900 mb-2">Enter product details</h3>
        <p class="text-sm text-gray-500">
          Input your <span class="text-primary font-medium"
            >product price, type, buyer country, and transaction type</span
          >
        </p>
      </div>

      <!-- Arrow -->
      <div class="hidden md:flex items-center mt-8 text-gray-300">
        <ChevronRight size={28} />
      </div>

      <!-- Step 2 -->
      <div class="flex-1 text-center px-6">
        <div
          class="icon-box-mint w-16 h-16 mx-auto mb-5 text-white text-2xl font-bold flex items-center justify-center rounded-2xl"
        >
          2
        </div>
        <h3 class="font-bold text-gray-900 mb-2">Calculate tax instantly</h3>
        <p class="text-sm text-gray-500">
          Our engine computes the exact tax rate, amount, and total in real-time
        </p>
      </div>

      <!-- Arrow -->
      <div class="hidden md:flex items-center mt-8 text-gray-300">
        <ChevronRight size={28} />
      </div>

      <!-- Step 3 -->
      <div class="flex-1 text-center px-6">
        <div
          class="icon-box-orange w-16 h-16 mx-auto mb-5 text-white text-2xl font-bold flex items-center justify-center rounded-2xl"
        >
          3
        </div>
        <h3 class="font-bold text-gray-900 mb-2">Export invoice or report</h3>
        <p class="text-sm text-gray-500">
          Download your calculation as an <span class="text-primary font-medium"
            >invoice or export data</span
          > for your records
        </p>
      </div>
    </div>

    <div class="text-center mt-12">
      <a href="/dashboard" class="btn-primary px-10 py-4 text-base">
        Try it now <ArrowRight size={18} />
      </a>
    </div>
  </div>
</section>

<!-- ── COMING SOON ──────────────────────────────────────────────────────── -->
<section class="max-w-6xl mx-auto px-6 py-20">
  <div class="text-center mb-12">
    <div
      class="inline-flex items-center gap-2 badge bg-[#FF7A18]/10 text-[#FF7A18] border border-[#FF7A18]/20 mb-4 animate-fade-up"
    >
      <span class="w-1.5 h-1.5 rounded-full" style="background:#FF7A18"></span>
      Coming Soon
    </div>
    <h2
      class="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-up delay-100"
    >
      What's next for Global Tax Engine
    </h2>
    <p class="text-gray-500 max-w-xl mx-auto animate-fade-up delay-200">
      We are constantly improving our engine. Here is a sneak peek at what's
      coming next.
    </p>
  </div>

  <div class="grid md:grid-cols-3 gap-6 animate-fade-up delay-300">
    <!-- Stripe Tax -->
    <div
      class="card bg-gradient-to-br from-[#6C63FF]/5 to-transparent border border-[#6C63FF]/20 text-center hover:-translate-y-1 transition-transform"
    >
      <h3 class="font-bold text-gray-900 mb-2 text-lg">
        Stripe Tax Integration
      </h3>
      <p class="text-sm text-gray-500 leading-relaxed">
        Automatically sync calculations with your Stripe checkout completely
        seamlessly.
      </p>
    </div>

    <!-- 100+ Countries -->
    <div
      class="card bg-gradient-to-br from-[#00D9A5]/5 to-transparent border border-[#00D9A5]/20 text-center hover:-translate-y-1 transition-transform"
    >
      <h3 class="font-bold text-gray-900 mb-2 text-lg">100+ Country Support</h3>
      <p class="text-sm text-gray-500 leading-relaxed">
        Expanding our robust tax dataset to cover almost every jurisdiction
        globally.
      </p>
    </div>

    <!-- AI Tax Assistant -->
    <div
      class="card bg-gradient-to-br from-[#FF7A18]/5 to-transparent border border-[#FF7A18]/20 text-center hover:-translate-y-1 transition-transform"
    >
      <h3 class="font-bold text-gray-900 mb-2 text-lg">AI Tax Assistant</h3>
      <p class="text-sm text-gray-500 leading-relaxed">
        Get instant answers to complex tax compliance questions via an
        integrated AI chat.
      </p>
    </div>
  </div>
</section>

<!-- ── FOOTER ──────────────────────────────────────────────────────── -->
<footer class="bg-white border-t border-gray-100">
  <div class="max-w-6xl mx-auto px-6 py-14">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
      <!-- Brand -->
      <div class="col-span-2 md:col-span-1">
        <div class="flex items-center gap-2 mb-3">
          <div
            class="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
            style="background: linear-gradient(135deg, #6C63FF, #00D9A5)"
          >
            GT
          </div>
          <span class="font-bold text-gray-900">Global Tax Engine</span>
        </div>
        <p class="text-sm text-primary">
          Calculate international taxes instantly for your global business.
        </p>
      </div>

      <!-- Company -->
      <div>
        <p class="text-sm font-semibold text-gray-900 mb-4">Company</p>
        <ul class="space-y-2.5 text-sm text-gray-500">
          <li>
            <a href="/" class="hover:text-primary transition-colors">About</a>
          </li>
          <li>
            <a href="/" class="hover:text-primary transition-colors">Contact</a>
          </li>
        </ul>
      </div>
    </div>

    <div
      class="border-t border-gray-100 mt-10 pt-8 text-center text-sm text-gray-400"
    >
      © 2026 Global Tax Engine. All rights reserved.
    </div>
  </div>
</footer>
