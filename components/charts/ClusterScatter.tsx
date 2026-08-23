"use client";

import { useState } from "react";
import { WARNA_CLUSTER } from "@/lib/format";

type Titik = { x: number; y: number; peringkat: number; ref: string };

const W = 520, H = 320, PAD = { l: 46, r: 16, t: 14, b: 34 };

export function ClusterScatter({ data, label }: { data: Titik[]; label: string[] }) {
  const [aktif, setAktif] = useState<number | null>(null);
  const [hover, setHover] = useState<Titik | null>(null);

  const maxX = Math.max(...data.map((d) => d.x));
  const maxY = Math.max(...data.map((d) => d.y)) + 1;
  const sx = (v: number) => PAD.l + (v / maxX) * (W - PAD.l - PAD.r);
  const sy = (v: number) => H - PAD.b - (v / maxY) * (H - PAD.t - PAD.b);

  const tickX = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round((f * maxX) / 100000) * 100000);
  const tickY = Array.from({ length: maxY + 1 }, (_, i) => i).filter((v) => v % 2 === 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        {label.map((l, i) => (
          <button
            key={l}
            onMouseEnter={() => setAktif(i)}
            onMouseLeave={() => setAktif(null)}
            onClick={() => setAktif((v) => (v === i ? null : i))}
            className="group flex items-center gap-2 text-[11px] text-ink-2 transition-opacity duration-500
              ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{ opacity: aktif === null || aktif === i ? 1 : 0.35 }}
          >
            <span
              className="h-2 w-2 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                group-hover:scale-125"
              style={{ background: WARNA_CLUSTER[i] }}
            />
            {l}
          </button>
        ))}
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible">
          {tickY.map((t) => (
            <g key={`gy${t}`}>
              <line x1={PAD.l} x2={W - PAD.r} y1={sy(t)} y2={sy(t)} stroke="var(--hairline)" strokeWidth="1" />
              <text x={PAD.l - 10} y={sy(t) + 3.5} textAnchor="end" className="fill-ink-4 text-[9px]">{t}</text>
            </g>
          ))}
          {tickX.map((t) => (
            <text key={`tx${t}`} x={sx(t)} y={H - PAD.b + 16} textAnchor="middle" className="fill-ink-4 text-[9px]">
              {t === 0 ? "0" : `${(t / 1000).toLocaleString("id-ID")}rb`}
            </text>
          ))}

          {data.map((d, i) => {
            const redup = aktif !== null && aktif !== d.peringkat;
            return (
              <circle
                key={i}
                cx={sx(d.x)}
                cy={sy(d.y)}
                r={hover?.ref === d.ref ? 5.5 : 3.4}
                fill={WARNA_CLUSTER[d.peringkat]}
                className="transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{ opacity: redup ? 0.08 : hover?.ref === d.ref ? 1 : 0.62 }}
                onMouseEnter={() => setHover(d)}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}

          <text x={PAD.l} y={H - 4} className="fill-ink-4 text-[9px] uppercase tracking-[0.16em]">
            Pendapatan per kapita
          </text>
          <text
            x={-(H / 2)} y={13} transform="rotate(-90)" textAnchor="middle"
            className="fill-ink-4 text-[9px] uppercase tracking-[0.16em]"
          >
            Tanggungan
          </text>
        </svg>

        {hover && (
          <div
            className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1.5
              text-[11px] text-paper lift-2"
          >
            <span className="font-mono">{hover.ref}</span>
            <span className="mx-2 opacity-40">·</span>
            Rp{hover.x.toLocaleString("id-ID")}
            <span className="mx-2 opacity-40">·</span>
            {hover.y} tanggungan
          </div>
        )}
      </div>
    </div>
  );
}
