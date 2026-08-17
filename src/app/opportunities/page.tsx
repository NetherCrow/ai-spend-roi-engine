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
    <div className="max-w-5xl mx-auto px-8 py-10">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Opportunities</h1>
          <p className="text-sm text-text-muted mt-1">
            {data.opportunities.length} optimization opportunities identified this period.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-text-muted mb-1">Potential savings</div>
          <div className="tabular text-2xl font-semibold text-accent">
            {currency(data.totalPotentialSavingsUSD)}/mo
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {data.opportunities.map((o) => (
          <OpportunityCard key={o.id} opportunity={o} />
        ))}
      </div>
    </div>
  );
}
