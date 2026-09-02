"use client";

import { persen } from "@/lib/format";

const WARNA = ["#0b3b82", "#1479d1", "#16a34a", "#64748b"];

type Item = { key: string; label: string; kontribusi: number; kesenjangan: number; nilaiTampil: string };

/**
 * Stacked bar untuk explainability. Nilai yang ditampilkan adalah komposisi
 * jarak terhadap solusi ideal negatif (§4.4) — seluruhnya berjumlah 1.
 * Sengaja TIDAK dilabeli "persen dari skor", karena C_i berbentuk rasio dan
 * tidak bisa didekomposisi secara aditif.
 */
export function ContributionBar({ items, mode = "kontribusi" }: { items: Item[]; mode?: "kontribusi" | "kesenjangan" }) {
  const nilai = (i: Item) => (mode === "kontribusi" ? i.kontribusi : i.kesenjangan);

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-paper-3">
        {items.map((it, i) => (
          <div
            key={it.key}
            className="h-full transition-[flex-grow] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{ flexGrow: Math.max(nilai(it), 0.001), background: WARNA[i % WARNA.length] }}
            title={`${it.label} — ${persen(nilai(it), 1)}`}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {items.map((it, i) => (
          <div key={it.key} className="flex items-baseline justify-between gap-3 text-[12px]">
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: WARNA[i % WARNA.length] }}
              />
              <span className="truncate text-ink-2">{it.label}</span>
              <span className="shrink-0 font-mono text-[11px] text-ink-4">{it.nilaiTampil}</span>
            </span>
            <span className="tnum shrink-0 font-medium">{persen(nilai(it), 1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
