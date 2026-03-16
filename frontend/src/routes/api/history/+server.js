import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

// Try to connect to Supabase
let supabase = null;
const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-project-ref')) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// In-memory fallback (limited scope in serverless)
const inMemoryHistory = [];

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  try {
    if (supabase) {
      const { data, error: dbError } = await supabase
        .from('tax_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (dbError) throw dbError;
      return json({ history: data });
    }

    const sorted = [...inMemoryHistory].reverse();
    return json({ history: sorted });
  } catch (err) {
    throw error(500, err.message);
  }
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const {
      amount,
      country,
      countryName,
      taxRate,
      taxAmount,
      total,
      taxName,
      buyerType,
      productType,
      authority
    } = await request.json();

    const record = {
      amount: parseFloat(amount),
      country,
      country_name: countryName,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      tax_name: taxName,
      buyer_type: buyerType,
      product_type: productType,
      authority,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error: dbError } = await supabase
        .from('tax_history')
        .insert([record])
        .select();
      if (dbError) throw dbError;
      return json({ record: data[0] }, { status: 201 });
    }

    const withId = { id: inMemoryHistory.length + 1, ...record };
    inMemoryHistory.push(withId);
    return json({ record: withId }, { status: 201 });
  } catch (err) {
    throw error(500, err.message);
  }
}
