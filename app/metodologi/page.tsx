import {
  MethodologyEvidence,
  MethodologyGrid,
  TraceStep,
} from "@/components/public/PublicShared";
import { PageHeader } from "@/components/ui/PageHeader";
import { dataset, PROGRAM, ringkasanPublik as R } from "@/lib/mock/data";
import { angka, rupiahRingkas } from "@/lib/format";

export default function HalamanMetodologi() {
  return (
    <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen">
      <div className="mb-8">
        <PageHeader
          eyebrow={`Metodologi · ${PROGRAM.nama}`}
          title="Kriteria & Penentuan Prioritas"
          description="Bobot, cutoff skor, dan daftar final penerima dapat diaudit publik."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] mb-6">
        <div className="rule-card p-0 overflow-hidden">
          <div className="p-4 border-b border-[var(--color-line)] bg-[var(--color-canvas)]">
            <h3 className="font-heading font-semibold text-base">Sumber Data</h3>
          </div>
          <div className="p-5">
            <MethodologyEvidence />
          </div>
        </div>

        <div className="rule-card p-5 bg-[var(--color-paper)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
            Batas periode ini
          </p>
          <p className="mt-3 font-mono text-[2rem] leading-none text-[var(--color-accent)]">
            {dataset.alokasi.cutoff.selisih ? dataset.alokasi.cutoff.selisih.toFixed(6) : "0.000000"}
          </p>
          <p className="mt-2 text-xs text-[var(--color-ink-3)]">
            Selisih skor penerima terakhir vs kandidat berikutnya
          </p>
        </div>
      </div>

      <div className="mb-6">
        <MethodologyGrid />
      </div>

      <div className="rule-card p-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--color-line)] bg-[var(--color-canvas)]">
          <h3 className="font-heading font-semibold text-base">Jalur Keputusan</h3>
        </div>
        <div className="grid gap-8 p-5 lg:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)] mb-3">
              Apa yang bisa diperiksa publik
            </p>
            <ul className="space-y-3 text-[14px] leading-6 text-[var(--color-ink-2)]">
              <li>Bobot kriteria dan pendekatan ranking.</li>
              <li>Jumlah penerima, pagu, dan realisasi dana.</li>
              <li>Hash transaksi serta jejak penyaluran di block explorer.</li>
              <li>Daftar final terkunci setelah disahkan.</li>
            </ul>
          </div>
          <div className="relative pl-5">
            <span className="trail-line" aria-hidden="true" />
            <div className="space-y-4">
              <TraceStep label="Keluarga diverifikasi" meta={`${angka(R.jumlahTerverifikasi)} keluarga`} />
              <TraceStep label="Cluster prioritas dihitung" meta={`${dataset.clusters.length} cluster`} />
              <TraceStep
                label="Kuota final ditetapkan"
                meta={`${angka(dataset.alokasi.kuotaPenerima)} penerima`}
              />
              <TraceStep label="Dana ter-update publik" meta={rupiahRingkas(R.totalTersalur)} active />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
