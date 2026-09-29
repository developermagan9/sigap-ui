"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hapusPeriode, pilihPeriode } from "@/lib/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ArrowRight, Check, Cross } from "@/components/ui/Icons";
import { angka, rupiah, rupiahRingkas, waktu } from "@/lib/format";
import type { PeriodeProgram } from "@/lib/api";

const STATUS: Record<string, { label: string; tone: "ink" | "sage" | "clay" | "gold" }> = {
  draft: { label: "Draft", tone: "ink" },
  clustering: { label: "Clustering", tone: "gold" },
  ranking: { label: "Ranking", tone: "gold" },
  alokasi: { label: "Alokasi", tone: "gold" },
  reviewed: { label: "Direview", tone: "sage" },
  approved: { label: "Disetujui", tone: "sage" },
  disbursed: { label: "Tersalurkan", tone: "sage" },
};

/**
 * Daftar seluruh periode program, dengan periode yang sedang aktif ditandai.
 *
 * Sebelumnya satu-satunya cara melihat/berpindah periode adalah dropdown kecil
 * di topbar (dihapus atas permintaan pengguna) — begitu dihapus, tidak ada lagi
 * halaman yang menampilkan daftarnya sama sekali, padahal beberapa halaman
 * admin (Konfigurasi Bobot, Hasil Ranking, Verifikasi, dst) diam-diam mengikuti
 * "periode aktif" itu. Halaman ini menggantikannya dengan tampilan penuh:
 * status, pagu, alokasi tiap periode, dan tombol untuk berpindah periode aktif.
 */
export function DaftarPeriode({ daftar, aktifId }: { daftar: PeriodeProgram[]; aktifId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [akanDihapus, setAkanDihapus] = useState<PeriodeProgram | null>(null);
  const [menghapus, setMenghapus] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const hapus = async () => {
    if (!akanDihapus) return;
    setMenghapus(true);
    setGalat(null);
    try {
      await hapusPeriode(akanDihapus.id);
      setAkanDihapus(null);
      router.refresh();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal menghapus periode.");
    } finally {
      setMenghapus(false);
    }
  };

  return (
    <>
    <ul className="flex flex-col gap-3">
      {daftar.map((p) => {
        const aktif = p.id === aktifId;
        const status = STATUS[p.status] ?? { label: p.status, tone: "ink" as const };
        return (
          <li
            key={p.id}
            className={`rounded-2xl p-5 ring-1 transition-colors sm:p-6 ${
              aktif ? "bg-sage-soft/40 ring-sage/25" : "bg-paper-2 ring-[var(--hairline)]"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-display text-[1.15rem] leading-tight tracking-[-0.01em]">
                    {p.namaProgram}
                  </h3>
                  <Eyebrow tone={status.tone}>{status.label}</Eyebrow>
                  {aktif && <Eyebrow tone="sage">Periode aktif</Eyebrow>}
                </div>
                <p className="mt-2 text-[12px] text-ink-3">Dibuat {waktu(p.createdAt)}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {p.status === "draft" && (
                  <button
                    onClick={() => {
                      setGalat(null);
                      setAkanDihapus(p);
                    }}
                    className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] text-[var(--color-alert)]
                      ring-1 ring-[var(--hairline)] transition-all duration-500
                      ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink/[0.05] active:scale-[0.97]"
                  >
                    <Cross className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                )}
                {!aktif && (
                  <button
                    onClick={() => startTransition(() => void pilihPeriode(p.id))}
                    disabled={pending}
                    className="flex items-center gap-1.5 rounded-full bg-ink/[0.05] px-3.5 py-1.5 text-[12px]
                      ring-1 ring-[var(--hairline)] transition-all duration-500
                      ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink/[0.09] active:scale-[0.97]
                      disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Jadikan aktif
                  </button>
                )}
                <Link
                  href={`/admin/periode/${p.id}`}
                  className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[12px] text-white
                    transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[var(--color-ink-2)]
                    active:scale-[0.97]"
                >
                  Buka
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { l: "Pagu", v: rupiahRingkas(p.anggaranTotal) },
                { l: "Total alokasi", v: p.totalAlokasi != null ? rupiahRingkas(p.totalAlokasi) : "—" },
                { l: "Kuota penerima", v: p.kuotaPenerima != null ? `${angka(p.kuotaPenerima)} KK` : "—" },
                { l: "Nominal per KK", v: rupiah(p.nominalDasar) },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-ink-4">{s.l}</p>
                  <p className="mt-1 font-mono text-[13px] tnum text-ink">{s.v}</p>
                </div>
              ))}
            </div>
          </li>
        );
      })}
    </ul>

    <ConfirmDialog
      open={!!akanDihapus}
      onClose={() => !menghapus && setAkanDihapus(null)}
      onConfirm={hapus}
      loading={menghapus}
      tone="danger"
      title={`Hapus periode "${akanDihapus?.namaProgram ?? ""}"?`}
      description="Hanya periode draft yang belum berisi data rumah tangga yang bisa dihapus. Penghapusan tercatat di jejak audit."
      confirmLabel="Ya, hapus"
    >
      {galat && <p className="mt-3 text-[12px] leading-[1.6] text-[var(--color-alert)]">{galat}</p>}
    </ConfirmDialog>
    </>
  );
}
