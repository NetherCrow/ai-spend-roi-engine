"use client";

import { useState } from "react";
import { Wand2, X } from "lucide-react";
import type { OpportunityItem } from "@/types/api";

const TYPE_LABEL: Record<OpportunityItem["type"], string> = {
  model_substitution: "Model substitution",
  unused_subscription: "Unused subscription",
  duplicate_tooling: "Duplicate tooling",
};

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function OpportunityCard({ opportunity }: { opportunity: OpportunityItem }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-surface border border-border rounded-lg px-5 py-4 flex flex-col">
        <span className="text-[11px] uppercase tracking-wide text-accent mb-2">
          {TYPE_LABEL[opportunity.type]}
        </span>
        <h3 className="text-sm font-medium text-text-primary mb-1.5">{opportunity.title}</h3>
        <p className="text-sm text-text-muted flex-1">{opportunity.description}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="tabular text-lg font-semibold text-accent">
            {currency(opportunity.estimatedMonthlySavingsUSD)}/mo
          </span>
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
          >
            <Wand2 size={13} /> Simulate change
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-surface border border-border rounded-lg max-w-md w-full px-6 py-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-text-primary pr-4">{opportunity.title}</h3>
              <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary shrink-0">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-text-muted mb-4">{opportunity.staticSimulationDetails}</p>
            <div className="bg-accent-dim border border-accent/30 rounded-md px-4 py-3 tabular text-accent text-sm">
              Projected monthly savings: {currency(opportunity.estimatedMonthlySavingsUSD)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
