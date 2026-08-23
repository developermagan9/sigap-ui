"use client";

import { useMemo, useState } from "react";
import { Bezel } from "@/components/ui/Bezel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Alert, Check, Cross, Scale } from "@/components/ui/Icons";
import { PanelPenjelasan } from "./PanelPenjelasan";
import { BOBOT_DEFAULT, KRITERIA, hitungAlokasi, type BarisRanking } from "@/lib/mock/data";
import { pergeseranRanking } from "@/lib/algo/topsis";
import { angka, persen, rupiah, rupiahRingkas } from "@/lib/format";

const DASAR = Object.fromEntries(Object.entries(BOBOT_DEFAULT).map(([k, v]) => [k, v * 100]));

export function RuangKerja() {
  const [mentah, setMentah] = useState<Record<string, number>>(DASAR);
  const [pilih, setPilih] = useState<BarisRanking | null>(null);

  const total = Object.values(mentah).reduce((s, v) => s + v, 0) || 1;
  const bobot = useMemo(
    () => Object.fromEntries(Object.entries(mentah).map(([k, v]) => [k, v / total])),
    [mentah, total],
  );

  const { ranking, hasil, invarian } = useMemo(() => hitungAlokasi(bobot), [bobot]);
  const resmi = useMemo(() => hitungAlokasi(BOBOT_DEFAULT), []);

  const geser = useMemo(
    () => pergeseranRanking(resmi.ranking.map((r) => r.id), ranking.map((r) => r.id), 20),
    [ranking, resmi],
  );

  const diubah = Object.keys(DASAR).some((k) => Math.abs(mentah[k] - DASAR[k]) > 0.01);

  // Tampilkan 8 peringkat teratas + lingkungan cutoff — batas itulah yang menentukan nasib
  const kuota = hasil.kuotaPenerima;
  const barisTampil = useMemo(() => {
    const atas = ranking.slice(0, 8);
    const batas = ranking.slice(Math.max(kuota - 3, 8), kuota + 3);
    return { atas, batas };
  }, [ranking, kuota]);

  return (
    <>
      {/* ---------- Bobot kriteria ---------- */}
      <section className="px-4 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <Bezel>
            <div className="grid grid-cols-1 gap-10 p-7 sm:p-9 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Eyebrow tone="gold">Tahap 3 · Bobot kriteria</Eyebrow>
                <h2 className="mt-5 font-display text-[2rem] leading-[1.05] tracking-[-0.035em]">
                  Geser bobotnya, lihat siapa yang tergeser.
                </h2>
                <p className="mt-5 text-[13px] leading-[1.7] text-ink-2">
                  Bobot bukan urusan tim teknis. Panel ini ada supaya pekerja sosial dan pemangku
                  kebijakan bisa menguji sendiri: apakah hasilnya berubah drastis hanya karena satu
                  kriteria dinaikkan? Kalau iya, bobot itu terlalu dominan.
                </p>

                <div className="mt-8 flex flex-col gap-6">
                  {KRITERIA.map((k) => {
                    const share = bobot[k.key] ?? 0;
                    const beda = share - (BOBOT_DEFAULT[k.key] ?? 0);
                    return (
                      <div key={k.key}>
                        <div className="flex items-baseline justify-between gap-3">
                          <label htmlFor={k.key} className="text-[13px] font-medium">
                            {k.label}
                            <span className="ml-2 text-[11px] font-normal text-ink-4">
                              {k.benefit ? "benefit" : "cost"}
                            </span>
                          </label>
                          <span className="tnum text-[13px]">
                            {persen(share, 1)}
                            {Math.abs(beda) > 0.001 && (
                              <span className={`ml-2 text-[11px] ${beda > 0 ? "text-sage" : "text-clay"}`}>
                                {beda > 0 ? "+" : ""}{(beda * 100).toFixed(1)}
                              </span>
                            )}
                          </span>
                        </div>
                        <input
                          id={k.key}
                          type="range"
                          min={0}
                          max={60}
                          step={0.5}
                          value={mentah[k.key]}
                          onChange={(e) => setMentah((s) => ({ ...s, [k.key]: +e.target.value }))}
                          className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-paper-3
                            accent-[var(--color-sage)]"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setMentah(DASAR)}
                    disabled={!diubah}
                    icon={<Scale className="h-[15px] w-[15px]" />}
                  >
                    Kembalikan ke bobot resmi
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { l: "Kuota penerima", v: angka(kuota), s: `dari ${angka(ranking.length)} keluarga rentan` },
                    { l: "Total dialokasikan", v: rupiahRingkas(hasil.totalAlokasi), s: `sisa ${rupiah(hasil.sisaAnggaran)}` },
                    {
                      l: "Pergeseran 20 besar",
                      v: persen(geser),
                      s: geser === 0 ? "identik dengan bobot resmi" : "berbeda dari bobot resmi",
                      tone: geser > 0.25 ? "clay" : "ink",
                    },
                  ].map((s) => (
                    <div key={s.l} className="rounded-2xl bg-paper-2 p-5 ring-1 ring-[var(--hairline)]">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-4">{s.l}</p>
                      <p className={`mt-2.5 font-display text-[1.6rem] leading-none tnum tracking-[-0.03em] ${
                        s.tone === "clay" ? "text-clay" : ""
                      }`}>
                        {s.v}
                      </p>
                      <p className="mt-2 text-[11px] leading-relaxed text-ink-3">{s.s}</p>
                    </div>
                  ))}
                </div>

                {diubah && (
                  <div className="mt-4 flex items-start gap-3 rounded-2xl bg-clay-soft p-4 ring-1 ring-clay/15">
                    <span className="mt-px text-clay"><Alert className="h-4 w-4" /></span>
                    <p className="text-[12px] leading-[1.65] text-ink-2">
                      Ini mode simulasi. Bobot yang sudah disahkan rapat verifikasi tetap yang tercatat
                      on-chain — mengubah slider di sini tidak mengubah daftar penerima yang berlaku.
                      Untuk memakai bobot baru, periode harus dihitung ulang dan disahkan ulang.
                    </p>
                  </div>
                )}

                <div className="mt-4 rounded-2xl bg-paper-2 p-5 ring-1 ring-[var(--hairline)]">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3">
                    Titik cutoff
                  </p>
                  <div className="mt-5 flex items-end gap-4">
                    <div className="flex-1">
                      <p className="text-[11px] text-ink-3">Peringkat {angka(kuota)} — terakhir lolos</p>
                      <p className="mt-1.5 font-mono text-[15px] tnum text-sage">
                        {hasil.cutoff.skorTerakhirTerpilih?.toFixed(6) ?? "—"}
                      </p>
                    </div>
                    <div className="mb-1 h-8 w-px bg-[var(--hairline-strong)]" />
                    <div className="flex-1">
                      <p className="text-[11px] text-ink-3">Peringkat {angka(kuota + 1)} — pertama gagal</p>
                      <p className="mt-1.5 font-mono text-[15px] tnum text-clay">
                        {hasil.cutoff.skorPertamaTidakTerpilih?.toFixed(6) ?? "—"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-[12px] leading-[1.65] text-ink-2">
                    Terpaut{" "}
                    <span className="font-mono text-clay">{hasil.cutoff.selisih?.toFixed(6)}</span> poin.
                    Dua keluarga yang praktis sama kondisinya dipisahkan oleh keterbatasan pagu, bukan
                    oleh perbedaan kelayakan yang nyata. Yang tidak lolos tetap berhak menempuh jalur
                    sanggahan data.
                  </p>
                </div>
              </div>
            </div>
          </Bezel>
        </div>
      </section>

      {/* ---------- Tabel ranking ---------- */}
      <section className="px-4 pt-5 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <Bezel>
            <div className="p-7 sm:p-9">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <Eyebrow>Daftar peringkat</Eyebrow>
                  <h3 className="mt-4 font-display text-[1.75rem] leading-tight tracking-[-0.03em]">
                    Klik satu baris untuk membongkar skornya
                  </h3>
                </div>
                <p className="text-[12px] text-ink-3">
                  Menampilkan 8 teratas dan sekitar batas kuota
                </p>
              </div>

              <div className="mt-7 overflow-x-auto">
                <table className="w-full min-w-[46rem] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--hairline)]">
                      {["#", "Ref", "Desa", "Kelompok", "Pendapatan", "Tangg.", "Skor", "Status"].map((h) => (
                        <th key={h} className="px-2 pb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-4">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {barisTampil.atas.map((r) => (
                      <BarisTabel key={r.id} r={r} terpilih={hasil.terpilih.has(r.id)} onPilih={setPilih} />
                    ))}

                    <tr>
                      <td colSpan={8} className="py-4">
                        <div className="flex items-center gap-4">
                          <span className="h-px flex-1 bg-[var(--hairline)]" />
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-4">
                            {angka(Math.max(kuota - 3, 8) - 8)} baris disembunyikan
                          </span>
                          <span className="h-px flex-1 bg-[var(--hairline)]" />
                        </div>
                      </td>
                    </tr>

                    {barisTampil.batas.map((r) => (
                      <BarisTabel
                        key={r.id}
                        r={r}
                        terpilih={hasil.terpilih.has(r.id)}
                        onPilih={setPilih}
                        batas={r.rank === kuota}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Bezel>
        </div>
      </section>

      {/* ---------- Invarian sebelum on-chain ---------- */}
      <section className="px-4 py-5 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <Bezel tone={invarian.every((i) => i.lolos) ? "accent" : "sunken"}>
            <div className="grid grid-cols-1 gap-9 p-7 sm:p-9 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Eyebrow tone={invarian.every((i) => i.lolos) ? "sage" : "clay"}>
                  Tahap 4 · Pemeriksaan sebelum dikunci
                </Eyebrow>
                <h3 className="mt-5 font-display text-[1.75rem] leading-snug tracking-[-0.03em]">
                  Lima hal yang harus benar sebelum daftar masuk rantai.
                </h3>
                <p className="mt-4 text-[13px] leading-[1.7] text-ink-2">
                  Gagal salah satu berarti proses berhenti, bukan diteruskan. Daftar yang sudah
                  terkunci tidak bisa diperbaiki — kesalahan sekecil apa pun akan permanen dan
                  berarti ada warga yang dananya tersangkut selamanya.
                </p>
                <div className="mt-7">
                  <Button
                    disabled={!invarian.every((i) => i.lolos) || diubah}
                    icon={<Check className="h-[15px] w-[15px]" />}
                  >
                    {diubah ? "Kembalikan bobot resmi dulu" : "Sahkan & kunci on-chain"}
                  </Button>
                </div>
              </div>

              <ul className="flex flex-col gap-3 lg:col-span-7">
                {invarian.map((i) => (
                  <li
                    key={i.nama}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4
                      ring-1 ring-[var(--hairline)]"
                  >
                    <span className="flex min-w-0 items-center gap-3.5">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          i.lolos ? "bg-sage-soft text-sage" : "bg-clay-soft text-clay"
                        }`}
                      >
                        {i.lolos ? <Check className="h-3.5 w-3.5" /> : <Cross className="h-3.5 w-3.5" />}
                      </span>
                      <span className="truncate text-[13px]">{i.nama}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-ink-3">{i.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Bezel>
        </div>
      </section>

      <PanelPenjelasan
        baris={pilih}
        terpilih={pilih ? hasil.terpilih.has(pilih.id) : false}
        onTutup={() => setPilih(null)}
      />
    </>
  );
}

function BarisTabel({
  r, terpilih, onPilih, batas = false,
}: {
  r: BarisRanking;
  terpilih: boolean;
  onPilih: (b: BarisRanking) => void;
  batas?: boolean;
}) {
  return (
    <tr
      onClick={() => onPilih(r)}
      className={`cursor-pointer border-b border-[var(--hairline)] transition-colors duration-300
        ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-paper-2 ${batas ? "bg-sage-soft/40" : ""}`}
    >
      <td className="px-2 py-3.5 tnum text-[13px] text-ink-3">{r.rank}</td>
      <td className="px-2 py-3.5 font-mono text-[12px]">{r.peserta.ref}</td>
      <td className="px-2 py-3.5 text-[13px] text-ink-2">{r.peserta.desa}</td>
      <td className="px-2 py-3.5">
        <span
          className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] ring-1"
          style={{
            color: `var(--color-c${r.peringkatCluster})`,
            background: `color-mix(in srgb, var(--color-c${r.peringkatCluster}) 8%, transparent)`,
            borderColor: "transparent",
          }}
        >
          {r.labelCluster}
        </span>
      </td>
      <td className="px-2 py-3.5 tnum text-[13px] text-ink-2">{rupiahRingkas(r.pendapatanPerKapita)}</td>
      <td className="px-2 py-3.5 tnum text-[13px] text-ink-2">{r.jumlahTanggungan}</td>
      <td className="px-2 py-3.5 tnum font-mono text-[12px]">{r.skor.toFixed(4)}</td>
      <td className="px-2 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-[11px] ${terpilih ? "text-sage" : "text-ink-4"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${terpilih ? "bg-sage" : "bg-ink-4"}`} />
          {terpilih ? "Menerima" : "Di luar kuota"}
        </span>
      </td>
    </tr>
  );
}
