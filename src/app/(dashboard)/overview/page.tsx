import { headers } from "next/headers";
import Link from "next/link";
import { KpiCard } from "@/components/kpi-card";
import { EfficiencyGauge } from "@/components/efficiency-gauge";
import { ThemeToggle } from "@/components/theme-toggle";
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

export default async function OverviewPage() {
  const data = await getOverview();
  const maxSpend = Math.max(...data.spendByTeam.map((t) => t.amountUSD), 1);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:px-8 sm:py-10 md:pb-10">
      <div className="mb-6 flex items-center justify-between">
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-good" />
          AI Spend — Overview
        </span>
        <ThemeToggle />
      </div>

      <header className="mb-8 animate-rise">
        <h1 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">
          Executive Overview
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          What your AI spend accomplished, not just where it went.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="animate-rise" style={{ animationDelay: "80ms" }}>
          <KpiCard
            label="AI Spend"
            value={currency(data.totalSpendUSD)}
            changePct={data.spendChangePct}
            changeIsGood={(pct) => pct <= 0}
            index="01"
          />
        </div>

        <div
          className="animate-rise flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4"
          style={{ animationDelay: "160ms" }}
        >
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
              Efficiency Score
            </div>
            <div className="mt-1 text-xs text-text-muted">Company-wide ASES</div>
          </div>
          <EfficiencyGauge score={data.efficiencyScore} size={104} />
        </div>

        <div className="animate-rise" style={{ animationDelay: "240ms" }}>
          <KpiCard
            label="Optimization Opportunity"
            value={`${currency(data.potentialSavingsUSD)}/mo`}
            index="03"
          />
        </div>
      </div>

      <div
        className="animate-rise rounded-xl border border-border bg-surface px-6 py-5"
        style={{ animationDelay: "320ms" }}
      >
        <h2 className="mb-5 font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
          AI Spend by Team
        </h2>
        <div className="space-y-4">
          {data.spendByTeam.map((team, i) => (
            <Link key={team.teamId} href={`/teams/${team.teamId}`} className="group block">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-text-primary transition-colors group-hover:text-accent">
                  <span className="font-mono text-[10px] text-text-muted/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {team.teamName}
                </span>
                <span className="font-mono text-sm tabular-nums text-text-muted">
                  {currency(team.amountUSD)}
                  <span className="ml-2 text-text-muted/60">{team.pctOfTotal}%</span>
                </span>
              </div>
              <div className="meter-track h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-accent/70 transition-colors group-hover:bg-accent"
                  style={{ width: `${(team.amountUSD / maxSpend) * 100}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}