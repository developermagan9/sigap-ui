import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import {
  ExplorerLink,
  MetaRow,
  PublicPageHero,
  StatusChip,
  TransactionsTable,
} from "@/components/public/PublicShared";
import { ApiClient } from "@/lib/api";
import { angka, rupiahRingkas } from "@/lib/format";

const PER_HALAMAN = 20;

/** Jejak Transaksi publik (FE-4) — ber-pagination lewat `GET /public/transactions`. */
export default async function HalamanTransaksi({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = Math.max(1, Number((await searchParams).page) || 1);

  const programs = await ApiClient.public.getPrograms();
  const terbaru = programs[0];

  if (!terbaru) {
    return (
      <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
        <PublicPageHero
          eyebrow="Jejak Transaksi"
          title="Belum ada transaksi"
          body="Portal publik hanya menampilkan periode yang daftar penerimanya sudah disahkan."
        />
      </main>
    );
  }

  const [detail, transaksi] = await Promise.all([
    ApiClient.public.getProgramDetail(terbaru.id),
    ApiClient.public.getTransactions({ periode_id: terbaru.id, page, limit: PER_HALAMAN }),
  ]);

  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
      <PublicPageHero
        eyebrow={`Jejak Transaksi · ${detail.nama_program}`}
        title={
          <>
            Jejak transaksi
            <br />
            pencairan terbaru.
          </>
        }
        body={
          <>
            Semua transaksi yang tampil di sini sudah dianonimkan menjadi kode referensi. Warga bisa
            memeriksa nominal dan waktu pencairan tanpa membuka identitas pribadi penerima lain.
          </>
        }
        aside={
          <>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
              Ringkasan transaksi
            </p>
            <dl className="mt-5 space-y-4 text-[13px]">
              <MetaRow label="Total penerima" value={angka(transaksi.meta.total)} mono />
              <MetaRow label="Dana tersalur" value={rupiahRingkas(detail.total_tersalur)} mono />
              <MetaRow label="Penerima sukses klaim" value={angka(detail.jumlah_terklaim)} mono />
              <MetaRow label="Status tampilan" value={<StatusChip>publik</StatusChip>} />
            </dl>
          </>
        }
      />

      <section className="px-4 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <Reveal>
            <section className="rule-card p-6 sm:p-8">
              <div className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-3)]">
                    Buku besar publik
                  </p>
                  <h2 className="mt-4 text-[2rem]">Daftar transaksi periode berjalan</h2>
                </div>
                <ExplorerLink address={detail.contract_address} />
              </div>

              <TransactionsTable rows={transaksi.data} />

              {transaksi.meta.totalPages > 1 ? (
                <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Navigasi halaman">
                  <Pager page={page - 1} disabled={page <= 1}>
                    ← Sebelumnya
                  </Pager>
                  <span className="font-mono text-[12px] text-[var(--color-ink-3)]">
                    Halaman {page} dari {transaksi.meta.totalPages}
                  </span>
                  <Pager page={page + 1} disabled={page >= transaksi.meta.totalPages}>
                    Berikutnya →
                  </Pager>
                </nav>
              ) : null}

              <p className="mt-5 text-[13px] leading-6 text-[var(--color-ink-3)]">
                Tautan hash membuka block explorer. Identitas asli tetap off-chain dari perspektif
                portal publik ini; yang ditampilkan hanya kode anonim dan wilayah.
              </p>
            </section>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function Pager({ page, disabled, children }: { page: number; disabled: boolean; children: React.ReactNode }) {
  const kelas = "rounded-md border border-[var(--color-line)] px-3 py-2 text-[13px] transition-colors";
  if (disabled) return <span className={`${kelas} text-[var(--color-ink-4)] opacity-50`}>{children}</span>;
  return (
    <Link href={`/transaksi?page=${page}`} className={`${kelas} bg-white hover:bg-[var(--color-paper-2)]`}>
      {children}
    </Link>
  );
}
