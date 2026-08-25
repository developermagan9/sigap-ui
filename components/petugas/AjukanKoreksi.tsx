"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ajukanSanggahan } from "@/lib/actions";
import { Alert, Check } from "@/components/ui/Icons";
import { LoadingButton } from "@/components/ui/LoadingButton";

/**
 * Jalur sanggahan/koreksi data (01-PRD.md, 07-Security-Privacy-Ethics.md §4.4) —
 * mengusulkan pendapatan per kapita baru, bukan mengubah skor secara langsung.
 * Verifikator yang menyetujui, dan re-kalkulasi TOPSIS terjadi otomatis di run
 * berikutnya karena run-topsis selalu membaca data rumah tangga terkini.
 */
export function AjukanKoreksi({ rumahTanggaId, pendapatanSaatIni }: { rumahTanggaId: string; pendapatanSaatIni: number }) {
  const router = useRouter();
  const [buka, setBuka] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [pendapatanBaru, setPendapatanBaru] = useState("");
  const [mengirim, setMengirim] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [terkirim, setTerkirim] = useState(false);

  const bisaKirim = alasan.trim().length > 0 && !!pendapatanBaru && +pendapatanBaru >= 0;

  const kirim = async () => {
    setMengirim(true);
    setError(null);
    try {
      await ajukanSanggahan(rumahTanggaId, alasan, { pendapatan_per_kapita: +pendapatanBaru });
      setTerkirim(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim sanggahan.");
    } finally {
      setMengirim(false);
    }
  };

  if (terkirim) {
    return (
      <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-sage">
        <Check className="h-3 w-3" /> Sanggahan terkirim, menunggu verifikator.
      </p>
    );
  }

  if (!buka) {
    return (
      <button
        type="button"
        onClick={() => setBuka(true)}
        className="mt-3 text-[11px] font-medium text-ink-3 underline decoration-[var(--hairline-strong)] underline-offset-2 transition-colors hover:text-ink"
      >
        Ajukan koreksi data
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl bg-paper-2 p-4 ring-1 ring-[var(--hairline)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">Ajukan koreksi</p>
      <label className="mt-3 block">
        <span className="text-[11px] text-ink-3">Alasan</span>
        <textarea
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          rows={2}
          placeholder="mis. Pendapatan sudah turun sejak kepala keluarga di-PHK bulan lalu"
          className="mt-1.5 w-full rounded border border-[var(--color-line)] bg-card px-3 py-2 text-[12px] text-ink outline-none focus:border-[var(--color-primary)]"
        />
      </label>
      <label className="mt-3 block">
        <span className="text-[11px] text-ink-3">Pendapatan per kapita baru (saat ini {pendapatanSaatIni.toLocaleString("id-ID")})</span>
        <input
          value={pendapatanBaru}
          onChange={(e) => setPendapatanBaru(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          placeholder="450000"
          className="mt-1.5 w-full rounded border border-[var(--color-line)] bg-card px-3 py-2 font-mono text-[12px] text-ink outline-none focus:border-[var(--color-primary)]"
        />
      </label>
      {error && (
        <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-clay">
          <Alert className="h-3 w-3" /> {error}
        </p>
      )}
      <div className="mt-3 flex items-center gap-3">
        <LoadingButton
          type="button"
          onClick={kirim}
          loading={mengirim}
          disabled={!bisaKirim}
          className="!px-3 !py-1.5 text-[11px]"
        >
          Kirim sanggahan
        </LoadingButton>
        <button
          type="button"
          onClick={() => setBuka(false)}
          disabled={mengirim}
          className="text-[11px] text-ink-4 hover:text-ink"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
