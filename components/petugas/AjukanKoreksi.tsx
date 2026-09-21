"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ajukanSanggahan, getDetailRumahTangga } from "@/lib/actions";
import type { AnggotaKeluarga } from "@/lib/api";
import { Alert, Check, Cross } from "@/components/ui/Icons";
import { LoadingButton } from "@/components/ui/LoadingButton";

type Anggota = Omit<AnggotaKeluarga, "id">;

const HUBUNGAN: [Anggota["hubungan"], string][] = [
  ["kepala", "Kepala keluarga"],
  ["istri_suami", "Istri/suami"],
  ["anak", "Anak"],
  ["orang_tua", "Orang tua"],
  ["famili_lain", "Famili lain"],
];

const ANGGOTA_KOSONG: Anggota = {
  nama: "",
  nik: "",
  hubungan: "anak",
  tanggal_lahir: "",
  status_disabilitas: false,
  is_tanggungan: true,
};

/**
 * Aturan yang sama dengan backend (`AnggotaDto` + validasi saat sanggahan diterima):
 * tepat satu kepala, NIK 16 digit, tidak ada NIK ganda. Dicek di sini supaya petugas
 * tahu salahnya sebelum usulan menunggu verifikator hanya untuk ditolak.
 */
export function galatAnggota(daftar: Anggota[]): string | null {
  if (daftar.length === 0) return "Minimal satu anggota keluarga.";
  const kepala = daftar.filter((a) => a.hubungan === "kepala").length;
  if (kepala !== 1) return `Harus tepat satu kepala keluarga (sekarang ${kepala}).`;
  for (const [i, a] of daftar.entries()) {
    if (!a.nama.trim()) return `Anggota #${i + 1}: nama kosong.`;
    if (!/^\d{16}$/.test(a.nik)) return `Anggota #${i + 1}: NIK harus 16 digit.`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.tanggal_lahir)) return `Anggota #${i + 1}: tanggal lahir belum diisi.`;
  }
  const nik = daftar.map((a) => a.nik);
  if (new Set(nik).size !== nik.length) return "Ada NIK yang sama di dua anggota.";
  return null;
}

/**
 * Jalur sanggahan/koreksi data (01-PRD.md, 07-Security-Privacy-Ethics.md §4.4) —
 * mengusulkan data mentah baru (pendapatan per kapita dan/atau susunan keluarga),
 * bukan mengubah skor secara langsung. Verifikator yang menyetujui; jumlah
 * tanggungan & disabilitas/lansia dihitung ulang server dari daftar anggota, dan
 * re-kalkulasi TOPSIS terjadi di run berikutnya.
 */
export function AjukanKoreksi({ rumahTanggaId, pendapatanSaatIni }: { rumahTanggaId: string; pendapatanSaatIni: number }) {
  const router = useRouter();
  const [buka, setBuka] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [pendapatanBaru, setPendapatanBaru] = useState("");
  const [anggota, setAnggota] = useState<Anggota[] | null>(null);
  const [memuatAnggota, setMemuatAnggota] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [terkirim, setTerkirim] = useState(false);

  const galatSusunan = anggota ? galatAnggota(anggota) : null;
  const adaUsulan = !!pendapatanBaru || !!anggota;
  const bisaKirim = alasan.trim().length > 0 && adaUsulan && !galatSusunan;

  const muatAnggota = async () => {
    setMemuatAnggota(true);
    setError(null);
    try {
      // Tercatat LIHAT_PII — hanya dipanggil saat petugas memilih mengoreksi susunan keluarga.
      const detail = await getDetailRumahTangga(rumahTanggaId);
      setAnggota(
        detail.anggota.map(({ id: _id, ...a }) => ({ ...a, tanggal_lahir: a.tanggal_lahir.slice(0, 10) })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat susunan keluarga.");
    } finally {
      setMemuatAnggota(false);
    }
  };

  const ubah = (i: number, patch: Partial<Anggota>) =>
    setAnggota((d) => d && d.map((a, j) => (j === i ? { ...a, ...patch } : a)));

  const kirim = async () => {
    setMengirim(true);
    setError(null);
    try {
      const dataBaru: Record<string, unknown> = {};
      if (pendapatanBaru) dataBaru.pendapatan_per_kapita = +pendapatanBaru;
      if (anggota) dataBaru.anggota = anggota.map((a) => ({ ...a, nama: a.nama.trim() }));
      await ajukanSanggahan(rumahTanggaId, alasan, dataBaru);
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

  const inputCls =
    "mt-1.5 w-full rounded border border-[var(--color-line)] bg-card px-3 py-2 text-[12px] text-ink outline-none focus:border-[var(--color-primary)]";
  const selCls =
    "w-full rounded border border-[var(--color-line)] bg-card px-2 py-1.5 text-[12px] text-ink outline-none focus:border-[var(--color-primary)]";

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
          className={inputCls}
        />
      </label>
      <label className="mt-3 block">
        <span className="text-[11px] text-ink-3">
          Pendapatan per kapita baru (saat ini {pendapatanSaatIni.toLocaleString("id-ID")}) — kosongkan bila tidak berubah
        </span>
        <input
          value={pendapatanBaru}
          onChange={(e) => setPendapatanBaru(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          placeholder="450000"
          className={`${inputCls} font-mono`}
        />
      </label>

      <div className="mt-4">
        <span className="text-[11px] text-ink-3">Susunan keluarga</span>
        {!anggota ? (
          <div className="mt-1.5">
            <LoadingButton
              type="button"
              variant="ghost"
              onClick={muatAnggota}
              loading={memuatAnggota}
              className="!px-3 !py-1.5 text-[11px]"
            >
              Koreksi anggota keluarga
            </LoadingButton>
          </div>
        ) : (
          <div className="mt-2 space-y-3">
            {anggota.map((a, i) => (
              <fieldset key={i} className="rounded-lg bg-card p-3 ring-1 ring-[var(--hairline)]" aria-label={`Anggota ${i + 1}`}>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input aria-label="Nama" value={a.nama} onChange={(e) => ubah(i, { nama: e.target.value })} placeholder="Nama" className={selCls} />
                  <input
                    aria-label="NIK"
                    value={a.nik}
                    onChange={(e) => ubah(i, { nik: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                    inputMode="numeric"
                    placeholder="NIK 16 digit"
                    className={`${selCls} font-mono`}
                  />
                  <select aria-label="Hubungan" value={a.hubungan} onChange={(e) => ubah(i, { hubungan: e.target.value as Anggota["hubungan"] })} className={selCls}>
                    {HUBUNGAN.map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  <input aria-label="Tanggal lahir" type="date" value={a.tanggal_lahir} onChange={(e) => ubah(i, { tanggal_lahir: e.target.value })} className={selCls} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-ink-2">
                  <label className="inline-flex items-center gap-1.5">
                    <input type="checkbox" checked={a.status_disabilitas} onChange={(e) => ubah(i, { status_disabilitas: e.target.checked })} />
                    Disabilitas
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    <input type="checkbox" checked={a.is_tanggungan} onChange={(e) => ubah(i, { is_tanggungan: e.target.checked })} />
                    Tanggungan
                  </label>
                  <button
                    type="button"
                    onClick={() => setAnggota((d) => d && d.filter((_, j) => j !== i))}
                    className="ml-auto inline-flex items-center gap-1 text-ink-4 hover:text-clay"
                  >
                    <Cross className="h-3 w-3" /> Hapus
                  </button>
                </div>
              </fieldset>
            ))}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setAnggota((d) => d && [...d, { ...ANGGOTA_KOSONG }])}
                className="text-[11px] font-medium text-ink-3 underline underline-offset-2 hover:text-ink"
              >
                + Tambah anggota
              </button>
              <button type="button" onClick={() => setAnggota(null)} className="text-[11px] text-ink-4 hover:text-ink">
                Batalkan koreksi susunan
              </button>
            </div>
            {galatSusunan && (
              <p className="flex items-center gap-1.5 text-[11px] text-clay">
                <Alert className="h-3 w-3" /> {galatSusunan}
              </p>
            )}
          </div>
        )}
      </div>

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
