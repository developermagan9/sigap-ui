import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { RuangKerja } from "@/components/admin/RuangKerja";
import { Bezel } from "@/components/ui/Bezel";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Hash } from "@/components/ui/Hash";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Stat } from "@/components/ui/Stat";
import { ArrowRight, Cube, Layers, Ledger, Scale, ShieldCheck, Users } from "@/components/ui/Icons";
import { BobotList, ClusterSummaryCards } from "@/components/admin/AdminShared";
import { ApiClient } from "@/lib/api";
import { angka, rupiah, rupiahRingkas } from "@/lib/format";

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
  const token = (await cookies()).get("sigap_token")?.value;

  const periode = await ApiClient.periode.getById(id, token).catch(() => null);
  if (!periode) notFound();

  const [summary, ranking, chainStatus] = await Promise.all([
    ApiClient.periode.getSummary(id, token),
    ApiClient.mining.getRanking(id, token),
    ApiClient.blockchain.getStatus(id, token).catch(() => ({ total_recipients: 0, total_claimed: 0, total_pending: 0, explorer_url: null })),
  ]);

  const clusters = periode.clusterResults ?? [];
  const clusterPrioritas = [...clusters]
    .sort((a, b) => b.jumlahAnggota - a.jumlahAnggota)
    .slice(0, 2)
    .reduce((sum, c) => sum + c.jumlahAnggota, 0);

  return (
    <main className="overflow-x-clip pb-28">
      <div className="mx-auto max-w-[78rem] px-4 pt-8 sm:px-8">
        <PageHeader
          eyebrow="Portal Admin"
          title="Dashboard Program"
          description={`${periode.namaProgram} — status ${periode.status}. Verifikasi, clustering, ranking, dan pencairan dalam satu alur.`}
          actions={
            <Button href="#simulasi" icon={<ArrowRight className="h-[15px] w-[15px]" />}>
              Simulasikan bobot
            </Button>
          }
        />
      </div>

      <section className="px-4 pt-8 sm:px-8">
        <div className="mx-auto grid max-w-[78rem] grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[
            {
              label: "Pagu program",
              value: rupiahRingkas(periode.anggaranTotal),
              sub: "anggaran total periode berjalan",
              icon: <Scale className="h-[18px] w-[18px]" />,
            },
            {
              label: "Penerima lolos",
              value: angka(periode.kuotaPenerima ?? 0),
              sub: "kuota final setelah cutoff",
              icon: <ShieldCheck className="h-[18px] w-[18px]" />,
            },
            {
              label: "Data terverifikasi",
              value: angka(summary.total_verified),
              sub: `${angka(Math.max(summary.total_rumah_tangga - summary.total_verified, 0))} rumah tangga masih tertahan atau ditolak`,
              icon: <Users className="h-[18px] w-[18px]" />,
            },
            {
              label: "Cluster prioritas",
              value: angka(clusterPrioritas),
              sub: "dua kelompok paling rentan, masuk antrean ranking",
              icon: <Layers className="h-[18px] w-[18px]" />,
            },
            {
              label: "Dana siap disalurkan",
              value: rupiahRingkas(periode.totalAlokasi ?? 0),
              sub: `${rupiah(periode.sisaAnggaran ?? 0)} tersisa sebagai carry-over`,
              icon: <Scale className="h-[18px] w-[18px]" />,
            },
            {
              label: "Sudah diklaim",
              value: (periode.kuotaPenerima ?? 0) > 0 ? `${Math.round((summary.total_claimed / (periode.kuotaPenerima ?? 1)) * 100)}%` : "—",
              sub: `${angka(summary.total_claimed)} dari ${angka(periode.kuotaPenerima ?? 0)} penerima`,
              icon: <ShieldCheck className="h-[18px] w-[18px]" />,
            },
          ].map((item, index) => (
            <Reveal key={item.label} delay={index * 60}>
              <Bezel className="h-full">
                <div className="p-6">
                  <Stat label={item.label} value={item.value} sub={item.sub} icon={item.icon} />
                </div>
              </Bezel>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-4 py-5 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <Reveal>
            <Bezel>
              <div className="p-6 sm:p-7">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3">Jejak kontrak</p>
                <dl className="mt-4 flex flex-col divide-y divide-[var(--hairline)] text-[13px] sm:flex-row sm:divide-x sm:divide-y-0">
                  <div className="flex items-center justify-between gap-4 py-3 sm:flex-1 sm:flex-col sm:items-start sm:gap-1.5 sm:px-6 sm:py-0 sm:first:pl-0">
                    <dt className="text-ink-3">Merkle root</dt>
                    <dd>{periode.merkleRoot ? <Hash value={periode.merkleRoot} kepala={10} ekor={6} /> : <span className="text-ink-4">Belum dibangun</span>}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3 sm:flex-1 sm:flex-col sm:items-start sm:gap-1.5 sm:px-6 sm:py-0">
                    <dt className="text-ink-3">Kontrak</dt>
                    <dd>{periode.contractAddress ? <Hash value={periode.contractAddress} kepala={8} ekor={6} /> : <span className="text-ink-4">—</span>}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3 sm:flex-1 sm:flex-col sm:items-start sm:gap-1.5 sm:px-6 sm:py-0">
                    <dt className="text-ink-3">Status periode</dt>
                    <dd className="font-mono text-ink">{periode.status}</dd>
                  </div>
                </dl>
              </div>
            </Bezel>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-5 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          {clusters.length === 0 ? (
            <p className="text-[13px] text-ink-3">Belum ada hasil clustering untuk periode ini.</p>
          ) : (
            <ClusterSummaryCards clusters={clusters} />
          )}
        </div>
      </section>

      <section className="px-4 py-5 sm:px-8">
        <div className="mx-auto grid max-w-[78rem] grid-cols-1 gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Bezel>
              <div className="p-7 sm:p-9">
                <Eyebrow>Stage 2 · Alur Approval</Eyebrow>
                <div className="mt-8 grid grid-cols-1 gap-4">
                  {STATUS.map((status, index) => (
                    <div
                      key={status.tahap}
                      className="flex items-start gap-4 rounded-2xl bg-paper-2 p-4 ring-1 ring-[var(--hairline)]"
                    >
                      <span className="mt-0.5 font-mono text-[11px] text-ink-4">
                        {String(index + 1).padStart(2, "0")}
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
              <div className="flex h-full flex-col gap-6 p-7 sm:p-9">
                <Eyebrow tone="sage">Bobot Resmi Saat Ini</Eyebrow>
                <BobotList bobot={periode.bobotKriteria} />
              </div>
            </Bezel>
          </Reveal>
        </div>
      </section>

      <section id="simulasi" className="scroll-mt-24 py-5">
        <Reveal>
          <div className="mx-auto max-w-[78rem] px-4 sm:px-8">
            <div className="mb-5 max-w-2xl">
              <Eyebrow tone="gold">Stage 3 · Simulasi Bobot & Ranking</Eyebrow>
              <p className="mt-4 text-[13px] leading-[1.7] text-ink-2">
                Geser bobot, lihat pergeseran ranking, dan cek invarian sebelum dikunci ke chain.
              </p>
            </div>
          </div>
        </Reveal>
        <RuangKerja
          periodeId={id}
          initialBobot={periode.bobotKriteria}
          initialRanking={ranking.results as any}
          clusterIndexTarget={periode.clusterPrioritas}
          nominalDasar={periode.nominalDasar}
          biayaOperasional={periode.biayaOperasional}
          terkunci={periode.status === "approved" || periode.status === "disbursed"}
        />
      </section>

      <section className="px-4 pt-5 sm:px-8">
        <div className="mx-auto grid max-w-[78rem] grid-cols-1 gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <Bezel>
              <div className="p-7 sm:p-9">
                <Eyebrow>Stage 4 · Ledger Publik</Eyebrow>
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-paper-2 p-5 ring-1 ring-[var(--hairline)]">
                    <Stat
                      label="Transaksi berhasil"
                      value={angka(chainStatus.total_claimed)}
                      sub={`${angka(chainStatus.total_pending)} penerima masih menunggu klaim`}
                      icon={<Ledger className="h-[18px] w-[18px]" />}
                    />
                  </div>
                  <div className="rounded-2xl bg-paper-2 p-5 ring-1 ring-[var(--hairline)]">
                    <Stat
                      label="Nominal per keluarga"
                      value={rupiahRingkas(periode.nominalDasar)}
                      sub="skema flat, sama rata per keluarga"
                      icon={<Scale className="h-[18px] w-[18px]" />}
                    />
                  </div>
                  <div className="rounded-2xl bg-paper-2 p-5 ring-1 ring-[var(--hairline)]">
                    <Stat
                      label="Dana sudah tersalur"
                      value={rupiahRingkas(periode.nominalDasar * chainStatus.total_claimed)}
                      sub={`dari ${angka(chainStatus.total_recipients)} penerima terdaftar`}
                      icon={<Cube className="h-[18px] w-[18px]" />}
                    />
                  </div>
                </div>
              </div>
            </Bezel>
          </Reveal>

          <Reveal className="lg:col-span-5" delay={90}>
            <Bezel className="h-full">
              <div className="flex h-full flex-col gap-5 p-7 sm:p-9">
                <Eyebrow tone="sage">Jejak Audit</Eyebrow>
                <ul className="flex flex-col gap-3">
                  {[
                    "NIK asli tetap off-chain — publik hanya melihat kode anonim dan hash.",
                    "Alamat penerima terkunci di leaf; relayer tidak bisa mengalihkan dana.",
                    "Sisa pagu tercatat eksplisit sebagai carry-over, bukan selisih hilang.",
                  ].map((item) => (
                    <li key={item} className="text-[12px] leading-[1.65] text-ink-2">
                      {item}
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
