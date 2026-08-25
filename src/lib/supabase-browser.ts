import { createBrowserClient } from "@supabase/ssr";

// Cookie-backed client for auth flows, so the session is visible to
// middleware and Server Components — distinct from the plain supabase-js
// client in ./supabase.ts, which only ever does anonymous public reads.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
