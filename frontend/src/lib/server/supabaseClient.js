/**
 * supabaseClient.js - Reusable Supabase client for server-side use.
 *
 * Reads credentials from environment variables.
 * Returns null when env vars are missing so callers can fall back gracefully.
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;

  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('your-project-ref') || url === '') {
    return null;
  }

  _supabase = createClient(url, key);
  return _supabase;
}

export const supabase = getSupabase();
