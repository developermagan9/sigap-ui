"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bezel } from "@/components/ui/Bezel";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Field, inputCls, inputErrCls } from "./Field";
import { Alert, Check, Cross, Users } from "@/components/ui/Icons";
import { createRumahTangga } from "@/lib/actions";
import { PERIODE_AKTIF_ID } from "@/lib/constants";
import type { WilayahRow } from "@/lib/api";
import { rupiah } from "@/lib/format";

type Anggota = {
  id: number;
  nama: string;
  nik: string;
  hubungan: "kepala" | "istri_suami" | "anak" | "orang_tua" | "famili_lain";
  lahir: string;
  disabilitas: boolean;
  tanggungan: boolean;
};

const HUBUNGAN: { v: Anggota["hubungan"]; l: string }[] = [
  { v: "kepala", l: "Kepala keluarga" },
  { v: "istri_suami", l: "Istri / suami" },
  { v: "anak", l: "Anak" },
  { v: "orang_tua", l: "Orang tua" },
  { v: "famili_lain", l: "Famili lain" },
];

const umur = (lahir: string) => {
  if (!lahir) return null;
  const d = new Date(lahir);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 31_557_600_000);
};

export function FormPendataan({ wilayah }: { wilayah: WilayahRow[] }) {
  const router = useRouter();
  const [namaKepala, setNamaKepala] = useState("");
  const [nik, setNik] = useState("");
  const [noKk, setNoKk] = useState("");
  const [alamat, setAlamat] = useState("");
  const [wilayahId, setWilayahId] = useState(wilayah[0]?.id ?? "");
  const [pendapatan, setPendapatan] = useState("");
  const [rumah, setRumah] = useState(3);
  const [didik, setDidik] = useState(3);
  const [riwayat, setRiwayat] = useState(false);
  const [anggota, setAnggota] = useState<Anggota[]>([
    { id: 1, nama: "", nik: "", hubungan: "kepala", lahir: "", disabilitas: false, tanggungan: false },
  ]);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const galat = useMemo(() => {
    const g: Record<string, string> = {};

    if (nik && nik.length !== 16) g.nik = "NIK harus 16 digit.";
    if (noKk && noKk.length !== 16) g.noKk = "No. KK harus 16 digit.";

    const kepala = anggota.filter((a) => a.hubungan === "kepala");
    if (kepala.length !== 1) g.anggota = "Harus ada tepat satu anggota berstatus kepala keluarga.";
    else if (nik && kepala[0].nik && kepala[0].nik !== nik)
      g.anggota = "NIK anggota berstatus kepala keluarga harus sama dengan NIK kepala keluarga di atas.";
    else if (anggota.some((a) => !a.nama.trim()))
      g.anggota = "Setiap anggota keluarga harus punya nama.";

    const nikAnggota = anggota.map((a) => a.nik).filter(Boolean);
    if (new Set(nikAnggota).size !== nikAnggota.length)
      g.anggota = "Ada NIK anggota yang tercatat dua kali di kartu keluarga ini.";

    if (pendapatan && +pendapatan < 0) g.pendapatan = "Pendapatan tidak boleh negatif.";

    return g;
  }, [nik, noKk, anggota, pendapatan]);

  // Kolom turunan: dihitung sistem, tidak boleh diketik petugas
  const turunan = useMemo(() => {
    const tanggungan = anggota.filter((a) => a.tanggungan).length;
    const disabilitasLansia = anggota.filter((a) => {
      const u = umur(a.lahir);
      return a.disabilitas || (u !== null && u >= 60);
    }).length;
    const jiwa = anggota.length;
    const perKapita = pendapatan && jiwa > 0 ? Math.round(+pendapatan / jiwa) : 0;
    return { tanggungan, disabilitasLansia, jiwa, perKapita };
  }, [anggota, pendapatan]);

  const lengkap =
    namaKepala.trim().length > 0 &&
    alamat.trim().length > 0 &&
    nik.length === 16 &&
    noKk.length === 16 &&
    !!pendapatan &&
    !!wilayahId &&
    anggota.every((a) => a.nik.length === 16 && a.lahir && a.nama.trim());
  const bisaKirim = lengkap && Object.keys(galat).length === 0;

  const ubahAnggota = (id: number, patch: Partial<Anggota>) =>
    setAnggota((s) => s.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const kirim = async () => {
    setMengirim(true);
    setSubmitError(null);
    try {
      await createRumahTangga({
        nik_kepala_keluarga: nik,
        no_kk: noKk,
        nama_kepala_keluarga: namaKepala,
        alamat_detail: alamat,
        wilayah_id: wilayahId,
        pendapatan_per_kapita: turunan.perKapita,
        skor_kondisi_rumah: rumah,
        skor_akses_pendidikan: didik,
        riwayat_bansos_sebelumnya: riwayat,
        periode_id: PERIODE_AKTIF_ID,
        anggota: anggota.map((a) => ({
          nik: a.nik,
          nama: a.nama,
          hubungan: a.hubungan,
          tanggal_lahir: a.lahir,
          status_disabilitas: a.disabilitas,
          is_tanggungan: a.tanggungan,
        })),
      });
      setKonfirmasi(false);
      router.push("/petugas/riwayat");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal menyimpan data.");
    } finally {
      setMengirim(false);
    }
  };

  return (
    <section className="px-4 sm:px-8">
      <div className="mx-auto grid max-w-[78rem] grid-cols-1 gap-5 lg:grid-cols-12">
        {/* ---------- Formulir ---------- */}
        <div className="lg:col-span-7">
          <Bezel>
            <div className="p-7 sm:p-9">
              <Eyebrow>Data rumah tangga</Eyebrow>

              <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Nama kepala keluarga" wajib>
                  <input
                    value={namaKepala}
                    onChange={(e) => setNamaKepala(e.target.value)}
                    placeholder="Sesuai KTP"
                    className={inputCls}
                  />
                </Field>

                <Field label="NIK kepala keluarga" hint="16 digit" wajib error={galat.nik}>
                  <input
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    placeholder="99••••••••••••••"
                    inputMode="numeric"
                    className={galat.nik ? inputErrCls : inputCls}
                  />
                </Field>

                <Field label="Nomor kartu keluarga" hint="16 digit" wajib error={galat.noKk}>
                  <input
                    value={noKk}
                    onChange={(e) => setNoKk(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    placeholder="99••••••••••••••"
                    inputMode="numeric"
                    className={galat.noKk ? inputErrCls : inputCls}
                  />
                </Field>

                <Field label="Desa" wajib>
                  <select value={wilayahId} onChange={(e) => setWilayahId(e.target.value)} className={inputCls}>
                    {wilayah.map((w) => (
                      <option key={w.id} value={w.id}>{w.desa}</option>
                    ))}
                  </select>
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Alamat" wajib>
                    <input
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      placeholder="Jl. Contoh No. 1, RT/RW"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="Pendapatan rumah tangga" hint="per bulan" wajib error={galat.pendapatan}>
                  <input
                    value={pendapatan}
                    onChange={(e) => setPendapatan(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="2500000"
                    inputMode="numeric"
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Geser label="Kondisi rumah" nilai={rumah} set={setRumah} kiri="Tidak layak" kanan="Sangat layak" />
                <Geser label="Akses pendidikan anak" nilai={didik} set={setDidik} kiri="Terputus" kanan="Lancar" />
              </div>

              <label className="mt-6 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={riwayat}
                  onChange={(e) => setRiwayat(e.target.checked)}
                  className="h-4 w-4 rounded accent-[var(--color-sage)]"
                />
                <span className="text-[13px] text-ink-2">Pernah menerima bansos pada periode sebelumnya</span>
              </label>

              {/* ---------- Anggota keluarga ---------- */}
              <div className="mt-10 border-t border-[var(--hairline)] pt-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <Eyebrow>Anggota keluarga</Eyebrow>
                    <p className="mt-3 max-w-md text-[12px] leading-relaxed text-ink-3">
                      Jumlah tanggungan dan jumlah lansia/disabilitas dihitung dari daftar ini —
                      tidak bisa diketik manual, supaya angka yang masuk perhitungan selalu punya
                      identitas yang dapat diverifikasi.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setAnggota((s) => [
                        ...s,
                        { id: Math.max(0, ...s.map((a) => a.id)) + 1, nama: "", nik: "", hubungan: "anak", lahir: "", disabilitas: false, tanggungan: true },
                      ])
                    }
                    className="group flex items-center gap-2 rounded-full bg-ink/[0.05] px-4 py-2 text-[12px]
                      ring-1 ring-[var(--hairline)] transition-all duration-500
                      ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink/[0.09] active:scale-[0.97]"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Tambah anggota
                  </button>
                </div>

                {galat.anggota && (
                  <div className="mt-5 flex items-start gap-3 rounded-2xl bg-clay-soft p-4 ring-1 ring-clay/20">
                    <span className="mt-px text-clay"><Alert className="h-4 w-4" /></span>
                    <p className="text-[12px] leading-[1.6] text-ink-2">{galat.anggota}</p>
                  </div>
                )}

                <ul className="mt-6 flex flex-col gap-3">
                  {anggota.map((a, i) => {
                    const u = umur(a.lahir);
                    return (
                      <li key={a.id} className="rounded-2xl bg-paper-2 p-4 ring-1 ring-[var(--hairline)]">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-[11px] text-ink-4">
                            {String(i + 1).padStart(2, "0")}
                            {u !== null && <span className="ml-3 text-ink-3">{u} th{u >= 60 ? " · lansia" : ""}</span>}
                          </span>
                          {anggota.length > 1 && (
                            <button
                              onClick={() => setAnggota((s) => s.filter((x) => x.id !== a.id))}
                              aria-label="Hapus anggota"
                              className="flex h-6 w-6 items-center justify-center rounded-full text-ink-4
                                transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                                hover:bg-clay-soft hover:text-clay active:scale-90"
                            >
                              <Cross className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <input
                            value={a.nama}
                            onChange={(e) => ubahAnggota(a.id, { nama: e.target.value })}
                            placeholder="Nama anggota"
                            className="rounded-xl bg-card px-3 py-2.5 text-[12px] ring-1
                              ring-[var(--hairline)] outline-none transition-all duration-500
                              ease-[cubic-bezier(0.32,0.72,0,1)] focus:ring-sage/40"
                          />
                          <input
                            value={a.nik}
                            onChange={(e) => ubahAnggota(a.id, { nik: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                            placeholder="NIK anggota"
                            inputMode="numeric"
                            className="rounded-xl bg-card px-3 py-2.5 font-mono text-[12px] ring-1
                              ring-[var(--hairline)] outline-none transition-all duration-500
                              ease-[cubic-bezier(0.32,0.72,0,1)] focus:ring-sage/40"
                          />
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <select
                            value={a.hubungan}
                            onChange={(e) => ubahAnggota(a.id, { hubungan: e.target.value as Anggota["hubungan"] })}
                            className="rounded-xl bg-card px-3 py-2.5 text-[12px] ring-1 ring-[var(--hairline)]
                              outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                              focus:ring-sage/40"
                          >
                            {HUBUNGAN.map((h) => <option key={h.v} value={h.v}>{h.l}</option>)}
                          </select>
                          <input
                            type="date"
                            value={a.lahir}
                            onChange={(e) => ubahAnggota(a.id, { lahir: e.target.value })}
                            className="rounded-xl bg-card px-3 py-2.5 text-[12px] ring-1 ring-[var(--hairline)]
                              outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                              focus:ring-sage/40"
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-5">
                          {[
                            { k: "tanggungan" as const, l: "Tanggungan" },
                            { k: "disabilitas" as const, l: "Penyandang disabilitas" },
                          ].map((c) => (
                            <label key={c.k} className="flex cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={a[c.k]}
                                onChange={(e) => ubahAnggota(a.id, { [c.k]: e.target.checked })}
                                className="h-3.5 w-3.5 rounded accent-[var(--color-sage)]"
                              />
                              <span className="text-[12px] text-ink-2">{c.l}</span>
                            </label>
                          ))}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-4 border-t border-[var(--hairline)] pt-7">
                <Button
                  disabled={!bisaKirim}
                  onClick={() => setKonfirmasi(true)}
                  icon={<Check className="h-[15px] w-[15px]" />}
                >
                  Simpan data rumah tangga
                </Button>
                {!bisaKirim && !Object.keys(galat).length && (
                  <p className="text-[12px] text-ink-4">Lengkapi seluruh kolom wajib untuk menyimpan.</p>
                )}
              </div>
            </div>
          </Bezel>
        </div>

        {/* ---------- Panel samping ---------- */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          <Bezel tone="sunken">
            <div className="p-7">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3">
                Dihitung sistem
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  { l: "Jiwa dalam KK", v: turunan.jiwa },
                  { l: "Jumlah tanggungan", v: turunan.tanggungan },
                  { l: "Lansia / disabilitas", v: turunan.disabilitasLansia },
                  { l: "Pendapatan per kapita", v: turunan.perKapita ? rupiah(turunan.perKapita) : "—" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl bg-card p-4 ring-1 ring-[var(--hairline)]">
                    <p className="text-[10px] uppercase leading-tight tracking-[0.12em] text-ink-4">{s.l}</p>
                    <p className="mt-2 font-display text-[1.35rem] leading-none tnum tracking-[-0.03em]">
                      {s.v}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[12px] leading-[1.65] text-ink-3">
                Pendapatan per kapita inilah yang masuk ke K-Means dan TOPSIS, bukan pendapatan
                total — supaya keluarga besar berpenghasilan sama tidak dinilai sama sejahteranya
                dengan keluarga kecil.
              </p>
            </div>
          </Bezel>
        </div>
      </div>

      <ConfirmDialog
        open={konfirmasi}
        onClose={() => !mengirim && setKonfirmasi(false)}
        onConfirm={kirim}
        loading={mengirim}
        title="Simpan data rumah tangga ini?"
        description="Sistem akan mengecek duplikasi NIK kepala keluarga, No. KK, dan tiap anggota sebelum data disimpan."
        confirmLabel="Ya, simpan"
      >
        {submitError && <p className="mt-3 text-[12px] leading-[1.6] text-[var(--color-alert)]">{submitError}</p>}
      </ConfirmDialog>
    </section>
  );
}

function Geser({
  label, nilai, set, kiri, kanan,
}: {
  label: string;
  nilai: number;
  set: (n: number) => void;
  kiri: string;
  kanan: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium">{label}</span>
        <span className="tnum text-[12px] text-ink-3">{nilai} / 5</span>
      </div>
      <input
        type="range" min={1} max={5} step={1} value={nilai}
        onChange={(e) => set(+e.target.value)}
        className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-paper-3 accent-[var(--color-sage)]"
      />
      <div className="mt-2 flex justify-between text-[10px] text-ink-4">
        <span>{kiri}</span>
        <span>{kanan}</span>
      </div>
    </div>
  );
}
