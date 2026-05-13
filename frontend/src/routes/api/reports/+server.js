import { error } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabaseClient.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  try {
    let rows = [];

    if (supabase) {
      const country = url.searchParams.get('country') || null;
      const dateFrom = url.searchParams.get('dateFrom') || null;
      const dateTo = url.searchParams.get('dateTo') || null;

      let query = supabase
        .from('tax_calculations')
        .select('created_at, dest_country, country_name, amount, tax_amount, total, authority, tax_rate, net_profit, product_type, buyer_type')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (country) query = query.eq('dest_country', country.toUpperCase());
      if (dateFrom) query = query.gte('created_at', new Date(dateFrom).toISOString());
      if (dateTo) {
        const end = new Date(dateTo);
        end.setDate(end.getDate() + 1);
        query = query.lt('created_at', end.toISOString());
      }

      const { data, error: dbError } = await query;
      if (dbError) throw dbError;
      rows = data || [];
    }

    // Build CSV
    const headers = [
      'Date',
      'Country Code',
      'Country',
      'Product Type',
      'Buyer Type',
      'Amount (USD)',
      'Tax Rate',
      'Tax (USD)',
      'Total (USD)',
      'Net Profit (USD)',
      'Authority'
    ];

    const csvLines = [
      headers.join(','),
      ...rows.map(r => [
        new Date(r.created_at).toISOString().replace('T', ' ').slice(0, 19),
        r.dest_country || '',
        `"${(r.country_name || '').replace(/"/g, '""')}"`,
        r.product_type || '',
        r.buyer_type || '',
        parseFloat(r.amount || 0).toFixed(2),
        `${(parseFloat(r.tax_rate || 0) * 100).toFixed(1)}%`,
        parseFloat(r.tax_amount || 0).toFixed(2),
        parseFloat(r.total || 0).toFixed(2),
        parseFloat(r.net_profit || 0).toFixed(2),
        `"${(r.authority || '').replace(/"/g, '""')}"`
      ].join(','))
    ];

    const csv = csvLines.join('\n');
    const filename = `tax-report-${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (err) {
    throw error(500, 'Failed to generate report: ' + err.message);
  }
}
