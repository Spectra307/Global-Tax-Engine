import { json, error } from '@sveltejs/kit';
import { calculateWhatIf } from '$lib/server/taxEngine.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { amount, productType, buyerType } = await request.json();
    
    if (!amount || !productType || !buyerType) {
      throw error(400, 'Missing required fields: amount, productType, buyerType');
    }

    const results = calculateWhatIf(parseFloat(amount), productType, buyerType);
    return json({ results });
  } catch (err) {
    throw error(400, err.message);
  }
}
