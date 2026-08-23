import { notFound } from "next/navigation";
import { ClusterScatter } from "@/components/charts/ClusterScatter";
import { ElbowChart } from "@/components/charts/ElbowChart";
import { RuangKerja } from "@/components/admin/RuangKerja";
import { Bezel } from "@/components/ui/Bezel";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Hash } from "@/components/ui/Hash";
import { Reveal } from "@/components/ui/Reveal";
import { Stat } from "@/components/ui/Stat";
import {
  ArrowRight,
  Cube,
  Layers,
  Ledger,
  Scale,
  ShieldCheck,
  Sparkline,
  Users,
} from "@/components/ui/Icons";
import { BOBOT_DEFAULT, dataset, KRITERIA, PROGRAM, ringkasanPublik } from "@/lib/mock/data";
import { angka, persen, rupiah, rupiahRingkas } from "@/lib/format";

const STATUS = [
  {
    tahap: "DRAFT",
    label: "Ranking tersusun",
    detail: "K-Means membentuk kelompok kerentanan, lalu TOPSIS memberi urutan prioritas.",
  },
  {
    tahap: "REVIEWED",
    label: "Diperiksa manusia",
    detail: "Verifikator menilai data yang ditandai, admin mengecek cutoff dan invarian alokasi.",
  },
  {
    tahap: "APPROVED",
    label: "Siap dikunci",
    detail: "Merkle root, kuota, dan nominal final siap dikirim ke kontrak pencairan.",
  },
] as const;

export default async function HalamanAdminPeriode({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id !== String(PROGRAM.id)) notFound();

  const terpilih = dataset.ranking.filter((r) => dataset.alokasi.terpilih.has(r.id));
  const tercairkan = dataset.pencairan.filter((p) => p.status === "claimed");
  const prioritasUtama = dataset.clusters.slice(0, 2).reduce((sum, c) => sum + c.jumlahAnggota, 0);

  return (
    <main className="overflow-x-clip pb-28">
      <section className="relative px-4 pb-20 pt-32 sm:px-8 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="grid-lines absolute inset-0 opacity-[0.45]" />
          <div className="drift absolute left-[-8%] top-[8%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(76,107,82,0.12),transparent_65%)] blur-2xl" />
          <div className="drift absolute right-[-8%] top-[22%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(168,129,60,0.12),transparent_65%)] blur-2xl [animation-delay:-8s]" />
        </div>

        <div className="mx-auto grid max-w-[78rem] grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow tone="gold">Portal admin · Periode {PROGRAM.id}</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="mt-6 max-w-4xl font-display text-[3rem] leading-[0.94] tracking-[-0.045em] sm:text-[4.25rem]">
                Prioritas bantuan harus bisa diperdebatkan angkanya, bukan ditebak niatnya.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-7 max-w-2xl text-[15px] leading-[1.75] text-ink-2">
                Halaman ini mengikuti alur di dokumen produk: data rumah tangga diverifikasi dulu,
                dikelompokkan dengan K-Means, diranking dengan TOPSIS, lalu diterjemahkan menjadi
                daftar final yang lolos kuota dan siap dikunci sebagai Merkle root.
              </p>
            </Reveal>
            <Reveal delay={230}>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button href="#simulasi" icon={<ArrowRight className="h-[15px] w-[15px]" />}>
                  Simulasikan bobot
                </Button>
                <Button href="/klaim" variant="ghost">
                  Lihat dampaknya di portal klaim
                </Button>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={180}>
              <Bezel>
                <div className="p-6 sm:p-7">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3">
                    Ringkasan periode {PROGRAM.periode}
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-paper-2 p-4 ring-1 ring-[var(--hairline)]">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-4">Pagu program</p>
                      <p className="mt-2 font-display text-[1.8rem] leading-none tracking-[-0.03em]">
                        {rupiahRingkas(PROGRAM.anggaranTotal)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-paper-2 p-4 ring-1 ring-[var(--hairline)]">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-ink-4">Penerima lolos</p>
                      <p className="mt-2 font-display text-[1.8rem] leading-none tracking-[-0.03em]">
                        {angka(dataset.alokasi.kuotaPenerima)}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-6 flex flex-col divide-y divide-[var(--hairline)] text-[13px]">
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt className="text-ink-3">Merkle root final</dt>
                      <dd><Hash value={dataset.merkleRoot} kepala={10} ekor={6} /></dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt className="text-ink-3">Kontrak registry</dt>
                      <dd>
                        <Hash
                          value={PROGRAM.registry}
                          kepala={8}
                          ekor={6}
                          href={`${PROGRAM.explorer}/address/${PROGRAM.registry}`}
                        />
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt className="text-ink-3">Kontrak disbursement</dt>
                      <dd>
                        <Hash
                          value={PROGRAM.disbursement}
                          kepala={8}
                          ekor={6}
                          href={`${PROGRAM.explorer}/address/${PROGRAM.disbursement}`}
                        />
                      </dd>
                    </div>
                  </dl>
                </div>
              </Bezel>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-4 py-5 sm:px-8">
        <div className="mx-auto grid max-w-[78rem] grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Data terverifikasi",
              value: angka(dataset.peserta.length),
              sub: `${angka(dataset.semua.length - dataset.peserta.length)} rumah tangga masih tertahan atau ditolak`,
              icon: <Users className="h-[18px] w-[18px]" />,
            },
            {
              label: "Cluster prioritas",
              value: angka(prioritasUtama),
              sub: "berada pada dua kelompok paling rentan dan masuk antrean ranking",
              icon: <Layers className="h-[18px] w-[18px]" />,
            },
            {
              label: "Dana siap disalurkan",
              value: rupiahRingkas(dataset.alokasi.totalAlokasi),
              sub: `${rupiah(dataset.alokasi.sisaAnggaran)} tersisa sebagai carry-over`,
              icon: <Scale className="h-[18px] w-[18px]" />,
            },
            {
              label: "Sudah diklaim",
              value: persen(tercairkan.length / dataset.alokasi.kuotaPenerima),
              sub: `${angka(tercairkan.length)} dari ${angka(dataset.alokasi.kuotaPenerima)} penerima telah menarik dananya`,
              icon: <ShieldCheck className="h-[18px] w-[18px]" />,
            },
          ].map((item, index) => (
            <Reveal key={item.label} delay={index * 70}>
              <Bezel className="h-full">
                <div className="p-7">
                  <Stat label={item.label} value={item.value} sub={item.sub} icon={item.icon} />
                </div>
              </Bezel>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-4 py-5 sm:px-8">
        <div className="mx-auto grid max-w-[78rem] grid-cols-1 gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Bezel>
              <div className="p-7 sm:p-9">
                <Eyebrow>Stage 1 · Clustering kerentanan</Eyebrow>
                <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <h2 className="max-w-2xl font-display text-[2rem] leading-[1.04] tracking-[-0.035em]">
                    Empat kelompok muncul dari data, bukan dari label yang diketik manual.
                  </h2>
                  <p className="max-w-sm text-[12px] leading-[1.65] text-ink-3">
                    Sumbu X menampilkan pendapatan per kapita, sumbu Y jumlah tanggungan. Warna
                    menunjukkan urutan kerentanan setelah centroid diurutkan.
                  </p>
                </div>
                <div className="mt-8">
                  <ClusterScatter
                    data={dataset.scatter}
                    label={dataset.clusters.map((cluster) => cluster.label)}
                  />
                </div>
              </div>
            </Bezel>
          </Reveal>

          <Reveal className="lg:col-span-5" delay={90}>
            <Bezel className="h-full">
              <div className="flex h-full flex-col gap-8 p-7 sm:p-9">
                <div>
                  <Eyebrow tone="sage">Pemilihan k</Eyebrow>
                  <h2 className="mt-5 font-display text-[1.75rem] leading-tight tracking-[-0.03em]">
                    Titik siku dipertahankan di k = {PROGRAM.kCluster}.
                  </h2>
                  <p className="mt-4 text-[13px] leading-[1.7] text-ink-2">
                    Untuk demo ini, empat cluster cukup memisahkan rumah tangga dari sangat rentan
                    sampai mampu tanpa membuat segmen terlalu terpecah untuk dijelaskan ke pemangku
                    kebijakan non-teknis.
                  </p>
                </div>
                <ElbowChart data={dataset.elbow} pilih={PROGRAM.kCluster} />
                <div className="rounded-2xl bg-paper-2 p-4 ring-1 ring-[var(--hairline)]">
                  <p className="text-[12px] leading-[1.65] text-ink-2">
                    Iterasi konvergen dalam <span className="font-mono">{angka(dataset.km.iterations)}</span> langkah.
                    Validasi silang tetap diperlukan: cluster yang rapi secara matematis belum tentu adil
                    bila kriterianya buruk.
                  </p>
                </div>
              </div>
            </Bezel>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-5 sm:px-8">
        <div className="mx-auto grid max-w-[78rem] grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {dataset.clusters.map((cluster, index) => (
            <Reveal key={cluster.index} delay={index * 70}>
              <Bezel className="h-full">
                <div className="p-6">
                  <Eyebrow className="max-w-max" tone={index < 2 ? "clay" : "ink"}>
                    {cluster.label}
                  </Eyebrow>
                  <p className="mt-5 font-display text-[2rem] leading-none tracking-[-0.03em]">
                    {angka(cluster.jumlahAnggota)}
                  </p>
                  <p className="mt-2 text-[12px] leading-relaxed text-ink-3">rumah tangga di kelompok ini</p>
                  <dl className="mt-6 flex flex-col gap-3 text-[12px]">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-ink-3">Pendapatan centroid</dt>
                      <dd className="tnum text-ink-2">{rupiah(cluster.centroid.pendapatanPerKapita)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-ink-3">Tanggungan rata-rata</dt>
                      <dd className="tnum text-ink-2">{cluster.centroid.jumlahTanggungan.toFixed(2)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-ink-3">Kecocokan segmen</dt>
                      <dd className="tnum text-ink-2">{persen(cluster.kecocokanSegmen, 1)}</dd>
                    </div>
                  </dl>
                </div>
              </Bezel>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-4 py-5 sm:px-8">
        <div className="mx-auto grid max-w-[78rem] grid-cols-1 gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Bezel>
              <div className="p-7 sm:p-9">
                <Eyebrow>Stage 2 · Workflow approval</Eyebrow>
                <h2 className="mt-5 font-display text-[2rem] leading-[1.04] tracking-[-0.035em]">
                  Mesin menghitung, pejabat tetap menanggung keputusan.
                </h2>
                <div className="mt-8 grid grid-cols-1 gap-4">
                  {STATUS.map((status, index) => (
                    <div
                      key={status.tahap}
                      className="flex items-start gap-4 rounded-2xl bg-paper-2 p-4 ring-1 ring-[var(--hairline)]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card font-mono text-[11px] ring-1 ring-[var(--hairline)]">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-ink-4">{status.tahap}</p>
                        <p className="mt-1.5 text-[14px] font-medium">{status.label}</p>
                        <p className="mt-1.5 text-[12px] leading-[1.65] text-ink-3">{status.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Bezel>
          </Reveal>

          <Reveal className="lg:col-span-5" delay={90}>
            <Bezel tone="accent" className="h-full">
              <div className="flex h-full flex-col gap-7 p-7 sm:p-9">
                <div>
                  <Eyebrow tone="sage">Bobot resmi saat ini</Eyebrow>
                  <h2 className="mt-5 font-display text-[1.75rem] leading-tight tracking-[-0.03em]">
                    Empat kriteria, satu keputusan yang bisa diuji ulang.
                  </h2>
                </div>
                <ul className="flex flex-col gap-3">
                  {KRITERIA.map((k) => (
                    <li
                      key={k.key}
                      className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 ring-1 ring-[var(--hairline)]"
                    >
                      <span className="text-[13px] text-ink-2">{k.label}</span>
                      <span className="font-mono text-[12px]">{persen(BOBOT_DEFAULT[k.key], 0)}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] leading-[1.65] text-ink-3">
                  Komposisi ini mengikuti kriteria MVP di PRD: pendapatan per kapita sebagai cost,
                  lalu tanggungan, disabilitas/lansia, dan kondisi rumah sebagai penyeimbang sosial.
                </p>
              </div>
            </Bezel>
          </Reveal>
        </div>
      </section>

      <section id="simulasi" className="scroll-mt-24 py-5">
        <Reveal>
          <div className="mx-auto max-w-[78rem] px-4 sm:px-8">
            <div className="mb-5 max-w-2xl">
              <Eyebrow tone="gold">Stage 3 · Simulasi TOPSIS & alokasi</Eyebrow>
              <h2 className="mt-5 font-display text-[2.25rem] leading-[1.03] tracking-[-0.04em]">
                Di sinilah debat kebijakan seharusnya terjadi.
              </h2>
              <p className="mt-5 text-[14px] leading-[1.75] text-ink-2">
                Geser bobot, lihat pergeseran ranking, lalu cek apakah daftar final masih lolos
                semua invarian sebelum disahkan dan dikirim ke chain.
              </p>
            </div>
          </div>
        </Reveal>
        <RuangKerja />
      </section>

      <section className="px-4 pt-5 sm:px-8">
        <div className="mx-auto grid max-w-[78rem] grid-cols-1 gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Bezel>
              <div className="p-7 sm:p-9">
                <Eyebrow>Stage 4 · Setelah approval</Eyebrow>
                <h2 className="mt-5 font-display text-[2rem] leading-[1.04] tracking-[-0.035em]">
                  Ledger publik hanya memuat hasil final yang sudah dianonimkan.
                </h2>
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-paper-2 p-5 ring-1 ring-[var(--hairline)]">
                    <Stat
                      label="Transaksi berhasil"
                      value={angka(tercairkan.length)}
                      sub={`${angka(dataset.pencairan.length - tercairkan.length)} penerima masih menunggu klaim`}
                      icon={<Ledger className="h-[18px] w-[18px]" />}
                    />
                  </div>
                  <div className="rounded-2xl bg-paper-2 p-5 ring-1 ring-[var(--hairline)]">
                    <Stat
                      label="Nominal per keluarga"
                      value={rupiahRingkas(PROGRAM.nominalDasar)}
                      sub="skema flat menghindari kebocoran peringkat kemiskinan di ledger"
                      icon={<Scale className="h-[18px] w-[18px]" />}
                    />
                  </div>
                  <div className="rounded-2xl bg-paper-2 p-5 ring-1 ring-[var(--hairline)]">
                    <Stat
                      label="Dana sudah tersalur"
                      value={rupiahRingkas(ringkasanPublik.totalTersalur)}
                      sub={`${rupiahRingkas(ringkasanPublik.totalAlokasi - ringkasanPublik.totalTersalur)} masih terkunci`}
                      icon={<Cube className="h-[18px] w-[18px]" />}
                    />
                  </div>
                </div>
              </div>
            </Bezel>
          </Reveal>

          <Reveal className="lg:col-span-5" delay={90}>
            <Bezel className="h-full">
              <div className="flex h-full flex-col gap-6 p-7 sm:p-9">
                <div>
                  <Eyebrow tone="sage">Jejak audit</Eyebrow>
                  <h2 className="mt-5 font-display text-[1.75rem] leading-tight tracking-[-0.03em]">
                    Yang dipublikasikan cukup untuk diaudit, tidak cukup untuk mempermalukan warga.
                  </h2>
                </div>
                <ul className="flex flex-col gap-4">
                  {[
                    "Nama dan NIK asli tetap off-chain; publik hanya melihat kode anonim dan hash.",
                    "Alamat penerima terkunci di leaf, jadi relayer tidak bisa mengalihkan dana.",
                    "Sisa pagu tercatat eksplisit sebagai carry-over, bukan selisih yang hilang.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-[12px] leading-[1.65] text-ink-2">
                      <span className="mt-1 text-sage">
                        <Sparkline className="h-4 w-4" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Bezel>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
