export function AnomalyBadge({ description, severity }: { description: string; severity: number }) {
  const level = severity >= 100 ? "danger" : severity >= 50 ? "warning" : "accent";
  const styles = {
    danger: "bg-danger-dim text-danger border-danger/30",
    warning: "bg-warning-dim text-warning border-warning/30",
    accent: "bg-accent-dim text-accent border-accent/30",
  }[level];

  return (
    <div className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${styles}`}>
      <span className="tabular font-medium shrink-0">{severity}</span>
      <span className="text-text-primary/90">{description}</span>
    </div>
  );
}
