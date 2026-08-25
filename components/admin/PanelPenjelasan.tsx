"use client";

import { ContributionBar } from "@/components/charts/ContributionBar";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Cross } from "@/components/ui/Icons";
import { KRITERIA_LABEL } from "./AdminShared";
import type { RankingRow } from "./RuangKerja";
import { angka } from "@/lib/format";

export function PanelPenjelasan({
  baris, terpilih, onTutup,
}: {
  baris: RankingRow | null;
  terpilih: boolean;
  onTutup: () => void;
}) {
  const items = baris
    ? Object.entries(baris.breakdown_kriteria).map(([key, v]) => ({
        key,
        label: KRITERIA_LABEL[key] ?? key,
        kontribusi: v.kontribusi,
        kesenjangan: v.kesenjangan,
        nilaiTampil: v.nilaiAsli.toFixed(2),
      }))
    : [];

  return (
    <>
      <div
        onClick={onTutup}
        className={`fixed inset-0 z-20 bg-ink/20 backdrop-blur-sm transition-opacity duration-700
          ease-[cubic-bezier(0.32,0.72,0,1)] ${baris ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-30 w-full max-w-[26rem] p-3 transition-transform duration-700
          ease-[cubic-bezier(0.32,0.72,0,1)] ${baris ? "translate-x-0" : "translate-x-[105%]"}`}
      >
        <div className="h-full overflow-y-auto rounded-[1.75rem] bg-paper-2/80 p-1.5 ring-1 ring-[var(--hairline-strong)] backdrop-blur-xl lift-3">
          <div className="min-h-full rounded-[calc(1.75rem-0.375rem)] bg-card bezel-core">
            {baris && (
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Eyebrow tone={terpilih ? "sage" : "clay"}>
                      {terpilih ? "Ditetapkan menerima" : "Di luar kuota"}
                    </Eyebrow>
                    <p className="mt-4 font-display text-[1.75rem] leading-none tracking-[-0.03em]">
                      Peringkat {angka(baris.rank)}
                    </p>
                    <p className="mt-2 font-mono text-[12px] text-ink-3">
                      {baris.rumah_tangga_id.slice(0, 8)}
                    </p>
                  </div>
                  <button
                    onClick={onTutup}
                    aria-label="Tutup penjelasan"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/[0.05]
                      ring-1 ring-[var(--hairline)] transition-all duration-500
                      ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink/[0.1] active:scale-95"
                  >
                    <Cross className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-7 grid grid-cols-3 gap-3">
                  {[
                    ["Skor", baris.skor_topsis.toFixed(4)],
                    ["D⁻", baris.d_minus?.toFixed(4) ?? "—"],
                    ["D⁺", baris.d_plus?.toFixed(4) ?? "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-2xl bg-paper-2 p-3.5 ring-1 ring-[var(--hairline)]">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-4">{k}</p>
                      <p className="mt-1.5 font-mono text-[15px] tnum">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3">
                    Kenapa masuk prioritas
                  </p>
                  <p className="mt-2.5 text-[12px] leading-relaxed text-ink-3">
                    Komposisi jarak keluarga ini terhadap kondisi &ldquo;paling tidak membutuhkan&rdquo;.
                    Seluruhnya berjumlah 100%.
                  </p>
                  <div className="mt-5">
                    <ContributionBar items={items} mode="kontribusi" />
                  </div>
                </div>

                <div className="mt-9">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3">
                    Kenapa belum di puncak
                  </p>
                  <p className="mt-2.5 text-[12px] leading-relaxed text-ink-3">
                    Sisi sebaliknya: kriteria mana yang masih menjauhkan keluarga ini dari kondisi
                    paling membutuhkan.
                  </p>
                  <div className="mt-5">
                    <ContributionBar items={items} mode="kesenjangan" />
                  </div>
                </div>

                <div className="mt-9 rounded-2xl bg-paper-2 p-4 ring-1 ring-[var(--hairline)]">
                  <p className="text-[12px] leading-[1.7] text-ink-2">
                    Angka di atas menjelaskan <span className="font-medium">komposisi jarak</span>, bukan
                    &ldquo;persen dari skor&rdquo;. Skor TOPSIS berbentuk rasio sehingga tidak bisa
                    dipecah secara penjumlahan — menyebutnya &ldquo;kriteria X menyumbang 42% dari skor&rdquo;
                    keliru secara matematis.
                  </p>
                </div>

                <div className="mt-6 flex flex-col divide-y divide-[var(--hairline)] text-[12px]">
                  {[
                    ["Kelompok", baris.cluster_label],
                    ["Hash NIK kepala keluarga", `${baris.nik_kk_hash.slice(0, 14)}···`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="text-ink-3">{k}</span>
                      <span className="font-mono text-ink-2">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
