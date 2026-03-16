import { json } from '@sveltejs/kit';
import { getAllRules } from '$lib/server/datasetLoader.js';

/** @type {import('./$types').RequestHandler} */
export function GET() {
  const countries = getAllRules().map((rule) => ({
    code: rule.country,
    name: rule.name,
    flag: rule.flag,
    currency: rule.currency,
    taxName: rule.tax_name
  }));
  return json({ countries });
}
