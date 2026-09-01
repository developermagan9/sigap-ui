"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputCls } from "@/components/form/Field";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Check } from "@/components/ui/Icons";
import { updatePeriode } from "@/lib/actions";

/**
 * Pengaturan alokasi dana — pagu dan nominal per keluarga.
 *
 * Skema alokasi sengaja tidak bisa dipilih di sini: setiap keluarga yang lolos
 * cutoff selalu dapat nominal yang sama rata (skema `flat`, satu-satunya yang
 * dipakai sistem ini). Biaya operasional juga sengaja tidak ada — seluruh pagu
 * disalurkan penuh, dikirim sebagai 0.
 *
 * Backend sudah punya `PATCH /periode-program/:id` untuk kolom-kolom ini
 * (lihat `updatePeriode` di lib/actions.ts), tapi hanya diterima selama
 * `status === 'draft'` — begitu clustering pertama kali dijalankan, pagu
 * terkunci dan nominal baru bisa diubah lagi lewat "Jalankan ranking &
 * alokasi" di panel simulasi (RuangKerja), bukan di sini. Komponen ini karena
 * itu hanya dirender halaman pemanggil saat draft.
 */
export function PengaturanAlokasi({
  periodeId,
  awal,
}: {
  periodeId: string;
  awal: {
    anggaranTotal: number;
    nominalDasar: number;
  };
}) {
  const router = useRouter();
  const [anggaran, setAnggaran] = useState(awal.anggaranTotal);
  const [nominalDasar, setNominalDasar] = useState(awal.nominalDasar);
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [sukses, setSukses] = useState(false);

  const lengkap = anggaran > 0 && nominalDasar > 0;
  const berubah = anggaran !== awal.anggaranTotal || nominalDasar !== awal.nominalDasar;

  const simpan = async () => {
    setMengirim(true);
    setGalat(null);
    setSukses(false);
    try {
      await updatePeriode(periodeId, {
        anggaran_total: anggaran,
        biaya_operasional: 0,
        nominal_dasar: nominalDasar,
        skema_alokasi: "flat",
      });
      setSukses(true);
      router.refresh();
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal menyimpan pengaturan alokasi.");
    } finally {
      setMengirim(false);
    }
  };

  return (
    <div className="rounded-2xl bg-paper-2 p-6 ring-1 ring-[var(--hairline)] sm:p-7">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3">
        Pengaturan alokasi dana
      </p>
      <p className="mt-3 max-w-2xl text-[12px] leading-[1.65] text-ink-3">
        Seluruh pagu disalurkan, dibagi rata ke setiap keluarga yang lolos cutoff. Hanya bisa
        diubah selama periode berstatus draft — begitu clustering pertama kali dijalankan, pagu
        terkunci. Nominal per keluarga masih bisa disetel ulang lewat panel simulasi di bawah
        selama periode belum disahkan.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Pagu anggaran (Rp)" wajib>
          <input
            type="number"
            min={0}
            className={inputCls}
            value={anggaran}
            onChange={(e) => setAnggaran(e.target.value === "" ? 0 : +e.target.value)}
          />
        </Field>

        <Field label="Nominal dasar per keluarga (Rp)" wajib>
          <input
            type="number"
            min={0}
            className={inputCls}
            value={nominalDasar}
            onChange={(e) => setNominalDasar(e.target.value === "" ? 0 : +e.target.value)}
          />
        </Field>
      </div>

      {nominalDasar > 0 && (
        <p className="mt-5 text-[12px] text-ink-3">
          Perkiraan kuota:{" "}
          <span className="font-mono text-ink">
            {Math.max(0, Math.floor(anggaran / nominalDasar))} penerima
          </span>
        </p>
      )}

      {galat && <p className="mt-4 text-[12px] leading-6 text-clay">{galat}</p>}
      {sukses && !berubah && (
        <p className="mt-4 text-[12px] leading-6 text-sage">Pengaturan alokasi tersimpan.</p>
      )}

      <div className="mt-6">
        <LoadingButton
          onClick={simpan}
          loading={mengirim}
          disabled={!lengkap || !berubah}
          icon={<Check className="h-4 w-4" />}
        >
          Simpan pengaturan alokasi
        </LoadingButton>
      </div>
    </div>
  );
}
