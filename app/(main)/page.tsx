import Link from "next/link";
import { Ledger } from "@/components/ui/Icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { TransactionsTable } from "@/components/public/PublicShared";
import { ApiClient, type PublicProgramDetail, type PublicTransaksi } from "@/lib/api";
import { angka, persen, rupiahRingkas } from "@/lib/format";

/** Beranda publik (FE-2). Seluruh angka di halaman ini berasal dari
 *  `GET /public/programs` + `/public/programs/:id` + `/public/transactions` —
 *  tidak ada lagi pipeline mock di sisi klien. */
export default async function HomeDashboard() {
  const programs = await ApiClient.public.getPrograms();
  const terbaru = programs[0];

  if (!terbaru) return <BelumAdaProgram />;

  const [detail, transaksi] = await Promise.all([
    ApiClient.public.getProgramDetail(terbaru.id),
    ApiClient.public.getTransactions({ periode_id: terbaru.id, limit: 5 }),
  ]);

  return <Dashboard detail={detail} transaksi={transaksi.data} />;
}

function Dashboard({ detail, transaksi }: { detail: PublicProgramDetail; transaksi: PublicTransaksi[] }) {
  const totalAlokasi = detail.total_alokasi ?? 0;
  const progress = totalAlokasi > 0 ? detail.total_tersalur / totalAlokasi : 0;

  return (
    <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen">
      <div className="mb-8">
        <PageHeader
          eyebrow="Dashboard Sistem"
          title={detail.nama_program}
          description={
            <>
              Status periode: {detail.status}. Lihat{" "}
              <Link href={`/program/${detail.id}`} className="underline">
                detail program
              </Link>{" "}
              untuk rincian per wilayah.
            </>
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rule-card p-5 bg-[var(--color-paper)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Total Alokasi</p>
          <p className="mt-3 text-2xl font-mono font-medium text-[var(--color-ink)]">
            {rupiahRingkas(totalAlokasi)}
          </p>
          <p className="mt-2 text-xs text-[var(--color-ink-3)]">
            Pagu: {rupiahRingkas(detail.anggaran_total)}
          </p>
        </div>

        <div className="rule-card p-5 bg-[var(--color-paper)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Tersalurkan</p>
          <p className="mt-3 text-2xl font-mono font-medium text-[var(--color-ink)]">
            {rupiahRingkas(detail.total_tersalur)}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[var(--color-line)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-primary)]" style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="text-xs font-mono text-[var(--color-ink-3)]">{persen(progress)}</span>
          </div>
        </div>

        <div className="rule-card p-5 bg-[var(--color-paper)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Keluarga Penerima</p>
          <p className="mt-3 text-2xl font-mono font-medium text-[var(--color-ink)]">
            {angka(detail.kuota_penerima ?? detail.jumlah_penerima)}
          </p>
          <p className="mt-2 text-xs text-[var(--color-ink-3)]">
            Dari {angka(detail.total_verifikasi)} Terverifikasi
          </p>
        </div>

        <div className="rule-card p-5 bg-[var(--color-paper)] border-l-4 border-l-[var(--color-primary)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Status Periode</p>
          <p className="mt-3 text-xl font-heading font-bold uppercase text-[var(--color-primary)]">
            {detail.status}
          </p>
          <p
            className="mt-2 text-xs font-mono text-[var(--color-ink-3)] truncate"
            title={detail.merkle_root ?? "Merkle root belum dikunci"}
          >
            Root: {detail.merkle_root ? `${detail.merkle_root.slice(0, 10)}...` : "belum dikunci"}
          </p>
        </div>
      </div>

      <div className="rule-card p-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--color-line)] flex items-center gap-2 bg-[var(--color-canvas)]">
          <Ledger className="w-4 h-4 text-[var(--color-ink-3)]" />
          <h3 className="font-heading font-semibold text-base">Pencairan On-Chain Terbaru</h3>
        </div>
        <div className="px-4 pb-4 sm:px-6 sm:pb-5">
          <TransactionsTable rows={transaksi} />
        </div>
      </div>
    </main>
  );
}

/** Belum ada periode berstatus approved/disbursed — portal publik memang tidak
 *  menampilkan periode yang daftarnya masih bisa berubah. */
function BelumAdaProgram() {
  return (
    <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen">
      <PageHeader
        eyebrow="Dashboard Sistem"
        title="Belum ada program yang disahkan"
        description="Portal publik hanya menampilkan periode yang daftar penerimanya sudah final. Data akan muncul di sini setelah admin mengesahkan daftar dan mengunci Merkle root."
      />
    </main>
  );
}
