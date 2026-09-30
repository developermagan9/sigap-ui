"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { tandaiNotifikasiDibaca, tandaiSemuaNotifikasiDibaca } from "@/lib/actions";
import type { NotifikasiRow } from "@/lib/api";
import { waktu } from "@/lib/format";

/** Daftar notifikasi in-app milik pengguna, dengan tombol tandai dibaca. */
export function DaftarNotifikasi({ data, belumDibaca }: { data: NotifikasiRow[]; belumDibaca: number }) {
  const router = useRouter();
  const [memproses, mulai] = useTransition();

  const jalankan = (aksi: () => Promise<unknown>) =>
    mulai(async () => {
      await aksi();
      router.refresh();
    });

  if (data.length === 0) {
    return <p className="text-[13px] text-[var(--color-ink-3)]">Belum ada notifikasi.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {belumDibaca > 0 && (
        <div>
          <Button variant="ghost" disabled={memproses} onClick={() => jalankan(tandaiSemuaNotifikasiDibaca)}>
            Tandai semua dibaca ({belumDibaca})
          </Button>
        </div>
      )}
      <ul className="flex flex-col gap-3">
        {data.map((n) => (
          <li
            key={n.id}
            data-testid="notifikasi"
            className={`rule-card flex flex-wrap items-start justify-between gap-3 p-5 ${n.dibacaAt ? "" : "border-l-4 border-l-[var(--color-primary)]"}`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-[var(--color-ink)]">{n.judul}</p>
              <p className="mt-1 text-[13px] leading-6 text-[var(--color-ink-2)]">{n.pesan}</p>
              <p className="mt-2 text-[11px] text-[var(--color-ink-4)]">{waktu(n.createdAt)}</p>
            </div>
            {!n.dibacaAt && (
              <button
                type="button"
                disabled={memproses}
                onClick={() => jalankan(() => tandaiNotifikasiDibaca(n.id))}
                className="text-[12px] text-[var(--color-ink-2)] underline underline-offset-2 disabled:opacity-40"
              >
                Tandai dibaca
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
