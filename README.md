# Global Tax Engine 🌍 📊

A professional-grade, high-performance web application designed to simplify cross-border tax compliance for SMBs selling digital and physical products globally.

[![SvelteKit](https://img.shields.io/badge/SvelteKit-4-ff3e00?logo=svelte)](https://kit.svelte.dev/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ecf8e?logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🚀 Key Features

### 1. Intelligent Tax Engine
- **Dynamic Rules**: Supports **20+ major economic hubs** with logic for VAT, GST, and Sales Tax.
- **US State Granularity**: Automatic detection of state-level taxes for CA, NY, TX, FL, and WA.
- **B2B Reverse Charge**: Built-in intelligence for EU VAT directives and global B2B tax shifting.
- **Net Profit Tracking**: Calculates corporate tax liabilities to provide true business profitability metrics.
- **Rule Explainer**: Human-readable explanations for every calculation citing specific tax authorities.

### 2. Business Intelligence & Analytics
- **Visual Dashboard**: Real-time charts for revenue trends and tax liabilities (powered by Chart.js).
- **Market Insights**: Doughnut charts showing transaction volume and market share by country.
- **KPI Metrics**: Instant visibility into Total Revenue, Tax Collected, and Net Profit.

### 3. Professional Tools
- **Checkout Simulator**: A high-fidelity "Stripe-style" preview of the customer's payment experience.
- **What-If Simulations**: Instantly compare tax rates across all supported countries for any sale amount.
- **PDF Invoice Generator**: Professional, audit-ready PDF invoices generated dynamically using `pdf-lib`.
- **Smart History**: Searchable, filtered history logs stored securely in Supabase.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | SvelteKit (Svelte 4) + Vite |
| **Backend API** | SvelteKit Serverless Functions (Node.js) |
| **Database** | Supabase (PostgreSQL) |
| **Styling** | Vanilla CSS + TailwindCSS |
| **Charts** | Chart.js |
| **PDF Engine** | pdf-lib |

---

## 📦 Project Structure

```text
Global-Tax-Engine/
├── frontend/                  # Main Application (SvelteKit)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/    # Reusable UI (TaxForm, ResultCard, Analytics)
│   │   │   └── server/        # Core Logic (taxEngine.js, datasetLoader.js)
│   │   └── routes/            # Pages & API Endpoints
│   └── package.json
├── backend/                   # Legacy/Standalone Express API
└── supabase_schema.sql        # Database initialization script
```

---

## 🚦 Quick Start

### 1. Clone & Install
```bash
# Install dependencies
cd frontend
npm install
```

### 2. Configure Environment
Create a `.env` file in the `frontend` folder:
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Setup
Run the contents of [supabase_schema.sql](./supabase_schema.sql) in your **Supabase SQL Editor**. This will:
1. Create the `tax_rules` table and seed it with 20 countries.
2. Create `tax_calculations` and `invoices` tables.
3. Enable Row Level Security (RLS).

### 4. Run Development Server
```bash
npm run dev
```

---

## 📡 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tax` | `POST` | Execute a tax calculation |
| `/api/tax/countries` | `GET` | Get list of supported jurisdictions |
| `/api/tax/whatif` | `POST` | Compare rates across all countries |
| `/api/analytics` | `GET` | Fetch aggregated business metrics |
| `/api/history` | `GET` | Retrieve searchable calculation logs |
| `/api/invoice` | `POST` | Generate and download a PDF invoice |

---

## 🌍 Supported Countries

🇺🇸 United States · 🇬🇧 United Kingdom · 🇩🇪 Germany · 🇫🇷 France · 🇮🇹 Italy · 🇪🇸 Spain · 🇨🇦 Canada · 🇦🇺 Australia · 🇯🇵 Japan · 🇮🇳 India · 🇧🇷 Brazil · 🇸🇬 Singapore · 🇳🇱 Netherlands · 🇸🇪 Sweden · 🇳🇴 Norway · 🇩🇰 Denmark · 🇨🇭 Switzerland · 🇳🇿 New Zealand · 🇿🇦 South Africa · 🇦🇪 UAE

---

## 🗺 Roadmap
- [x] **Database Rule Migration**: Completed transition from static JSON to Supabase.
- [ ] **Stripe Tax Sync**: Direct integration with Stripe Checkout.
- [ ] **100+ Jurisdictions**: Expanding coverage to include emerging markets.
- [ ] **AI Compliance Assistant**: LLM-powered tax advisor.
- [ ] **Multi-User RBAC**: Team management for enterprise accounts.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
