type EfficiencyGaugeProps = {
  score: number; // 0–100
  size?: number;
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

const BANDS = [
  { from: 0, to: 40, label: "AT RISK", color: "var(--warn)" },
  { from: 40, to: 70, label: "WATCH", color: "var(--accent)" },
  { from: 70, to: 100, label: "STRONG", color: "var(--good)" },
];

export function EfficiencyGauge({ score, size = 128 }: EfficiencyGaugeProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const cx = 100;
  const cy = 100;
  const r = 78;
  const startAngle = 180;
  const endAngle = 0;
  const valueAngle = startAngle - (clamped / 100) * (startAngle - endAngle);
  const band = BANDS.find((b) => clamped >= b.from && clamped <= b.to) ?? BANDS[0];
  const ticks = [0, 25, 50, 75, 100];

  return (
    <div style={{ width: size, height: size * 0.7 }} className="relative">
      <svg viewBox="0 0 200 118" className="h-full w-full overflow-visible">
        <path
          d={arcPath(cx, cy, r, startAngle, endAngle)}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {ticks.map((t) => {
          const a = startAngle - (t / 100) * (startAngle - endAngle);
          const inner = polarToCartesian(cx, cy, r - 9, a);
          const outer = polarToCartesian(cx, cy, r + 3, a);
          return (
            <line
              key={t}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--border)"
              strokeWidth={1.5}
            />
          );
        })}
        <path
          d={arcPath(cx, cy, r, startAngle, valueAngle)}
          fill="none"
          stroke={band.color}
          strokeWidth={10}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="font-mono text-2xl font-medium tabular-nums text-text-primary">
          {Math.round(clamped)}
        </span>
        <span className="font-mono text-[9px] tracking-[0.16em]" style={{ color: band.color }}>
          {band.label}
        </span>
      </div>
    </div>
  );
}