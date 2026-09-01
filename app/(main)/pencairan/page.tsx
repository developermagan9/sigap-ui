import { Reveal } from "@/components/ui/Reveal";
import {
  DistributionList,
  ExplorerLink,
  MetaRow,
  PublicPageHero,
  TransactionsTable,
} from "@/components/public/PublicShared";
import { TabPanel } from "@/components/public/TabPanel";
import { ApiClient } from "@/lib/api";
import { angka, rupiahRingkas } from "@/lib/format";

/** Halaman Pencairan publik — dua tab, keduanya dari data backend nyata. */
export default async function HalamanPencairan() {
  const programs = await ApiClient.public.getPrograms();
  const terbaru = programs[0];

  if (!terbaru) {
    return (
      <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
        <PublicPageHero
          eyebrow="Portal Publik · Pencairan"
          title="Belum ada pencairan"
          body="Data pencairan muncul setelah daftar penerima sebuah periode disahkan."
        />
      </main>
    );
  }

  const [detail, transaksi] = await Promise.all([
    ApiClient.public.getProgramDetail(terbaru.id),
    ApiClient.public.getTransactions({ periode_id: terbaru.id, limit: 50 }),
  ]);

  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
      <PublicPageHero
        eyebrow="Portal Publik · Pencairan"
        title={
          <>
            Dana yang tersalur,
            <br />
            per transaksi dan per wilayah.
          </>
        }
        body={
          <>
            Lihat pencairan dana on-chain terbaru, atau beralih ke tab wilayah untuk melihat sebaran
            penerima per desa. Dipisah jadi dua tab agar masing-masing tetap mudah dibaca.
          </>
        }
        aside={
          <>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
              Ringkasan pencairan
            </p>
            <dl className="mt-5 space-y-4 text-[13px]">
              <MetaRow label="Dana tersalur" value={rupiahRingkas(detail.total_tersalur)} mono />
              <MetaRow label="Penerima terdaftar" value={angka(detail.jumlah_penerima)} mono />
              <MetaRow label="Wilayah tercakup" value={angka(detail.per_wilayah.length)} mono />
            </dl>
          </>
        }
      />

      <section className="px-4 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <TabPanel
            tabs={[
              {
                key: "onchain",
                label: "Pencairan On-chain",
                content: (
                  <Reveal>
                    <section className="rule-card p-6 sm:p-8">
                      <div className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-3)]">
                            Buku besar publik
                          </p>
                          <h2 className="mt-4 text-[2rem]">Pencairan on-chain terbaru</h2>
                        </div>
                        <ExplorerLink address={detail.contract_address} />
                      </div>

                      <TransactionsTable rows={transaksi.data} />

                      <p className="mt-5 text-[13px] leading-6 text-[var(--color-ink-3)]">
                        Tautan hash membuka block explorer. Identitas asli tetap off-chain dari perspektif
                        portal publik ini; yang ditampilkan hanya kode anonim dan wilayah.
                      </p>
                    </section>
                  </Reveal>
                ),
              },
              {
                key: "wilayah",
                label: "Distribusi Wilayah",
                content: (
                  <Reveal>
                    <section className="rule-card p-6 sm:p-8">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-3)]">
                        Sebaran penerima
                      </p>
                      <h2 className="mt-4 text-[2rem]">Distribusi per wilayah</h2>
                      <div className="mt-8">
                        <DistributionList perWilayah={detail.per_wilayah} />
                      </div>
                    </section>
                  </Reveal>
                ),
              },
            ]}
          />
        </div>
      </section>
    </main>
  );
}
