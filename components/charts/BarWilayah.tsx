"use client";

import { useEffect, useRef, useState } from "react";
import { angka, rupiahRingkas, persen } from "@/lib/format";

type Baris = { desa: string; jumlahPenerima: number; totalDana: number; tersalur: number; klaim: number };

/**
 * Bar dianimasikan dengan scaleX, bukan width — width memicu layout,
 * transform tidak. Bedanya terasa jelas di ponsel.
 */
export function BarWilayah({ data }: { data: Baris[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tampil, setTampil] = useState(false);
  const maks = Math.max(...data.map((d) => d.totalDana));

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setTampil(true); return; }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setTampil(true), io.disconnect()), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col gap-5">
      {data.map((d, i) => (
        <div key={d.desa} className="group">
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <p className="text-[13px] font-medium">{d.desa}</p>
            <p className="tnum text-[12px] text-ink-3">
              {angka(d.jumlahPenerima)} penerima
              <span className="mx-1.5 text-ink-4">·</span>
              <span className="text-ink-2">{rupiahRingkas(d.totalDana)}</span>
            </p>
          </div>

          <div className="relative h-[7px] overflow-hidden rounded-full bg-paper-3">
            {/* lapisan dialokasikan */}
            <div
              className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-ink/12
                transition-transform duration-[1100ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                transform: `scaleX(${tampil ? d.totalDana / maks : 0})`,
                transitionDelay: `${i * 70}ms`,
              }}
            />
            {/* lapisan benar-benar tersalur on-chain */}
            <div
              className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-sage
                transition-transform duration-[1100ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                transform: `scaleX(${tampil ? d.tersalur / maks : 0})`,
                transitionDelay: `${140 + i * 70}ms`,
              }}
            />
          </div>

          <p className="mt-1.5 tnum text-[11px] text-ink-4">
            {persen(d.klaim)} sudah diklaim penerima
          </p>
        </div>
      ))}

      <div className="mt-1 flex items-center gap-5 border-t border-[var(--hairline)] pt-4 text-[11px] text-ink-3">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sage" /> Tersalur on-chain
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-ink/15" /> Dialokasikan, belum diklaim
        </span>
      </div>
    </div>
  );
}
