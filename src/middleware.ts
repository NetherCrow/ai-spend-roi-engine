import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase-middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // /api is excluded: those routes are only ever reached from pages that are
  // already gated below, and internal server-to-server fetch() calls (e.g.
  // src/app/teams/page.tsx -> /api/overview) don't carry the browser's
  // session cookie, so gating them here would 401/redirect those instead.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
