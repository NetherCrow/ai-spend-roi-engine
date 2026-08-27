import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { EfficiencyGauge } from "@/components/efficiency-gauge";
import { AnomalyBadge } from "@/components/anomaly-badge";
import { fetchTeamDetail } from "@/lib/data/team-detail";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchTeamDetail(id);
  const maxProvider = Math.max(...data.topProviders.map((p) => p.amountUSD), 1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:px-8 sm:py-10 md:pb-10">
      <Link
        href="/teams"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-4"
      >
        <ArrowLeft size={13} /> All teams
      </Link>

      <header className="mb-8 animate-rise">
        <h1 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">{data.teamName}</h1>
        <p className="text-sm text-text-muted mt-1">AI spend intelligence, current period.</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="animate-rise" style={{ animationDelay: "60ms" }}>
          <KpiCard label="Spend" value={currency(data.spendUSD)} />
        </div>
        <div className="animate-rise" style={{ animationDelay: "120ms" }}>
          <KpiCard
            label="Productivity"
            value={`${data.productivityChangePct >= 0 ? "+" : ""}${data.productivityChangePct}%`}
          />
        </div>
        <div className="animate-rise" style={{ animationDelay: "180ms" }}>
          <KpiCard label="Usage" value={`${data.usageChangePct >= 0 ? "+" : ""}${data.usageChangePct}%`} />
        </div>
        <div
          className="animate-rise card-hover col-span-2 sm:col-span-1 bg-surface border border-border rounded-xl px-5 py-4 flex items-center justify-between"
          style={{ animationDelay: "240ms" }}
        >
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">Efficiency</div>
          <EfficiencyGauge score={data.efficiencyScore} size={72} />
        </div>
      </div>

      {data.anomalies.length > 0 && (
        <div className="animate-rise mb-6 space-y-2" style={{ animationDelay: "300ms" }}>
          {data.anomalies.map((a) => (
            <AnomalyBadge key={a.id} description={a.description} severity={a.severity} />
          ))}
        </div>
      )}

      <div className="animate-rise bg-surface border border-border rounded-xl px-6 py-5" style={{ animationDelay: "360ms" }}>
        <h2 className="mb-5 font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">Top Providers</h2>
        <div className="space-y-4">
          {data.topProviders.map((p) => (
            <div key={p.vendorId}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-text-primary">{p.vendorName}</span>
                <span className="font-mono tabular-nums text-sm text-text-muted">{currency(p.amountUSD)}</span>
              </div>
              <div className="meter-track h-2 bg-surface-2 rounded-full overflow-hidden">
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
