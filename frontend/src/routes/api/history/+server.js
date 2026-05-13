import { json, error } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabaseClient.js';

// In-memory fallback (limited scope in serverless, used when Supabase is not configured)
const inMemoryHistory = [];

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  try {
    // Optional filters from query string
    const country = url.searchParams.get('country') || null;
    const dateFrom = url.searchParams.get('dateFrom') || null;
    const dateTo = url.searchParams.get('dateTo') || null;

    if (supabase) {
      let query = supabase
        .from('tax_calculations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      // Apply country filter
      if (country) {
        query = query.eq('dest_country', country.toUpperCase());
      }
      // Apply date filters
      if (dateFrom) {
        query = query.gte('created_at', new Date(dateFrom).toISOString());
      }
      if (dateTo) {
        // Include the full end day
        const end = new Date(dateTo);
        end.setDate(end.getDate() + 1);
        query = query.lt('created_at', end.toISOString());
      }

      const { data, error: dbError } = await query;
      
      if (dbError) {
        console.error('Supabase error, falling back to in-memory:', dbError.message);
        // Fall through to in-memory fallback
      } else {
        // Normalize to a consistent shape for the frontend
        const normalised = (data || []).map(r => ({
          id: r.id,
          created_at: r.created_at,
          amount: r.amount,
          country: r.dest_country,
          country_name: r.country_name,
          tax_rate: r.tax_rate,
          tax_amount: r.tax_amount,
          total: r.total,
          net_profit: r.net_profit,
          tax_name: r.tax_name,
          buyer_type: r.buyer_type,
          product_type: r.product_type,
          authority: r.authority,
          reverse_charge: r.reverse_charge
        }));

        return json({ history: normalised });
      }
    }

    // In-memory fallback
    let records = [...inMemoryHistory].reverse();
    if (country) records = records.filter(r => r.dest_country === country.toUpperCase());
    // Normalize in-memory records to the same shape as the Supabase response
    const normalised = records.map(r => ({
      id: r.id,
      created_at: r.created_at,
      amount: r.amount,
      country: r.dest_country,        // normalize key
      country_name: r.country_name,
      tax_rate: r.tax_rate,
      tax_amount: r.tax_amount,
      total: r.total,
      net_profit: r.net_profit,
      tax_name: r.tax_name,
      buyer_type: r.buyer_type,
      product_type: r.product_type,
      authority: r.authority,
      reverse_charge: r.reverse_charge
    }));
    return json({ history: normalised });
  } catch (err) {
    throw error(500, err.message);
  }
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const {
      amount,
      countryCode,
      country,          // also accept legacy key
      countryName,
      taxRate,
      taxAmount,
      total,
      netProfit,
      taxName,
      buyerType,
      productType,
      authority,
      reverseCharge,
      destState,
      sourceCountry
    } = await request.json();

    const destCountry = countryCode || country;

    const record = {
      amount: parseFloat(amount),
      dest_country: destCountry,
      dest_state: destState || null,
      source_country: sourceCountry || null,
      country_name: countryName,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      net_profit: netProfit,
      tax_name: taxName,
      buyer_type: buyerType,
      product_type: productType,
      authority,
      reverse_charge: reverseCharge || false,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error: dbError } = await supabase
        .from('tax_calculations')
        .insert(record)
        .select()
        .single();
        
      if (dbError) {
        console.error('Supabase insert error, falling back to in-memory:', dbError.message);
        // Fall through to in-memory fallback
      } else {
        return json({ record: data }, { status: 201 });
      }
    }

    // In-memory fallback
    const withId = { id: inMemoryHistory.length + 1, ...record };
    inMemoryHistory.push(withId);
    return json({ record: withId }, { status: 201 });
  } catch (err) {
    throw error(500, err.message);
  }
}
