"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Building2, Sparkles, MessageCircleQuestion, Shield, LogOut, Binoculars } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

const links = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/teams", label: "Teams", icon: Building2 },
  { href: "/opportunities", label: "Opportunities", icon: Sparkles },
  { href: "/ask", label: "ASK", icon: MessageCircleQuestion },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function NavRail() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <nav className="glass hidden md:flex w-56 shrink-0 flex-col rounded-none">
        <div className="px-5 py-6 flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
            <Binoculars size={15} strokeWidth={2.25} />
          </span>
          <div>
            <div className="font-display font-semibold text-sm leading-none tracking-tight text-text-primary">
              Spend<span className="text-accent">ROI</span>
            </div>
            <div className="text-[11px] text-text-muted mt-1">AI spend intelligence</div>
          </div>
        </div>
        <div className="flex-1 px-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-accent-dim text-accent"
                    : "text-text-muted hover:text-text-primary hover:bg-surface-2"
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </div>
        <div className="px-5 py-4 text-xs text-text-muted border-t border-border space-y-3">
          <div>
            Period: <span className="font-mono tabular-nums text-text-primary">Jul 2026</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
          >
            <LogOut size={14} strokeWidth={2} />
            Sign out
          </button>
        </div>
      </nav>

      <nav className="glass md:hidden fixed bottom-0 inset-x-0 z-40 flex border-t-0 pb-[env(safe-area-inset-bottom)]">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] transition-colors ${
                active ? "text-accent" : "text-text-muted"
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
        <button
          onClick={handleSignOut}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] text-text-muted transition-colors"
        >
          <LogOut size={18} strokeWidth={2} />
          Exit
        </button>
      </nav>
    </>
  );
}
