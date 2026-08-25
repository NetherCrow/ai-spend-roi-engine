import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Per-request client bound to the caller's session cookie, so Postgres sees
// them as `authenticated` and RLS scopes every query to their organization —
// unlike the anon client in ./supabase.ts, which only ever sees public rows.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component render, where cookies can't be
            // written — safe to ignore since middleware refreshes the session
          }
        },
      },
    }
  );
}
