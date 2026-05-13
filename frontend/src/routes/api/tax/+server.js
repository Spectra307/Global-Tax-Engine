import { json, error } from '@sveltejs/kit';
import { calculateTax } from '$lib/server/taxEngine.js';
import { supabase } from '$lib/server/supabaseClient.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { amount, sourceCountry, destCountry, productType, buyerType, destState } = await request.json();

    if (!amount || !sourceCountry || !destCountry || !productType || !buyerType) {
      throw error(400, 'Missing required fields: amount, sourceCountry, destCountry, productType, buyerType');
    }

    const result = await calculateTax(
      parseFloat(amount),
      destCountry,
      sourceCountry,
      productType,
      buyerType,
      destState
    );

    // --- Task 3: Persist to Supabase (non-blocking) ---
    let calculationId = null;
    if (supabase) {
      try {
        const { data, error: dbError } = await supabase
          .from('tax_calculations')
          .insert({
            amount: parseFloat(amount),
            dest_country: destCountry,
            dest_state: destState || null,
            source_country: sourceCountry,
            product_type: productType,
            buyer_type: buyerType,
            tax_rate: result.taxRate,
            tax_amount: result.taxAmount,
            total: result.total,
            net_profit: result.netProfit,
            authority: result.authority,
            country_name: result.countryName,
            tax_name: result.taxName,
            reverse_charge: result.reverseCharge
          })
          .select('id')
          .single();

        if (!dbError && data) {
          calculationId = data.id;
        }
      } catch (dbErr) {
        // Non-critical: don't fail the calculation if DB write fails
        console.warn('Supabase insert failed:', dbErr.message);
      }
    }

    return json({ ...result, calculationId });
  } catch (err) {
    throw error(400, err.message);
  }
}
