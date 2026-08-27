import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ArrowRight } from "lucide-react";
import { EfficiencyGauge } from "@/components/efficiency-gauge";
import { fetchOverview } from "@/lib/data/overview";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function OverviewPage() {
  const data = await fetchOverview();
  const maxSpend = Math.max(...data.spendByTeam.map((t) => t.amountUSD), 1);
  const spendIsGood = data.spendChangePct <= 0;
  const SpendTrendIcon = spendIsGood ? ArrowDownRight : ArrowUpRight;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-8 sm:py-10 md:pb-10">
      <div className="mb-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-good" />
        AI Spend — Overview
      </div>

      <header className="mb-8 animate-rise flex items-start gap-4">
        <span className="mt-2 h-8 w-1 shrink-0 rounded-full bg-accent" />
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            Executive Overview
          </h1>
          <p className="mt-2 text-sm text-text-muted sm:text-base">
            What your AI spend accomplished, not just where it went.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-2">
        {/* hero spend card */}
        <div
          className="hero-mesh card-hover animate-rise relative overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8 lg:col-span-2 lg:row-span-2"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex items-start justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
              AI Spend · Total
            </span>
            <span
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-xs tabular-nums ${
                spendIsGood ? "border-good/30 text-good" : "border-warn/30 text-warn"
              }`}
            >
              <SpendTrendIcon size={12} strokeWidth={2.5} />
              {Math.abs(data.spendChangePct)}%
            </span>
          </div>

          <div className="mt-6 font-display text-6xl font-semibold tracking-tight text-text-primary tabular-nums sm:text-7xl">
            {currency(data.totalSpendUSD)}
          </div>
          <p className="mt-2 text-sm text-text-muted">across {data.spendByTeam.length} teams this period</p>

          <div className="mt-10 flex h-16 items-end gap-1.5">
            {data.spendByTeam.map((t) => (
              <div
                key={t.teamId}
                title={`${t.teamName} — ${t.pctOfTotal}%`}
                className="flex-1 rounded-sm bg-accent/60 transition-colors hover:bg-accent"
                style={{ height: `${Math.max((t.amountUSD / maxSpend) * 100, 6)}%` }}
              />
            ))}
          </div>
        </div>

        {/* efficiency score */}
        <div
          className="card-hover animate-rise flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4"
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

        {/* optimization opportunity */}
        <Link
          href="/opportunities"
          className="card-hover animate-rise group flex flex-col justify-between rounded-2xl border border-border bg-surface px-5 py-4"
          style={{ animationDelay: "240ms" }}
        >
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
              Optimization Opportunity
            </span>
            <ArrowRight size={14} className="text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
          </div>
          <div className="mt-3 font-mono text-[28px] leading-none tracking-tight text-accent tabular-nums">
            {currency(data.potentialSavingsUSD)}
            <span className="text-sm text-text-muted">/mo</span>
          </div>
        </Link>
      </div>

      <div
        className="animate-rise mt-4 rounded-2xl border border-border bg-surface px-6 py-5"
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
