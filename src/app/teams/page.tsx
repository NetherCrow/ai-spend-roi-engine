import { headers } from "next/headers";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { OverviewResponse } from "@/types/api";

async function getOverview(): Promise<OverviewResponse> {
  const h = await headers();
  const host = h.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const res = await fetch(`${protocol}://${host}/api/overview`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load overview");
  return res.json();
}

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function TeamsPage() {
  const data = await getOverview();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:px-8 sm:py-10 md:pb-10">
      <div className="mb-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Teams
      </div>

      <header className="mb-8 animate-rise">
        <h1 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">Teams</h1>
        <p className="text-sm text-text-muted mt-1">Drill into spend intelligence by team.</p>
      </header>

      <div className="animate-rise rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden">
        {data.spendByTeam.map((team, i) => (
          <Link
            key={team.teamId}
            href={`/teams/${team.teamId}`}
            className="flex items-center justify-between px-6 py-4 hover:bg-surface-2 transition-colors group"
          >
            <span className="flex items-center gap-3 text-sm text-text-primary">
              <span className="font-mono text-[10px] text-text-muted/60">{String(i + 1).padStart(2, "0")}</span>
              {team.teamName}
            </span>
            <div className="flex items-center gap-4">
              <span className="font-mono tabular-nums text-sm text-text-muted">{currency(team.amountUSD)}</span>
              <ChevronRight size={16} className="text-text-muted group-hover:translate-x-0.5 group-hover:text-accent transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
