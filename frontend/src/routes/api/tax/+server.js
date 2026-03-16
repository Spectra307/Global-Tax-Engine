import { json, error } from '@sveltejs/kit';
import { calculateTax } from '$lib/server/taxEngine.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { amount, sourceCountry, destCountry, productType, buyerType, destState } = await request.json();

    if (!amount || !sourceCountry || !destCountry || !productType || !buyerType) {
      throw error(400, 'Missing required fields: amount, sourceCountry, destCountry, productType, buyerType');
    }

    const result = calculateTax(
      parseFloat(amount),
      destCountry,
      sourceCountry,
      productType,
      buyerType,
      destState
    );

    return json(result);
  } catch (err) {
    throw error(400, err.message);
  }
}
