import { AlertTriangle, AlertOctagon, Info } from "lucide-react";

export function AnomalyBadge({ description, severity }: { description: string; severity: number }) {
  const level = severity >= 100 ? "danger" : severity >= 50 ? "warn" : "accent";
  const styles = {
    danger: "bg-danger-dim text-danger border-danger/30",
    warn: "bg-warn-dim text-warn border-warn/30",
    accent: "bg-accent-dim text-accent border-accent/30",
  }[level];
  const Icon = level === "danger" ? AlertOctagon : level === "warn" ? AlertTriangle : Info;

  return (
    <div className={`card-hover flex items-start gap-3 rounded-lg border px-3.5 py-2.5 text-sm ${styles}`}>
      <Icon size={15} strokeWidth={2} className="mt-0.5 shrink-0" />
      <span className="font-mono text-[11px] tabular-nums shrink-0 opacity-80">{severity}</span>
      <span className="text-text-primary/90">{description}</span>
    </div>
  );
}
