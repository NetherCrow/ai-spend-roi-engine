import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Single shared client. RLS on every table is set to public-read (no auth,
// single-tenant demo) — see the initial_schema migration.
export const supabase = createClient(url, anonKey);

// Pinned "current" period — never derive this from live system time.
// See .env.local for why.
export const CURRENT_PERIOD = process.env.CURRENT_PERIOD ?? '2026-07-01';

export function previousPeriod(period: string): string {
  const d = new Date(period);
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 10);
}
