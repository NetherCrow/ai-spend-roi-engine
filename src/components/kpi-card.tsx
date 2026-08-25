import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: string;
  changePct?: number;
  changeIsGood?: (pct: number) => boolean;
  index?: string; // e.g. "01"
};

export function KpiCard({ label, value, changePct, changeIsGood, index }: KpiCardProps) {
  const isGood = changePct !== undefined && changeIsGood ? changeIsGood(changePct) : undefined;
  const TrendIcon = changePct !== undefined && changePct <= 0 ? ArrowDownRight : ArrowUpRight;

  return (
    <div className="card-hover group relative overflow-hidden rounded-xl border border-border bg-surface px-5 py-4">
      <div
        className={`absolute inset-x-0 top-0 h-[2px] ${
          isGood === undefined ? "bg-border" : isGood ? "bg-good" : "bg-warn"
        }`}
      />
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
          {label}
        </span>
        {index && <span className="font-mono text-[10px] text-text-muted/50">{index}</span>}
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="font-mono text-[28px] leading-none tracking-tight text-text-primary tabular-nums">
          {value}
        </span>
        {changePct !== undefined && (
          <span
            className={`mb-0.5 flex items-center gap-0.5 font-mono text-xs tabular-nums ${
              isGood ? "text-good" : "text-warn"
            }`}
          >
            <TrendIcon size={12} strokeWidth={2.5} />
            {Math.abs(changePct)}%
          </span>
        )}
      </div>
    </div>
  );
}
