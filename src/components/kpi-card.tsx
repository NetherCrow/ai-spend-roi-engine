import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function KpiCard({
  label,
  value,
  changePct,
  changeIsGood,
}: {
  label: string;
  value: string;
  changePct?: number;
  changeIsGood?: (pct: number) => boolean;
}) {
  const hasChange = typeof changePct === "number";
  const isGood = hasChange && changeIsGood ? changeIsGood(changePct!) : (changePct ?? 0) >= 0;

  return (
    <div className="bg-surface border border-border rounded-lg px-5 py-4">
      <div className="text-xs text-text-muted mb-2">{label}</div>
      <div className="tabular text-2xl sm:text-3xl font-semibold text-text-primary">{value}</div>
      {hasChange && (
        <div
          className={`flex items-center gap-1 mt-2 text-xs tabular ${
            isGood ? "text-accent" : "text-danger"
          }`}
        >
          {changePct! >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(changePct!)}% vs last period
        </div>
      )}
    </div>
  );
}
