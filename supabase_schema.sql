-- ============================================================
-- Global Tax Engine - Supabase Database Schema
-- ============================================================
-- Run this SQL in the Supabase SQL Editor to set up the
-- required tables for production use.
-- ============================================================

-- ── users table ─────────────────────────────────────────────
-- Stores basic user identity (can be extended with auth.users).
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── tax_calculations table ───────────────────────────────────
-- Core table: every calculation performed via /api/tax is saved here.
CREATE TABLE IF NOT EXISTS public.tax_calculations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES public.users(id) ON DELETE SET NULL,
  amount         NUMERIC(14, 2) NOT NULL,
  dest_country   VARCHAR(2)    NOT NULL,
  dest_state     VARCHAR(5),
  source_country VARCHAR(2),
  product_type   VARCHAR(20)   NOT NULL DEFAULT 'digital',
  buyer_type     VARCHAR(5)    NOT NULL DEFAULT 'B2C',
  tax_rate       NUMERIC(8, 6) NOT NULL,
  tax_amount     NUMERIC(14, 2) NOT NULL,
  total          NUMERIC(14, 2) NOT NULL,
  net_profit     NUMERIC(14, 2),
  authority      TEXT,
  country_name   TEXT,
  tax_name       TEXT,
  reverse_charge BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast country-filtered queries (history, analytics)
CREATE INDEX IF NOT EXISTS idx_tax_calc_dest_country ON public.tax_calculations(dest_country);
-- Index for date-range queries
CREATE INDEX IF NOT EXISTS idx_tax_calc_created_at  ON public.tax_calculations(created_at DESC);

-- ── invoices table ───────────────────────────────────────────
-- Optional: track generated PDF invoices against calculations.
CREATE TABLE IF NOT EXISTS public.invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_id UUID REFERENCES public.tax_calculations(id) ON DELETE CASCADE,
  pdf_url        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security (RLS) ─────────────────────────────────
-- Enable RLS on all tables for security best practices.
ALTER TABLE public.tax_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;

-- Allow the anon key to INSERT and SELECT (needed for MVP without auth)
-- In production, scope these policies to authenticated users.
CREATE POLICY "Allow anon insert" ON public.tax_calculations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select" ON public.tax_calculations FOR SELECT USING (true);
CREATE POLICY "Allow anon insert invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select invoices" ON public.invoices FOR SELECT USING (true);

-- ── tax_rules table ──────────────────────────────────────────
-- Stores the configuration for each country's tax logic.
-- This allows updates to tax rates without code redeployment.
CREATE TABLE IF NOT EXISTS public.tax_rules (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country            VARCHAR(2) UNIQUE NOT NULL,
  name               TEXT NOT NULL,
  tax_name           TEXT NOT NULL,
  digital_tax_rate   NUMERIC(8, 6) NOT NULL,
  physical_tax_rate  NUMERIC(8, 6) NOT NULL,
  reverse_charge     BOOLEAN NOT NULL DEFAULT FALSE,
  authority          TEXT,
  currency           VARCHAR(3),
  flag               TEXT,
  corporate_tax_rate NUMERIC(8, 6) NOT NULL DEFAULT 0.20,
  rule_explanation   TEXT,
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast country lookup
CREATE INDEX IF NOT EXISTS idx_tax_rules_country ON public.tax_rules(country);

-- Enable RLS
ALTER TABLE public.tax_rules ENABLE ROW LEVEL SECURITY;

-- Allow public read access (tax rules are public knowledge)
CREATE POLICY "Allow public select tax_rules" ON public.tax_rules FOR SELECT USING (true);

-- ============================================================
-- SEED DATA - Initial Country Rules
-- ============================================================

INSERT INTO public.tax_rules 
(country, name, tax_name, digital_tax_rate, physical_tax_rate, reverse_charge, authority, currency, flag, corporate_tax_rate, rule_explanation)
VALUES
('US', 'United States', 'Sales Tax', 0, 0.07, false, 'IRS (Internal Revenue Service)', 'USD', '🇺🇸', 0.21, 'The United States applies state-level sales tax on physical goods. Digital services are generally not subject to federal sales tax.'),
('GB', 'United Kingdom', 'VAT', 0.2, 0.2, true, 'HMRC (His Majesty''s Revenue & Customs)', 'GBP', '🇬🇧', 0.2, 'The United Kingdom applies 20% VAT on both digital services and physical goods.'),
('DE', 'Germany', 'VAT (MwSt)', 0.19, 0.19, true, 'German Federal Central Tax Office (BZSt)', 'EUR', '🇩🇪', 0.15, 'Germany applies 19% VAT (Mehrwertsteuer) on digital services sold to consumers.'),
('FR', 'France', 'VAT (TVA)', 0.2, 0.2, true, 'Direction Générale des Finances Publiques', 'EUR', '🇫🇷', 0.25, 'France levies 20% TVA (Taxe sur la Valeur Ajoutée) on digital and physical goods.'),
('IT', 'Italy', 'VAT (IVA)', 0.22, 0.22, true, 'Agenzia delle Entrate', 'EUR', '🇮🇹', 0.24, 'Italy applies 22% IVA (Imposta sul Valore Aggiunto) — one of the higher VAT rates in the EU.'),
('ES', 'Spain', 'VAT (IVA)', 0.21, 0.21, true, 'Agencia Tributaria', 'EUR', '🇪🇸', 0.25, 'Spain applies 21% IVA to digital services and most physical products.'),
('CA', 'Canada', 'GST/HST', 0.05, 0.13, false, 'Canada Revenue Agency (CRA)', 'CAD', '🇨🇦', 0.15, 'Canada applies 5% GST on digital services and 13% on physical goods in most provinces.'),
('AU', 'Australia', 'GST', 0.1, 0.1, false, 'Australian Taxation Office (ATO)', 'AUD', '🇦🇺', 0.3, 'Australia''s GST (Goods and Services Tax) is 10% on both digital and physical goods.'),
('JP', 'Japan', 'Consumption Tax', 0.1, 0.1, false, 'National Tax Agency (NTA)', 'JPY', '🇯🇵', 0.23, 'Japan''s Consumption Tax is 10% on digital services and physical goods.'),
('IN', 'India', 'GST', 0.18, 0.18, true, 'Central Board of Indirect Taxes (CBIC)', 'INR', '🇮🇳', 0.25, 'India''s GST on digital services (OIDAR) is 18%. B2B transactions use the reverse charge mechanism.'),
('BR', 'Brazil', 'ICMS / ISS', 0.17, 0.17, false, 'Receita Federal do Brasil', 'BRL', '🇧🇷', 0.34, 'Brazil applies ICMS at ~17% on physical goods and ISS on digital services.'),
('SG', 'Singapore', 'GST', 0.09, 0.09, false, 'Inland Revenue Authority of Singapore (IRAS)', 'SGD', '🇸🇬', 0.17, 'Singapore raised its GST to 9% in January 2024.'),
('NL', 'Netherlands', 'VAT (BTW)', 0.21, 0.21, true, 'Dutch Tax and Customs Administration', 'EUR', '🇳🇱', 0.25, 'The Netherlands applies 21% BTW on digital services and goods.'),
('SE', 'Sweden', 'VAT (MOMS)', 0.25, 0.25, true, 'Swedish Tax Agency (Skatteverket)', 'SEK', '🇸🇪', 0.2, 'Sweden applies one of Europe''s highest VAT rates at 25% (MOMS).'),
('NO', 'Norway', 'VAT (MVA)', 0.25, 0.25, true, 'Norwegian Tax Administration (Skatteetaten)', 'NOK', '🇳🇴', 0.22, 'Norway applies 25% MVA on digital services and physical goods.'),
('DK', 'Denmark', 'VAT (MOMS)', 0.25, 0.25, true, 'Danish Tax Agency (Skattestyrelsen)', 'DKK', '🇩🇰', 0.22, 'Denmark applies a flat 25% MOMS rate on all goods and services.'),
('CH', 'Switzerland', 'VAT (MWST)', 0.077, 0.077, true, 'Federal Tax Administration (FTA)', 'CHF', '🇨🇭', 0.08, 'Switzerland applies a low 7.7% MWST on digital services and goods.'),
('NZ', 'New Zealand', 'GST', 0.15, 0.15, false, 'Inland Revenue (IR)', 'NZD', '🇳🇿', 0.28, 'New Zealand applies 15% GST on digital services supplied to NZ residents.'),
('ZA', 'South Africa', 'VAT', 0.15, 0.15, false, 'South African Revenue Service (SARS)', 'ZAR', '🇿🇦', 0.27, 'South Africa applies 15% VAT on electronic services.'),
('AE', 'United Arab Emirates', 'VAT', 0.05, 0.05, false, 'Federal Tax Authority (FTA)', 'AED', '🇦🇪', 0.09, 'The UAE applies a 5% VAT and 9% corporate tax.')
ON CONFLICT (country) DO UPDATE SET
  digital_tax_rate = EXCLUDED.digital_tax_rate,
  physical_tax_rate = EXCLUDED.physical_tax_rate,
  corporate_tax_rate = EXCLUDED.corporate_tax_rate,
  rule_explanation = EXCLUDED.rule_explanation;
