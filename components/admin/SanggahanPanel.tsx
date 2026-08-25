"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reviewSanggahan } from "@/lib/actions";
import { Check, Cross, Alert } from "@/components/ui/Icons";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { waktu, angka } from "@/lib/format";

export type SanggahanRow = {
  id: string;
  rumahTanggaId: string;
  alasan: string;
  dataBaru: Record<string, unknown>;
  status: "pending" | "diterima" | "ditolak";
  catatanReview: string | null;
  createdAt: string;
  reviewedAt: string | null;
  rumahTangga: { id: string; wilayahId: string; statusVerifikasi: string; periodeId: string | null };
  diajukanOleh: { id: string; nama: string; username: string; role: string };
  ditinjauOleh: { id: string; nama: string; username: string; role: string } | null;
};

const LABEL_FIELD: Record<string, string> = {
  pendapatan_per_kapita: "Pendapatan per kapita",
  skor_kondisi_rumah: "Kondisi rumah",
  skor_akses_pendidikan: "Akses pendidikan",
  riwayat_bansos_sebelumnya: "Riwayat bansos",
  wilayah_id: "Wilayah",
};

function ringkasDataBaru(dataBaru: Record<string, unknown>) {
  return Object.entries(dataBaru)
    .map(([k, v]) => `${LABEL_FIELD[k] ?? k}: ${typeof v === "number" ? angka(v) : String(v)}`)
    .join(" · ");
}

export function SanggahanPanel({ items }: { items: SanggahanRow[] }) {
  const pending = items.filter((r) => r.status === "pending");
  const riwayat = items.filter((r) => r.status !== "pending");

  return (
    <div className="flex flex-col gap-8">
      <section>
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink-3">Menunggu review · {pending.length}</p>
        {pending.length === 0 ? (
          <p className="mt-4 text-[13px] text-ink-3">Tidak ada sanggahan yang menunggu.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {pending.map((r) => (
              <Baris key={r.id} r={r} />
            ))}
          </div>
        )}
      </section>

      {riwayat.length > 0 && (
        <section className="border-t border-[var(--hairline)] pt-7">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink-3">Riwayat</p>
          <div className="mt-4 flex flex-col gap-3">
            {riwayat.map((r) => (
              <div key={r.id} className="rounded-xl bg-paper-2 p-4 text-[12px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-ink-3">{r.rumahTanggaId.slice(0, 8)}</span>
                  <span className={r.status === "diterima" ? "text-sage" : "text-clay"}>
                    {r.status === "diterima" ? "Diterima" : "Ditolak"}
                  </span>
                </div>
                <p className="mt-1.5 text-ink-3">{ringkasDataBaru(r.dataBaru)}</p>
                {r.catatanReview && <p className="mt-1 text-ink-4">Catatan: {r.catatanReview}</p>}
                <p className="mt-1 text-ink-4">
                  oleh {r.ditinjauOleh?.nama ?? "—"} · {waktu(r.reviewedAt)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Baris({ r }: { r: SanggahanRow }) {
  const router = useRouter();
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState<"diterima" | "ditolak" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const putuskan = async (status: "diterima" | "ditolak") => {
    setLoading(status);
    setError(null);
    try {
      await reviewSanggahan(r.id, status, catatan || undefined);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses sanggahan.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <span className="font-mono text-[12px] text-ink-3">{r.rumahTanggaId.slice(0, 8)}</span>
          <span className="ml-3 text-[11px] text-ink-4">
            diajukan {r.diajukanOleh?.nama} · {waktu(r.createdAt)}
          </span>
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{r.alasan}</p>
      <p className="mt-2 text-[12px] font-medium text-ink">Usulan: {ringkasDataBaru(r.dataBaru)}</p>

      <label className="mt-4 block">
        <span className="text-[11px] text-ink-3">Catatan review (opsional)</span>
        <input
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="mis. Sesuai hasil kunjungan lapangan ulang"
          className="mt-1.5 w-full rounded border border-[var(--color-line)] bg-paper-2 px-3 py-2 text-[12px] text-ink outline-none focus:border-[var(--color-primary)]"
        />
      </label>

      {error && (
        <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-clay">
          <Alert className="h-3 w-3" /> {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <LoadingButton
          type="button"
          onClick={() => putuskan("diterima")}
          loading={loading === "diterima"}
          disabled={loading !== null}
          icon={<Check className="h-[15px] w-[15px]" />}
          className="!px-3.5 !py-2 text-[12px]"
        >
          Terima
        </LoadingButton>
        <LoadingButton
          type="button"
          variant="ghost"
          onClick={() => putuskan("ditolak")}
          loading={loading === "ditolak"}
          disabled={loading !== null}
          icon={<Cross className="h-[15px] w-[15px]" />}
          className="!px-3.5 !py-2 text-[12px]"
        >
          Tolak
        </LoadingButton>
      </div>
    </div>
  );
}
