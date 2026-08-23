import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import {
  DistributionList,
  ExplorerLink,
  MetaRow,
  ProgramStatsGrid,
  PublicPageHero,
  PublicSubnav,
  TrailIndicator,
  TransactionsTable,
} from "@/components/public/PublicShared";
import { dataset, PROGRAM, ringkasanPublik as R } from "@/lib/mock/data";
import { angka, persen, rupiah, rupiahRingkas } from "@/lib/format";

export default async function HalamanDetailProgram({
  params,
}: {
  params: Promise<{ periodeId: string }>;
}) {
  const { periodeId } = await params;

  if (periodeId !== String(PROGRAM.id)) notFound();

  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">

      <PublicPageHero
        eyebrow={`Detail Program · Periode ${PROGRAM.id}`}
        title={
          <>
            Detail program dan
            <br />
            periode penyaluran.
          </>
        }
        body={
          <>
            Halaman ini merangkum angka periode {PROGRAM.periode}, termasuk komposisi kuota,
            distribusi per wilayah, dan status pencairan terbaru yang dapat dicocokkan dengan
            data on-chain.
          </>
        }
        aside={
          <>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
              Ringkasan periode
            </p>
            <dl className="mt-5 space-y-4 text-[13px]">
              <MetaRow label="Nama program" value={PROGRAM.nama} />
              <MetaRow label="Periode" value={PROGRAM.periode} />
              <MetaRow label="Jaringan" value={PROGRAM.jaringan} />
              <MetaRow label="Nominal dasar" value={rupiah(PROGRAM.nominalDasar)} mono />
            </dl>
          </>
        }
      />

      <section className="px-4 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-[78rem]">
          <ProgramStatsGrid />
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto grid max-w-[78rem] gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <section className="rule-card p-6 sm:p-8">
              <div className="flex items-end justify-between gap-4 border-b border-[var(--color-line)] pb-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-3)]">
                    Distribusi per wilayah
                  </p>
                  <h2 className="mt-4 text-[2rem]">Sebaran penerima dan progres klaim</h2>
                </div>
              </div>
              <div className="mt-6">
                <DistributionList limit={R.perWilayah.length} />
              </div>
            </section>
          </Reveal>

          <Reveal className="lg:col-span-5" delay={80}>
            <section className="rule-card h-full p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-3)]">
                Tahap periode
              </p>
              <h2 className="mt-4 text-[2rem]">Jejak verifikasi</h2>
              <div className="mt-6">
                <TrailIndicator />
              </div>

              <div className="mt-8 border-t border-[var(--color-line)] pt-6">
                <dl className="space-y-4 text-[13px]">
                  <MetaRow label="Rumah tangga diverifikasi" value={angka(R.jumlahTerverifikasi)} mono />
                  <MetaRow label="Kuota penerima" value={angka(dataset.alokasi.kuotaPenerima)} mono />
                  <MetaRow label="Realisasi saat ini" value={persen(R.totalTersalur / R.totalAlokasi)} mono />
                  <MetaRow label="Dana telah tersalur" value={rupiahRingkas(R.totalTersalur)} mono />
                </dl>
              </div>
            </section>
          </Reveal>
        </div>
      </section>

      <section className="px-4 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <Reveal>
            <section className="rule-card p-6 sm:p-8">
              <div className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-3)]">
                    Sampel transaksi
                  </p>
                  <h2 className="mt-4 text-[2rem]">Pencairan terbaru pada periode ini</h2>
                </div>
                <ExplorerLink />
              </div>
              <TransactionsTable limit={8} />
            </section>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
