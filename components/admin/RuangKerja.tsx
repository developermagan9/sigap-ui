"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bezel } from "@/components/ui/Bezel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Alert, ArrowRight, Check, Scale } from "@/components/ui/Icons";
import { PanelPenjelasan } from "./PanelPenjelasan";
import { KRITERIA_LABEL } from "./AdminShared";
import { runTopsisAndAlokasi, finalizeRanking } from "@/lib/actions";
import { pergeseranRanking } from "@/lib/algo/topsis";
import { angka, persen, rupiah, rupiahRingkas } from "@/lib/format";

export type RankingRow = {
  rumah_tangga_id: string;
  nik_kk_hash: string;
  cluster_label: string;
  rank: number;
  skor_topsis: number;
  d_plus: number | null;
  d_minus: number | null;
  breakdown_kriteria: Record<string, { nilaiAsli: number; kontribusi: number; kesenjangan: number }>;
  terpilih: boolean;
  amount: number | null;
};

type AlokasiMeta = {
  kuotaPenerima: number;
  totalAlokasi: number;
  sisaAnggaran: number;
  cutoffTerakhir: number | null;
  cutoffPertamaGagal: number | null;
};

export function RuangKerja({
  periodeId,
  initialBobot,
  initialRanking,
  clusterIndexTarget,
  nominalDasar,
  biayaOperasional,
  terkunci: terkunciAwal,
}: {
  periodeId: string;
  initialBobot: Record<string, number>;
  initialRanking: RankingRow[];
  clusterIndexTarget: number[];
  nominalDasar: number;
  biayaOperasional: number;
  /** true kalau periode sudah lewat tahap 'alokasi' (approved/disbursed dst) — ranking tidak boleh diubah lagi. */
  terkunci: boolean;
}) {
  const router = useRouter();
  const dasar = useMemo(
    () => Object.fromEntries(Object.entries(initialBobot).map(([k, v]) => [k, v * 100])),
    [initialBobot],
  );

  const [mentah, setMentah] = useState<Record<string, number>>(dasar);
  const [ranking, setRanking] = useState<RankingRow[]>(initialRanking);
  const [alokasiMeta, setAlokasiMeta] = useState<AlokasiMeta | null>(null);
  const [pilih, setPilih] = useState<RankingRow | null>(null);
  const [menjalankan, setMenjalankan] = useState(false);
  const [jalankanError, setJalankanError] = useState<string | null>(null);
  const [konfirmasiSahkan, setKonfirmasiSahkan] = useState(false);
  const [menyahkan, setMenyahkan] = useState(false);
  const [sahError, setSahError] = useState<string | null>(null);
  const [terkunci, setTerkunci] = useState(terkunciAwal);

  const urutanAwal = useMemo(() => initialRanking.map((r) => r.rumah_tangga_id), [initialRanking]);

  const total = Object.values(mentah).reduce((s, v) => s + v, 0) || 1;
  const bobot = useMemo(
    () => Object.fromEntries(Object.entries(mentah).map(([k, v]) => [k, v / total])),
    [mentah, total],
  );

  const diubah = Object.keys(dasar).some((k) => Math.abs((mentah[k] ?? 0) - (dasar[k] ?? 0)) > 0.01);

  const geser = useMemo(
    () => (urutanAwal.length ? pergeseranRanking(urutanAwal, ranking.map((r) => r.rumah_tangga_id), Math.min(20, urutanAwal.length)) : 0),
    [ranking, urutanAwal],
  );

  const kuota = alokasiMeta?.kuotaPenerima ?? ranking.filter((r) => r.terpilih).length;
  const barisTampil = useMemo(() => {
    const atas = ranking.slice(0, 8);
    const batas = kuota > 8 ? ranking.slice(Math.max(kuota - 3, 8), kuota + 3) : [];
    return { atas, batas };
  }, [ranking, kuota]);

  const jalankanRanking = async () => {
    setMenjalankan(true);
    setJalankanError(null);
    try {
      const hasil = await runTopsisAndAlokasi(
        periodeId,
        bobot,
        clusterIndexTarget,
        nominalDasar,
        biayaOperasional,
      );
      setRanking(hasil.ranking as RankingRow[]);
      const a = hasil.alokasi as any;
      setAlokasiMeta({
        kuotaPenerima: a.kuota_penerima,
        totalAlokasi: a.total_alokasi,
        sisaAnggaran: a.sisa_anggaran,
        cutoffTerakhir: a.cutoff?.skor_topsis_terakhir_terpilih ?? null,
        cutoffPertamaGagal: a.cutoff?.skor_topsis_pertama_tidak_terpilih ?? null,
      });
      router.refresh();
    } catch (err) {
      setJalankanError(err instanceof Error ? err.message : "Gagal menjalankan ranking.");
    } finally {
      setMenjalankan(false);
    }
  };

  const sahkanDaftar = async () => {
    setMenyahkan(true);
    setSahError(null);
    try {
      await finalizeRanking(periodeId, "Disahkan lewat panel simulasi bobot.");
      setMenyahkan(false);
      setKonfirmasiSahkan(false);
      setTerkunci(true);
      router.refresh();
    } catch (err) {
      setSahError(err instanceof Error ? err.message : "Gagal menyahkan daftar final.");
      setMenyahkan(false);
    }
  };

  return (
    <>
      {/* ---------- Bobot kriteria ---------- */}
      <section className="px-4 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <Bezel>
            <div className="grid grid-cols-1 gap-10 p-7 sm:p-9 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Eyebrow tone="gold">Tahap 3 · Bobot kriteria</Eyebrow>
                <h2 className="mt-5 font-display text-[1.5rem] leading-tight tracking-[-0.02em]">
                  Bobot Kriteria
                </h2>
                <p className="mt-4 text-[13px] leading-[1.7] text-ink-2">
                  Geser bobot, lalu jalankan ranking untuk lihat pengaruhnya pada daftar draft.
                </p>

                <div className="mt-8 flex flex-col gap-6">
                  {Object.keys(dasar).map((key) => {
                    const share = bobot[key] ?? 0;
                    const beda = share - (initialBobot[key] ?? 0);
                    return (
                      <div key={key}>
                        <div className="flex items-baseline justify-between gap-3">
                          <label htmlFor={key} className="text-[13px] font-medium">
                            {KRITERIA_LABEL[key] ?? key}
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
                          id={key}
                          type="range"
                          min={0}
                          max={60}
                          step={0.5}
                          disabled={terkunci}
                          value={mentah[key] ?? 0}
                          onChange={(e) => setMentah((s) => ({ ...s, [key]: +e.target.value }))}
                          className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-paper-3
                            accent-[var(--color-sage)] disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setMentah(dasar)}
                    disabled={!diubah || terkunci}
                    icon={<Scale className="h-[15px] w-[15px]" />}
                  >
                    Kembalikan ke bobot resmi
                  </Button>
                  <LoadingButton
                    onClick={jalankanRanking}
                    loading={menjalankan}
                    disabled={terkunci}
                    icon={<ArrowRight className="h-[15px] w-[15px]" />}
                  >
                    Jalankan ranking dengan bobot ini
                  </LoadingButton>
                </div>
                {jalankanError && (
                  <p className="mt-3 text-[12px] leading-[1.6] text-clay">{jalankanError}</p>
                )}
              </div>

              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { l: "Kuota penerima", v: angka(kuota), s: `dari ${angka(ranking.length)} keluarga dalam cluster prioritas` },
                    { l: "Total dialokasikan", v: alokasiMeta ? rupiahRingkas(alokasiMeta.totalAlokasi) : "—", s: alokasiMeta ? `sisa ${rupiah(alokasiMeta.sisaAnggaran)}` : "belum dijalankan" },
                    {
                      l: "Pergeseran dari resmi",
                      v: urutanAwal.length ? persen(geser) : "—",
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

                {diubah && !terkunci && (
                  <div className="mt-4 flex items-start gap-3 rounded-2xl bg-clay-soft p-4 ring-1 ring-clay/15">
                    <span className="mt-px text-clay"><Alert className="h-4 w-4" /></span>
                    <p className="text-[12px] leading-[1.65] text-ink-2">
                      Bobot digeser tapi belum dijalankan — klik &ldquo;Jalankan ranking&rdquo; supaya daftar draft ikut berubah.
                    </p>
                  </div>
                )}

                {alokasiMeta && (
                  <div className="mt-4 rounded-2xl bg-paper-2 p-5 ring-1 ring-[var(--hairline)]">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3">
                      Titik cutoff
                    </p>
                    <div className="mt-5 flex items-end gap-4">
                      <div className="flex-1">
                        <p className="text-[11px] text-ink-3">Peringkat {angka(kuota)} — terakhir lolos</p>
                        <p className="mt-1.5 font-mono text-[15px] tnum text-sage">
                          {alokasiMeta.cutoffTerakhir?.toFixed(6) ?? "—"}
                        </p>
                      </div>
                      <div className="mb-1 h-8 w-px bg-[var(--hairline-strong)]" />
                      <div className="flex-1">
                        <p className="text-[11px] text-ink-3">Peringkat {angka(kuota + 1)} — pertama gagal</p>
                        <p className="mt-1.5 font-mono text-[15px] tnum text-clay">
                          {alokasiMeta.cutoffPertamaGagal?.toFixed(6) ?? "—"}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-[12px] leading-[1.65] text-ink-2">
                      Dua keluarga yang praktis sama kondisinya bisa dipisahkan oleh keterbatasan pagu, bukan
                      kelayakan. Yang tidak lolos tetap berhak mengajukan sanggahan.
                    </p>
                  </div>
                )}
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
                  <h3 className="mt-4 font-display text-[1.4rem] leading-tight tracking-[-0.02em]">
                    Klik baris untuk detail skor
                  </h3>
                </div>
                <p className="text-[12px] text-ink-3">
                  Menampilkan 8 teratas dan sekitar batas kuota
                </p>
              </div>

              {ranking.length === 0 ? (
                <p className="mt-7 text-[13px] text-ink-3">
                  Belum ada ranking untuk periode ini — geser bobot lalu klik &ldquo;Jalankan ranking&rdquo;.
                </p>
              ) : (
                <div className="mt-7 overflow-x-auto">
                  <table className="w-full min-w-[42rem] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[var(--hairline)]">
                        {["#", "ID", "Kelompok", "Skor", "Status"].map((h) => (
                          <th key={h} className="px-2 pb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-4">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {barisTampil.atas.map((r) => (
                        <BarisTabel key={r.rumah_tangga_id} r={r} onPilih={setPilih} />
                      ))}

                      {barisTampil.batas.length > 0 && (
                        <>
                          <tr>
                            <td colSpan={5} className="py-4">
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
                            <BarisTabel key={r.rumah_tangga_id} r={r} onPilih={setPilih} batas={r.rank === kuota} />
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Bezel>
        </div>
      </section>

      {/* ---------- Sahkan daftar ---------- */}
      <section className="px-4 py-5 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <Bezel tone={terkunci ? "accent" : "sunken"}>
            <div className="grid grid-cols-1 gap-9 p-7 sm:p-9 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Eyebrow tone={terkunci ? "sage" : "clay"}>Tahap 4 · Sahkan daftar</Eyebrow>
                <p className="mt-4 text-[13px] leading-[1.7] text-ink-2">
                  Invarian alokasi (jumlah, wallet unik, kuota) diperiksa server saat Merkle root
                  dibangun di halaman On-chain — gagal satu berarti proses berhenti di sana.
                </p>
                <div className="mt-7">
                  <Button
                    disabled={ranking.length === 0 || diubah || terkunci}
                    icon={<Check className="h-[15px] w-[15px]" />}
                    onClick={() => setKonfirmasiSahkan(true)}
                  >
                    {terkunci ? "Sudah disahkan" : diubah ? "Jalankan ranking dulu" : "Sahkan daftar final"}
                  </Button>
                </div>
                {sahError && <p className="mt-3 text-[12px] leading-[1.6] text-clay">{sahError}</p>}
              </div>

              <div className="flex flex-col justify-center gap-3 lg:col-span-7">
                <p className="text-[12px] leading-[1.65] text-ink-3">
                  Setelah disahkan, status periode berpindah ke <span className="font-mono">approved</span> dan
                  daftar ini siap dikunci ke Merkle root di halaman{" "}
                  <span className="font-medium text-ink-2">Penyaluran On-chain</span>.
                </p>
              </div>
            </div>
          </Bezel>
        </div>
      </section>

      <PanelPenjelasan
        baris={pilih}
        terpilih={pilih ? pilih.terpilih : false}
        onTutup={() => setPilih(null)}
      />

      <ConfirmDialog
        open={konfirmasiSahkan}
        onClose={() => !menyahkan && setKonfirmasiSahkan(false)}
        onConfirm={sahkanDaftar}
        loading={menyahkan}
        tone="danger"
        title="Sahkan daftar final ini?"
        description={`${angka(kuota)} penerima akan disahkan. Setelah ini bobot tidak bisa digeser lagi untuk periode yang sama.`}
        confirmLabel="Ya, sahkan sekarang"
      />
    </>
  );
}

function BarisTabel({
  r, onPilih, batas = false,
}: {
  r: RankingRow;
  onPilih: (b: RankingRow) => void;
  batas?: boolean;
}) {
  return (
    <tr
      onClick={() => onPilih(r)}
      className={`cursor-pointer border-b border-[var(--hairline)] transition-colors duration-300
        ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-paper-2 ${batas ? "bg-sage-soft/40" : ""}`}
    >
      <td className="px-2 py-3.5 tnum text-[13px] text-ink-3">{r.rank}</td>
      <td className="px-2 py-3.5 font-mono text-[12px]">{r.rumah_tangga_id.slice(0, 8)}</td>
      <td className="px-2 py-3.5 text-[13px] text-ink-2">{r.cluster_label}</td>
      <td className="px-2 py-3.5 tnum font-mono text-[12px]">{r.skor_topsis.toFixed(4)}</td>
      <td className="px-2 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-[11px] ${r.terpilih ? "text-sage" : "text-ink-4"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${r.terpilih ? "bg-sage" : "bg-ink-4"}`} />
          {r.terpilih ? "Menerima" : "Di luar kuota"}
        </span>
      </td>
    </tr>
  );
}
