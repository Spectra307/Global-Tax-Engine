# Global Tax Engine 🌍

A hackathon MVP web application for calculating cross-border tax for SMB sellers across 20 countries.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | SvelteKit + TailwindCSS + Lucide Icons |
| Backend | Node.js + Express.js |
| Database | Supabase (free tier) |
| PDF | pdf-lib |
| Data | Local JSON (20 countries) |

---

## Quick Start

### 1. Clone and Install

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 2. Configure Environment

```bash
# Copy the example env file
cp backend/.env.example backend/.env
```

Then edit `backend/.env` with your Supabase credentials:
```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

> **Note:** The app works without Supabase — history will be stored in-memory during the session.

### 3. Set Up Supabase (optional, for persistent history)

Run this SQL in your Supabase SQL editor:

```sql
create table tax_history (
  id bigint primary key generated always as identity,
  amount numeric not null,
  country text not null,
  country_name text,
  tax_rate numeric,
  tax_amount numeric,
  total numeric,
  tax_name text,
  buyer_type text,
  product_type text,
  authority text,
  created_at timestamptz default now()
);
```

### 4. Run the Application

**Terminal 1 – Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
Global-Tax-Engine/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express entry point
│   │   ├── data/
│   │   │   └── tax_rules.json     # 20-country tax dataset
│   │   ├── services/
│   │   │   ├── taxEngine.js       # Core tax calculation logic
│   │   │   └── datasetLoader.js   # JSON dataset loader
│   │   └── routes/
│   │       ├── tax.js             # POST /api/tax
│   │       ├── invoice.js         # POST /api/invoice
│   │       └── history.js         # GET/POST /api/history
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app.html               # Root HTML
    │   ├── app.css                # Global styles + Tailwind
    │   ├── lib/
    │   │   ├── api.js             # API helper functions
    │   │   └── components/
    │   │       ├── Navbar.svelte
    │   │       ├── TaxForm.svelte
    │   │       ├── ResultCard.svelte
    │   │       ├── InvoiceButton.svelte
    │   │       └── HistoryTable.svelte
    │   └── routes/
    │       ├── +layout.svelte     # Root layout
    │       ├── +page.svelte       # Landing page
    │       ├── dashboard/
    │       │   └── +page.svelte   # Calculator
    │       └── history/
    │           └── +page.svelte   # History
    └── package.json
```

---

## API Reference

### `POST /api/tax`
Calculate tax for a sale.

**Request:**
```json
{ "amount": 1000, "country": "DE", "productType": "digital", "buyerType": "B2C" }
```
**Response:**
```json
{
  "taxRate": 0.19,
  "taxRatePercent": "19.0%",
  "taxAmount": 190.00,
  "total": 1190.00,
  "authority": "German Federal Central Tax Office (BZSt)",
  "taxName": "VAT (MwSt)",
  "countryName": "Germany",
  "currency": "EUR",
  "reverseCharge": false
}
```

### `POST /api/invoice`
Generate a PDF invoice. Returns a downloadable PDF file.

### `GET /api/history`
Returns all past calculation records.

### `POST /api/history`
Saves a new calculation record.

### `GET /api/tax/countries`
Returns all 20 supported countries for the dropdown.

---

## Supported Countries

🇺🇸 US · 🇬🇧 GB · 🇩🇪 DE · 🇫🇷 FR · 🇮🇹 IT · 🇪🇸 ES · 🇨🇦 CA · 🇦🇺 AU  
🇯🇵 JP · 🇮🇳 IN · 🇧🇷 BR · 🇸🇬 SG · 🇳🇱 NL · 🇸🇪 SE · 🇳🇴 NO · 🇩🇰 DK  
🇨🇭 CH · 🇳🇿 NZ · 🇿🇦 ZA · 🇦🇪 AE
