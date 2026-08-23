"use client";

const W = 300, H = 150, PAD = { l: 30, r: 12, t: 12, b: 24 };

export function ElbowChart({ data, pilih }: { data: { k: number; sse: number }[]; pilih: number }) {
  const maxSse = Math.max(...data.map((d) => d.sse));
  const maxK = Math.max(...data.map((d) => d.k));
  const sx = (k: number) => PAD.l + ((k - 1) / (maxK - 1)) * (W - PAD.l - PAD.r);
  const sy = (s: number) => H - PAD.b - (s / maxSse) * (H - PAD.t - PAD.b);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${sx(d.k)},${sy(d.sse)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible">
      <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="var(--hairline-strong)" />
      <path d={path} fill="none" stroke="var(--color-ink-3)" strokeWidth="1.25" strokeLinecap="round" />
      {data.map((d) => (
        <g key={d.k}>
          <circle
            cx={sx(d.k)} cy={sy(d.sse)} r={d.k === pilih ? 4.5 : 2.5}
            fill={d.k === pilih ? "var(--color-sage)" : "var(--color-card)"}
            stroke={d.k === pilih ? "var(--color-sage)" : "var(--color-ink-3)"}
            strokeWidth="1.25"
          />
          <text x={sx(d.k)} y={H - PAD.b + 14} textAnchor="middle" className="fill-ink-4 text-[9px]">{d.k}</text>
        </g>
      ))}
      <line
        x1={sx(pilih)} x2={sx(pilih)} y1={sy(data[pilih - 1].sse)} y2={H - PAD.b}
        stroke="var(--color-sage)" strokeWidth="1" strokeDasharray="2 3" opacity="0.5"
      />
      <text x={PAD.l - 6} y={PAD.t + 6} textAnchor="end" className="fill-ink-4 text-[9px]">SSE</text>
    </svg>
  );
}
