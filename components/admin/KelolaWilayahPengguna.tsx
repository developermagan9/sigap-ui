"use client";

import { useState, useTransition } from "react";
import { inputCls } from "@/components/form/Field";
import { Button } from "@/components/ui/Button";
import { Cross } from "@/components/ui/Icons";
import { hapusWilayahPengguna, tambahWilayahPengguna } from "@/lib/actions";
import type { PenggunaRow, WilayahRow } from "@/lib/api";

const labelWilayah = (w: { desa: string; kecamatan: string }) => `${w.desa}, ${w.kecamatan}`;

/** Satu kartu user: wilayah utama (tetap) + chip wilayah tambahan yang bisa dicabut. */
function KartuPengguna({ user, semuaWilayah }: { user: PenggunaRow; semuaWilayah: WilayahRow[] }) {
  const [pilihan, setPilihan] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [memproses, mulai] = useTransition();

  const dimiliki = new Set([user.wilayah?.id, ...user.wilayah_tambahan.map((w) => w.id)]);
  const tersedia = semuaWilayah.filter((w) => !dimiliki.has(w.id));

  const jalankan = (aksi: () => Promise<unknown>) => {
    setGalat(null);
    mulai(async () => {
      try {
        await aksi();
        setPilihan("");
      } catch (e) {
        setGalat(e instanceof Error ? e.message : "Aksi gagal.");
      }
    });
  };

  return (
    <li className="rule-card p-5" data-testid={`pengguna-${user.username}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-[14px] font-medium text-[var(--color-ink)]">{user.nama}</p>
          <p className="font-mono text-[12px] text-[var(--color-ink-3)]">
            {user.username} · {user.role}
            {!user.isActive && " · nonaktif"}
          </p>
        </div>
        <p className="text-[12px] text-[var(--color-ink-3)]">
          Wilayah utama:{" "}
          <span className="text-[var(--color-ink-2)]">{user.wilayah ? labelWilayah(user.wilayah) : "—"}</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {user.wilayah_tambahan.length === 0 && (
          <span className="text-[12px] text-[var(--color-ink-4)]">Belum ada wilayah tambahan.</span>
        )}
        {user.wilayah_tambahan.map((w) => (
          <span
            key={w.id}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-paper-2)] py-1 pl-3 pr-1 text-[12px] text-[var(--color-ink-2)] ring-1 ring-[var(--color-line)]"
          >
            {labelWilayah(w)}
            <button
              type="button"
              aria-label={`Cabut akses ${w.desa}`}
              disabled={memproses}
              onClick={() => jalankan(() => hapusWilayahPengguna(user.id, w.id))}
              className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--color-ink-3)] hover:bg-[var(--color-line)] disabled:opacity-40"
            >
              <Cross className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {tersedia.length > 0 && (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (pilihan) jalankan(() => tambahWilayahPengguna(user.id, pilihan));
          }}
        >
          <select
            aria-label={`Tambah wilayah untuk ${user.username}`}
            className={`${inputCls} sm:max-w-sm`}
            value={pilihan}
            onChange={(e) => setPilihan(e.target.value)}
          >
            <option value="">Pilih wilayah kerja…</option>
            {tersedia.map((w) => (
              <option key={w.id} value={w.id}>
                {labelWilayah(w)} — {w.kabupaten}
              </option>
            ))}
          </select>
          <Button type="submit" variant="ghost" disabled={!pilihan || memproses}>
            {memproses ? "Menyimpan…" : "Tambah akses"}
          </Button>
        </form>
      )}

      {galat && <p className="mt-3 text-[12px] leading-6 text-[var(--color-alert)]">{galat}</p>}
    </li>
  );
}

export function KelolaWilayahPengguna({ users, semuaWilayah }: { users: PenggunaRow[]; semuaWilayah: WilayahRow[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {users.map((u) => (
        <KartuPengguna key={u.id} user={u} semuaWilayah={semuaWilayah} />
      ))}
    </ul>
  );
}
