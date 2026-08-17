import { headers } from "next/headers";
import Link from "next/link";
import { KpiCard } from "@/components/kpi-card";
import { EfficiencyRing } from "@/components/efficiency-ring";
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
    <div className="max-w-5xl mx-auto px-8 py-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-text-primary">Executive Overview</h1>
        <p className="text-sm text-text-muted mt-1">
          What your AI spend accomplished, not just where it went.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard label="AI Spend" value={currency(data.totalSpendUSD)} changePct={data.spendChangePct} changeIsGood={(pct) => pct <= 0} />
        <div className="bg-surface border border-border rounded-lg px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-text-muted mb-2">Efficiency Score</div>
            <div className="text-xs text-text-muted">Company-wide ASES</div>
          </div>
          <EfficiencyRing score={data.efficiencyScore} size={72} />
        </div>
        <KpiCard label="Optimization Opportunity" value={`${currency(data.potentialSavingsUSD)}/mo`} />
      </div>

      <div className="bg-surface border border-border rounded-lg px-6 py-5">
        <h2 className="text-sm font-medium text-text-primary mb-5">AI Spend by Team</h2>
        <div className="space-y-4">
          {data.spendByTeam.map((team) => (
            <Link key={team.teamId} href={`/teams/${team.teamId}`} className="block group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-text-primary group-hover:text-accent transition-colors">
                  {team.teamName}
                </span>
                <span className="tabular text-sm text-text-muted">
                  {currency(team.amountUSD)}
                  <span className="text-text-muted/60 ml-2">{team.pctOfTotal}%</span>
                </span>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent/70 group-hover:bg-accent transition-colors rounded-full"
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
