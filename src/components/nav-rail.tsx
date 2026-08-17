"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Building2, Sparkles, MessageCircleQuestion } from "lucide-react";

const links = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/teams", label: "Teams", icon: Building2 },
  { href: "/opportunities", label: "Opportunities", icon: Sparkles },
  { href: "/ask", label: "Ask", icon: MessageCircleQuestion },
];

export function NavRail() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="px-5 py-6">
        <div className="font-display font-semibold text-lg tracking-tight text-text-primary">
          Spend<span className="text-accent">ROI</span>
        </div>
        <div className="text-xs text-text-muted mt-0.5">AI spend intelligence</div>
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
      <div className="px-5 py-4 text-xs text-text-muted border-t border-border">
        Period: <span className="tabular text-text-primary">Jul 2026</span>
      </div>
    </nav>
  );
}
