import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import {
  DistributionList,
  ExplorerLink,
  MetaRow,
  PeriodSummaryAside,
  ProgramStatsGrid,
  PublicPageHero,
  TrailIndicator,
  TransactionsTable,
} from "@/components/public/PublicShared";
import { ApiClient } from "@/lib/api";
import { NAMA_JARINGAN } from "@/lib/constants";
import { angka, persen, rupiah, rupiahRingkas } from "@/lib/format";

/** Detail satu program publik. `periodeId` sekarang UUID periode sungguhan —
 *  periode yang belum disahkan mengembalikan 404 dari backend (bukan 404 karena
 *  tidak cocok dengan satu id mock seperti sebelumnya). */
export default async function HalamanDetailProgram({
  params,
}: {
  params: Promise<{ periodeId: string }>;
}) {
  const { periodeId } = await params;

  let detail;
  try {
    detail = await ApiClient.public.getProgramDetail(periodeId);
  } catch {
    notFound();
  }

  const transaksi = await ApiClient.public.getTransactions({ periode_id: periodeId, limit: 8 });
  const totalAlokasi = detail.total_alokasi ?? 0;

  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
      <PublicPageHero
        eyebrow={`Detail Program · ${detail.status}`}
        title={
          <>
            Detail program dan
            <br />
            periode penyaluran.
          </>
        }
        body={
          <>
            Halaman ini merangkum angka periode {detail.nama_program}, termasuk komposisi kuota,
            distribusi per wilayah, dan status pencairan terbaru yang dapat dicocokkan dengan data
            on-chain.
          </>
        }
        aside={
          <>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
              Ringkasan periode
            </p>
            <dl className="mt-5 space-y-4 text-[13px]">
              <MetaRow label="Nama program" value={detail.nama_program} />
              <MetaRow label="Status" value={detail.status} />
              <MetaRow label="Jaringan" value={NAMA_JARINGAN} />
              <MetaRow label="Nominal dasar" value={rupiah(detail.nominal_dasar)} mono />
            </dl>
          </>
        }
      />

      <section className="px-4 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-[78rem]">
          <ProgramStatsGrid detail={detail} />
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
                <DistributionList perWilayah={detail.per_wilayah} />
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
                <TrailIndicator status={detail.status} />
              </div>

              <div className="mt-8 border-t border-[var(--color-line)] pt-6">
                <dl className="space-y-4 text-[13px]">
                  <MetaRow label="Rumah tangga diverifikasi" value={angka(detail.total_verifikasi)} mono />
                  <MetaRow
                    label="Jumlah penerima"
                    value={angka(detail.kuota_penerima ?? detail.jumlah_penerima)}
                    mono
                  />
                  <MetaRow
                    label="Realisasi saat ini"
                    value={persen(totalAlokasi > 0 ? detail.total_tersalur / totalAlokasi : 0)}
                    mono
                  />
                  <MetaRow label="Dana telah tersalur" value={rupiahRingkas(detail.total_tersalur)} mono />
                </dl>
              </div>

              <div className="mt-8 border-t border-[var(--color-line)] pt-6">
                <PeriodSummaryAside detail={detail} />
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
                <ExplorerLink address={detail.contract_address} />
              </div>
              <TransactionsTable rows={transaksi.data} />
            </section>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
