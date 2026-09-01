"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputCls } from "@/components/form/Field";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { ArrowRight } from "@/components/ui/Icons";
import { KRITERIA_LABEL } from "@/components/admin/AdminShared";
import { createPeriode } from "@/lib/actions";
import { persen, rupiah } from "@/lib/format";

/** Bobot awal sesuai tabel default 05-Algorithm-Design.md §4.2 (Σ = 1.0). */
const BOBOT_AWAL: Record<string, number> = {
  pendapatanPerKapita: 0.35,
  jumlahTanggungan: 0.25,
  jumlahDisabilitasLansia: 0.2,
  skorKondisiRumah: 0.2,
};

const SKEMA = [
  { key: "flat", label: "Flat — nominal seragam", hint: "Direkomendasikan: mudah dipertanggungjawabkan, tidak membocorkan peringkat kemiskinan." },
  { key: "berjenjang", label: "Berjenjang — per tingkat cluster", hint: "Nominal dikalikan faktor cluster; membocorkan label cluster penerima." },
  { key: "proporsional", label: "Proporsional — sebanding skor", hint: "Tidak direkomendasikan: nominal membocorkan skor individu ke ledger publik." },
];

/**
 * Form pembuatan periode program baru (item D).
 *
 * Backend sudah memvalidasi Σ bobot = 1.0 (periode-program.service.ts create()),
 * tapi divalidasi juga di sini supaya admin tahu sebelum mengirim — bukan
 * pengganti validasi server.
 */
export function FormPeriode() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [anggaran, setAnggaran] = useState<number | "">("");
  const [biayaOps, setBiayaOps] = useState<number | "">(0);
  const [kCluster, setKCluster] = useState(4);
  const [nominalDasar, setNominalDasar] = useState<number | "">(500000);
  const [skema, setSkema] = useState("flat");
  const [bobot, setBobot] = useState<Record<string, number>>(BOBOT_AWAL);
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const totalBobot = Object.values(bobot).reduce((s, v) => s + v, 0);
  const bobotValid = Math.abs(totalBobot - 1) < 1e-9;
  const anggaranEfektif = Number(anggaran || 0) - Number(biayaOps || 0);
  const perkiraanKuota =
    skema === "flat" && Number(nominalDasar) > 0
      ? Math.floor(anggaranEfektif / Number(nominalDasar))
      : null;

  const lengkap =
    nama.trim().length > 0 && Number(anggaran) > 0 && Number(nominalDasar) > 0 && bobotValid && anggaranEfektif > 0;

  const kirim = async () => {
    setMengirim(true);
    setGalat(null);
    try {
      const periode = await createPeriode({
        nama_program: nama.trim(),
        anggaran_total: Number(anggaran),
        biaya_operasional: Number(biayaOps || 0),
        k_cluster: kCluster,
        bobot_kriteria: bobot,
        skema_alokasi: skema,
        nominal_dasar: Number(nominalDasar),
      });
      router.push(`/admin/periode/${periode.id}`);
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal membuat periode program.");
      setMengirim(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <section className="rule-card p-6 sm:p-8 lg:col-span-7">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Identitas program</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nama program" wajib hint="mis. BLT Desa — Kecamatan Sukamaju">
              <input
                className={inputCls}
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama periode program bansos"
              />
            </Field>
          </div>

          <Field label="Anggaran total (Rp)" wajib>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={anggaran}
              onChange={(e) => setAnggaran(e.target.value === "" ? "" : +e.target.value)}
            />
          </Field>

          <Field label="Biaya operasional (Rp)" hint="0 = dana disalurkan penuh">
            <input
              type="number"
              min={0}
              className={inputCls}
              value={biayaOps}
              onChange={(e) => setBiayaOps(e.target.value === "" ? "" : +e.target.value)}
            />
          </Field>

          <Field label="Nominal dasar per KK (Rp)" wajib>
            <input
              type="number"
              min={0}
              className={inputCls}
              value={nominalDasar}
              onChange={(e) => setNominalDasar(e.target.value === "" ? "" : +e.target.value)}
            />
          </Field>

          <Field label="Jumlah cluster (k)" hint="2–8">
            <input
              type="number"
              min={2}
              max={8}
              className={inputCls}
              value={kCluster}
              onChange={(e) => setKCluster(+e.target.value)}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Skema alokasi">
              <div className="flex flex-col gap-2">
                {SKEMA.map((s) => (
                  <label
                    key={s.key}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-[13px] ${
                      skema === s.key
                        ? "border-[var(--color-primary)] bg-white"
                        : "border-[var(--color-line)] bg-[var(--color-paper-2)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="skema"
                      className="mt-1"
                      checked={skema === s.key}
                      onChange={() => setSkema(s.key)}
                    />
                    <span>
                      <span className="block text-[var(--color-ink)]">{s.label}</span>
                      <span className="mt-1 block text-[12px] leading-5 text-[var(--color-ink-3)]">{s.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </Field>
          </div>
        </div>
      </section>

      <section className="rule-card p-6 sm:p-8 lg:col-span-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Bobot kriteria awal</p>
        <p className="mt-3 text-[12px] leading-6 text-[var(--color-ink-3)]">
          Bisa diubah lagi nanti di halaman Konfigurasi Bobot sebelum ranking dijalankan.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {Object.entries(bobot).map(([key, nilai]) => (
            <label key={key} className="block">
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-[12px]">{KRITERIA_LABEL[key] ?? key}</span>
                <span className="font-mono text-[12px] tnum">{persen(nilai, 0)}</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(nilai * 100)}
                onChange={(e) => setBobot((b) => ({ ...b, [key]: +e.target.value / 100 }))}
                className="mt-2 w-full accent-[var(--color-primary)]"
              />
            </label>
          ))}
        </div>

        <p
          className={`mt-5 text-[12px] ${bobotValid ? "text-[var(--color-ink-3)]" : "text-[var(--color-alert)]"}`}
        >
          Total bobot {persen(totalBobot, 0)} — {bobotValid ? "valid" : "harus tepat 100%"}
        </p>

        <div className="mt-6 border-t border-[var(--color-line)] pt-5 text-[12px] text-[var(--color-ink-3)]">
          <p>
            Anggaran efektif: <span className="font-mono text-[var(--color-ink)]">{rupiah(anggaranEfektif)}</span>
          </p>
          {perkiraanKuota !== null && (
            <p className="mt-1">
              Perkiraan kuota flat:{" "}
              <span className="font-mono text-[var(--color-ink)]">{perkiraanKuota} penerima</span>
            </p>
          )}
        </div>

        {galat && <p className="mt-5 text-[12px] leading-6 text-[var(--color-alert)]">{galat}</p>}

        <div className="mt-6">
          <LoadingButton
            onClick={kirim}
            loading={mengirim}
            disabled={!lengkap}
            icon={<ArrowRight className="h-4 w-4" />}
          >
            Buat periode program
          </LoadingButton>
        </div>
      </section>
    </div>
  );
}
