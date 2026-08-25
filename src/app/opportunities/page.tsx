import { headers } from "next/headers";
import { OpportunityCard } from "@/components/opportunity-card";
import type { OpportunitiesResponse } from "@/types/api";

async function getOpportunities(): Promise<OpportunitiesResponse> {
  const h = await headers();
  const host = h.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const res = await fetch(`${protocol}://${host}/api/opportunities`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load opportunities");
  return res.json();
}

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function OpportunitiesPage() {
  const data = await getOpportunities();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:px-8 sm:py-10 md:pb-10">
      <div className="mb-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Opportunities
      </div>

      <header className="mb-8 animate-rise flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">Opportunities</h1>
          <p className="text-sm text-text-muted mt-1">
            {data.opportunities.length} optimization opportunities identified this period.
          </p>
        </div>
        <div className="sm:text-right">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted mb-1">
            Potential savings
          </div>
          <div className="font-mono tabular-nums text-2xl font-semibold text-accent">
            {currency(data.totalPotentialSavingsUSD)}/mo
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.opportunities.map((o, i) => (
          <div key={o.id} className="animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
            <OpportunityCard opportunity={o} />
          </div>
        ))}
      </div>
    </div>
  );
}
