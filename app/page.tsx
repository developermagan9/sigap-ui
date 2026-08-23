import { Button } from "@/components/ui/Button";
import { ArrowRight, Search, Ledger } from "@/components/ui/Icons";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  DistributionList,
  ExplorerLink,
  TransactionsTable,
} from "@/components/public/PublicShared";
import { PROGRAM, dataset, ringkasanPublik as R } from "@/lib/mock/data";
import { persen, rupiahRingkas } from "@/lib/format";

export default function HomeDashboard() {
  const progress = R.totalTersalur / R.totalAlokasi;

  return (
    <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen">
      <div className="mb-8">
        <PageHeader
          eyebrow="Dashboard Sistem"
          title={PROGRAM.nama}
          description={`Periode: ${PROGRAM.periode}`}
          actions={
            <>
              <Button href="/cek-status" variant="ghost" icon={<Search className="w-4 h-4" />}>
                Cek NIK
              </Button>
              <Button href="/login" icon={<ArrowRight className="w-4 h-4" />}>
                Masuk Sistem
              </Button>
            </>
          }
        />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rule-card p-5 bg-[var(--color-paper)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
            Total Alokasi
          </p>
          <p className="mt-3 text-2xl font-mono font-medium text-[var(--color-ink)]">
            {rupiahRingkas(R.totalAlokasi)}
          </p>
          <p className="mt-2 text-xs text-[var(--color-ink-3)]">
            Pagu: {rupiahRingkas(R.totalAnggaran)}
          </p>
        </div>

        <div className="rule-card p-5 bg-[var(--color-paper)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
            Tersalurkan
          </p>
          <p className="mt-3 text-2xl font-mono font-medium text-[var(--color-ink)]">
            {rupiahRingkas(R.totalTersalur)}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[var(--color-line)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--color-primary)]" 
                style={{ width: `${progress * 100}%` }} 
              />
            </div>
            <span className="text-xs font-mono text-[var(--color-ink-3)]">
              {persen(progress)}
            </span>
          </div>
        </div>

        <div className="rule-card p-5 bg-[var(--color-paper)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
            Keluarga Penerima
          </p>
          <p className="mt-3 text-2xl font-mono font-medium text-[var(--color-ink)]">
            {dataset.alokasi.kuotaPenerima.toLocaleString("id-ID")}
          </p>
          <p className="mt-2 text-xs text-[var(--color-ink-3)]">
            Dari {R.jumlahTerverifikasi.toLocaleString("id-ID")} Terverifikasi
          </p>
        </div>

        <div className="rule-card p-5 bg-[var(--color-paper)] border-l-4 border-l-[var(--color-primary)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
            Status Periode
          </p>
          <p className="mt-3 text-xl font-heading font-bold text-[var(--color-primary)]">
            PENYALURAN
          </p>
          <p className="mt-2 text-xs font-mono text-[var(--color-ink-3)] truncate" title={dataset.merkleRoot}>
            Root: {dataset.merkleRoot.slice(0, 10)}...
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rule-card p-0 overflow-hidden">
          <div className="p-4 border-b border-[var(--color-line)] flex justify-between items-center bg-[var(--color-canvas)]">
            <div className="flex items-center gap-2">
              <Ledger className="w-4 h-4 text-[var(--color-ink-3)]" />
              <h3 className="font-heading font-semibold text-base">Pencairan On-Chain Terbaru</h3>
            </div>
            <ExplorerLink />
          </div>
          <div className="p-0">
            <TransactionsTable limit={5} />
          </div>
        </div>

        <div className="rule-card p-0 overflow-hidden">
          <div className="p-4 border-b border-[var(--color-line)] bg-[var(--color-canvas)]">
            <h3 className="font-heading font-semibold text-base">Distribusi Wilayah</h3>
          </div>
          <div className="p-5">
            <DistributionList />
          </div>
        </div>
      </div>
    </main>
  );
}
