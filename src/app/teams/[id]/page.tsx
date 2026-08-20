import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { EfficiencyRing } from "@/components/efficiency-ring";
import { AnomalyBadge } from "@/components/anomaly-badge";
import type { TeamDetailResponse } from "@/types/api";

async function getTeam(id: string): Promise<TeamDetailResponse> {
  const h = await headers();
  const host = h.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const res = await fetch(`${protocol}://${host}/api/team/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load team");
  return res.json();
}

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getTeam(id);
  const maxProvider = Math.max(...data.topProviders.map((p) => p.amountUSD), 1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:px-8 sm:py-10 md:pb-10">
      <Link
        href="/teams"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-4"
      >
        <ArrowLeft size={13} /> All teams
      </Link>

      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-text-primary">{data.teamName}</h1>
        <p className="text-sm text-text-muted mt-1">AI spend intelligence, current period.</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Spend" value={currency(data.spendUSD)} />
        <KpiCard
          label="Productivity"
          value={`${data.productivityChangePct >= 0 ? "+" : ""}${data.productivityChangePct}%`}
        />
        <KpiCard
          label="Usage"
          value={`${data.usageChangePct >= 0 ? "+" : ""}${data.usageChangePct}%`}
        />
        <div className="col-span-2 sm:col-span-1 bg-surface border border-border rounded-lg px-5 py-4 flex items-center justify-between">
          <div className="text-xs text-text-muted">Efficiency Score</div>
          <EfficiencyRing score={data.efficiencyScore} size={64} />
        </div>
      </div>

      {data.anomalies.length > 0 && (
        <div className="mb-6 space-y-2">
          {data.anomalies.map((a) => (
            <AnomalyBadge key={a.id} description={a.description} severity={a.severity} />
          ))}
        </div>
      )}

      <div className="bg-surface border border-border rounded-lg px-6 py-5">
        <h2 className="text-sm font-medium text-text-primary mb-5">Top Providers</h2>
        <div className="space-y-4">
          {data.topProviders.map((p) => (
            <div key={p.vendorId}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-text-primary">{p.vendorName}</span>
                <span className="tabular text-sm text-text-muted">{currency(p.amountUSD)}</span>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent/70 rounded-full"
                  style={{ width: `${(p.amountUSD / maxProvider) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
