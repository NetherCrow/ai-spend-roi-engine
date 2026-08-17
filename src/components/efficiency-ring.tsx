const TIERS = [
  { min: 90, label: "Exceptional", color: "var(--accent)" },
  { min: 75, label: "Efficient", color: "var(--accent)" },
  { min: 50, label: "Review", color: "var(--warning)" },
  { min: 25, label: "Inefficient", color: "var(--danger)" },
  { min: 0, label: "Likely waste", color: "var(--danger)" },
];

function tierFor(score: number) {
  return TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];
}

export function EfficiencyRing({ score, size = 128 }: { score: number; size?: number }) {
  const tier = tierFor(score);
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tier.color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="tabular font-semibold text-2xl text-text-primary">{score}</span>
        <span className="text-[11px] text-text-muted mt-0.5">{tier.label}</span>
      </div>
    </div>
  );
}
