"use client";

import { useEffect, useRef, useState } from "react";

type Segmen = { label: string; nilai: number; warna: string };

export function DonutAlokasi({ segmen, total, tengahAtas, tengahBawah }: {
  segmen: Segmen[];
  total: number;
  tengahAtas: string;
  tengahBawah: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [tampil, setTampil] = useState(false);
  const R = 58, C = 2 * Math.PI * R;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setTampil(true); return; }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setTampil(true), io.disconnect()), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-7 sm:flex-row sm:gap-9">
      <svg ref={ref} viewBox="0 0 150 150" className="h-[150px] w-[150px] shrink-0 -rotate-90">
        <circle cx="75" cy="75" r={R} fill="none" stroke="var(--color-paper-3)" strokeWidth="13" />
        {segmen.map((s) => {
          const frac = total > 0 ? s.nilai / total : 0;
          const dash = frac * C;
          const el = (
            <circle
              key={s.label}
              cx="75" cy="75" r={R} fill="none" stroke={s.warna} strokeWidth="13" strokeLinecap="round"
              strokeDasharray={`${tampil ? dash : 0} ${C}`}
              strokeDashoffset={-offset}
              className="transition-[stroke-dasharray] duration-[1200ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>

      <div className="min-w-0 flex-1">
        <p className="font-display text-[2.25rem] leading-none tnum tracking-[-0.03em]">{tengahAtas}</p>
        <p className="mt-1.5 text-[13px] text-ink-3">{tengahBawah}</p>
        <div className="mt-5 flex flex-col gap-2.5">
          {segmen.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-4 text-[12px]">
              <span className="flex items-center gap-2.5 text-ink-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.warna }} />
                {s.label}
              </span>
              <span className="tnum text-ink-3">
                {total > 0 ? ((s.nilai / total) * 100).toFixed(1) : "0"}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
