"use client";

import { useTransition } from "react";
import { pilihPeriode } from "@/lib/actions";
import { ClientIcon } from "./ClientIcon";

export type PeriodeOpsi = { id: string; namaProgram: string; status: string };

/**
 * Pemilih periode program (FE-5 / item O) — menggantikan konstanta
 * `PERIODE_AKTIF_ID` yang di-hardcode. Pilihan disimpan di cookie lewat Server
 * Action `pilihPeriode`, yang lalu me-revalidate seluruh pohon rute; tidak ada
 * state klien yang perlu disinkronkan antar halaman.
 */
export function PeriodeSwitcher({
  daftar,
  aktifId,
}: {
  daftar: PeriodeOpsi[];
  aktifId: string;
}) {
  const [pending, startTransition] = useTransition();

  // Satu periode saja: tidak ada yang bisa dipilih, tampilkan namanya saja
  // supaya admin tetap tahu data mana yang sedang dilihat.
  if (daftar.length === 0) return null;

  const aktif = daftar.find((p) => p.id === aktifId);

  return (
    <label className="hidden items-center gap-2 md:flex" title="Periode program yang sedang dilihat">
      <ClientIcon icon="ph:calendar-blank-duotone" className="text-base text-[var(--color-ink-3)]" />
      <span className="sr-only">Periode program</span>
      {daftar.length === 1 ? (
        <span className="max-w-[16rem] truncate text-[13px] text-[var(--color-ink-2)]">
          {aktif?.namaProgram ?? "—"}
        </span>
      ) : (
        <select
          value={aktifId}
          disabled={pending}
          onChange={(e) => {
            const id = e.target.value;
            startTransition(() => {
              void pilihPeriode(id);
            });
          }}
          className="max-w-[18rem] truncate rounded-md border border-[var(--color-line)] bg-white px-2 py-1.5 text-[13px] text-[var(--color-ink)] disabled:opacity-60"
        >
          {daftar.map((p) => (
            <option key={p.id} value={p.id}>
              {p.namaProgram} · {p.status}
            </option>
          ))}
        </select>
      )}
    </label>
  );
}
