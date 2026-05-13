# Global Tax Engine - Comprehensive Project Report

## 1. Executive Summary
The **Global Tax Engine** is an MVP web application designed to simplify cross-border tax calculations for Small and Medium-sized Businesses (SMBs) selling digital or physical products globally. By supporting 20 countries with built-in logic for B2B/B2C transactions and US state-level taxes, it ensures compliance and standardized reporting in USD. This MVP is built with a modern, high-performance tech stack suited for rapid scaling.

## 2. Core Problem & Solution
**The Problem:** Cross-border sellers face immense friction due to varying international tax laws (VAT, GST, State Sales Tax) and shifting rules based on product types (digital vs. physical) and buyer types (B2B vs. B2C).
**The Solution:** A unified calculator and API that instantly determines the correct tax authority, tax rate, tax amount, and net profit for a given transaction, and generates professional PDF invoices.

## 3. Technology Stack
The application recently migrated to a unified **SvelteKit** full-stack approach for seamless deployment (e.g., Vercel).

- **Frontend & API Framework:** SvelteKit (Svelte 4, Vite)
- **Styling:** TailwindCSS & Lucide Icons
- **Database:** Supabase (PostgreSQL) for History, Analytics, and **Tax Rule Configuration**.
- **Data Source:** Dynamic Tax Rules stored in Supabase with a local JSON fallback (`tax_rules.json`) for 20+ countries.
- **PDF Generation:** `pdf-lib` for programmatic, browser-compatible PDF creation
- **Deployment & Hosting:** Vercel ready (via `@sveltejs/adapter-vercel`)

## 4. Key Features & Functionality
### 4.1. Intelligent Tax Calculation (`taxEngine.js`)
- **Dynamic Rates:** Automatically identifies the correct tax rate for 20+ countries based on product type (digital vs. physical).
- **US State Taxes:** Granular support for United States sales tax, including state-specific rates for CA, NY, TX, FL, and WA.
- **Reverse Charge Mechanism:** Intelligent B2B logic that applies a 0% tax rate in applicable jurisdictions, shifting tax liability to the buyer.
- **Corporate Tax & Profit Tracking:** Calculates estimated corporate tax based on the seller's source country to provide a true **Net Profit** figure.
- **Rule Explanation Engine:** Provides a human-readable explanation for every calculation, citing specific tax authorities (e.g., HMRC, IRS, CBIC).

### 4.2. Business Analytics & Insights
- **Interactive Dashboard:** Visualizes business performance with real-time charts (powered by Chart.js).
- **KPI Tracking:** At-a-glance metrics for Total Revenue, Total Tax Collected, and Net Profit.
- **Market Breakdown:** Doughnut charts showing transaction volume by destination country to identify top-performing global markets.
- **Trend Analysis:** Bar charts showing 7-day revenue and tax trends.

### 4.3. User Experience & Tools
- **Checkout Simulator:** A high-fidelity simulation of a real-world checkout experience, allowing sellers to see exactly what their customers will see.
- **What-If Simulations:** A powerful tool that calculates and ranks tax liabilities across all 20+ supported countries simultaneously for any given amount.
- **PDF Invoice Generation:** Generates professional, compliant PDF invoices with one click, including all breakdown details and tax authorities.
- **Smart History & Audit Logs:** A persistent, searchable record of all calculations stored in Supabase, with advanced filtering by country and date range.

## 5. System Architecture & Data Flow
The application follows a modern, decoupled architecture centered around the **SvelteKit** framework:

- **Frontend (`/dashboard`, `/history`, `/analytics`):** A responsive, premium UI built with Svelte and Vanilla CSS, providing a high-performance experience.
- **Serverless API (`/api/*`):** SvelteKit API routes handle logic, database interaction, and PDF generation, allowing for unified deployment to Vercel.
- **Core Engine (`$lib/server/taxEngine.js`):** The brain of the application, handling all mathematical and logic-based tax processing.
- **Persistence Layer (Supabase):** 
  - **`tax_rules` table:** Stores dynamic tax configuration (allows updates without code changes).
  - **`tax_calculations` table:** Stores persistent audit logs and history.
  - **`invoices` table:** Tracks generated documents.
- **Fallback Mechanism:** The `datasetLoader.js` implements a smart fallback to a local JSON dataset if the database is unreachable, ensuring 100% uptime for core calculations.

## 6. API Reference Summary
- `POST /api/tax`: Core calculation endpoint. Accepts transaction parameters and returns a full breakdown + explanation.
- `GET /api/tax/countries`: Returns a list of supported jurisdictions with flags and currency info.
- `POST /api/tax/whatif`: Generates a comparative matrix of tax rates for all countries.
- `GET /api/analytics`: Aggregates historical data into business metrics and chart-ready formats.
- `GET /api/history`: Fetches searchable transaction logs with support for date and country filters.
- `POST /api/invoice`: Converts transaction data into a downloadable PDF stream.

## 7. Supported Jurisdictions (20 Countries)
The engine currently supports major economic hubs including:
🇺🇸 United States (with state support) · 🇬🇧 United Kingdom · 🇩🇪 Germany · 🇫🇷 France · 🇮🇹 Italy · 🇪🇸 Spain · 🇨🇦 Canada · 🇦🇺 Australia · 🇯🇵 Japan · 🇮🇳 India · 🇧🇷 Brazil · 🇸🇬 Singapore · 🇳🇱 Netherlands · 🇸🇪 Sweden · 🇳🇴 Norway · 🇩🇰 Denmark · 🇨🇭 Switzerland · 🇳🇿 New Zealand · 🇿🇦 South Africa · 🇦🇪 United Arab Emirates

## 8. Future Roadmap
- **Real-time Rule Updates:** Managed through Supabase (COMPLETED).
- **Stripe Tax Integration:** Sync calculations directly with Stripe checkout flows.
- **100+ Country Support:** Expanding the database dataset to cover more global jurisdictions.
- **AI Tax Assistant:** Integration of LLMs to answer complex tax compliance questions instantly.
- **Multi-User Teams:** RBAC (Role Based Access Control) for business teams.
