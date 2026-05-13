import { json, error } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabaseClient.js';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  try {
    if (!supabase) {
      // Return demo analytics when Supabase is not configured
      return json({
        analytics: {
          totalRevenue: 0,
          totalTaxCollected: 0,
          totalNetProfit: 0,
          totalTransactions: 0,
          topCountry: { country: 'N/A', country_name: 'N/A', count: 0 },
          recentTrend: [],
          countryBreakdown: []
        },
        demo: true
      });
    }

    // Aggregate metrics from tax_calculations table
    const [summaryRes, countryRes, trendRes] = await Promise.all([
      // Overall totals
      supabase
        .from('tax_calculations')
        .select('amount, tax_amount, net_profit')
        .then(({ data, error: e }) => {
          if (e) throw e;
          const rows = data || [];
          return {
            totalRevenue: rows.reduce((s, r) => s + parseFloat(r.amount || 0), 0),
            totalTaxCollected: rows.reduce((s, r) => s + parseFloat(r.tax_amount || 0), 0),
            totalNetProfit: rows.reduce((s, r) => s + parseFloat(r.net_profit || 0), 0),
            totalTransactions: rows.length
          };
        }),

      // Top countries by transaction count
      supabase
        .from('tax_calculations')
        .select('dest_country, country_name')
        .then(({ data, error: e }) => {
          if (e) throw e;
          const counts = {};
          const names = {};
          for (const row of data || []) {
            const c = row.dest_country;
            counts[c] = (counts[c] || 0) + 1;
            names[c] = row.country_name;
          }
          const sorted = Object.entries(counts)
            .map(([country, count]) => ({ country, country_name: names[country], count }))
            .sort((a, b) => b.count - a.count);
          return sorted;
        }),

      // Last 7 days trend
      supabase
        .from('tax_calculations')
        .select('created_at, amount, tax_amount')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })
        .then(({ data, error: e }) => {
          if (e) throw e;
          // Group by date
          const byDate = {};
          for (const row of data || []) {
            const d = new Date(row.created_at).toISOString().slice(0, 10);
            if (!byDate[d]) byDate[d] = { date: d, revenue: 0, tax: 0, count: 0 };
            byDate[d].revenue += parseFloat(row.amount || 0);
            byDate[d].tax += parseFloat(row.tax_amount || 0);
            byDate[d].count += 1;
          }
          return Object.values(byDate);
        })
    ]);

    return json({
      analytics: {
        ...summaryRes,
        topCountry: countryRes[0] || { country: 'N/A', country_name: 'N/A', count: 0 },
        countryBreakdown: countryRes.slice(0, 10),
        recentTrend: trendRes
      }
    });
  } catch (err) {
    throw error(500, err.message);
  }
}
