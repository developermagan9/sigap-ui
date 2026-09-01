import { notFound } from "next/navigation";
import {
  BobotKriteriaPublik,
  MethodologyEvidence,
  MethodologyGrid,
  TraceStep,
} from "@/components/public/PublicShared";
import { PageHeader } from "@/components/ui/PageHeader";
import { KRITERIA_LABEL } from "@/components/admin/AdminShared";
import { ApiClient } from "@/lib/api";
import { angka, rupiahRingkas } from "@/lib/format";

/**
 * Halaman Metodologi publik (FE-3).
 *
 * Bobot yang tampil dibaca dari `periode_program.bobot_kriteria` periode yang
 * sedang berlaku — ubah bobot di `/admin/bobot`, jalankan ulang ranking, dan
 * angka di sini ikut berubah. Halaman ini sengaja TIDAK menampilkan data
 * individu apa pun (07-Security-Privacy-Ethics.md §4).
 */
export default async function HalamanMetodologi() {
  const programs = await ApiClient.public.getPrograms();
  const terbaru = programs[0];
  if (!terbaru) notFound();

  const detail = await ApiClient.public.getProgramDetail(terbaru.id);
  const selisih = detail.cutoff.selisih;

  return (
    <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen">
      <div className="mb-8">
        <PageHeader
          eyebrow={`Metodologi · ${detail.nama_program}`}
          title="Kriteria & Penentuan Prioritas"
          description="Bobot, cutoff skor, dan daftar final penerima dapat diaudit publik."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] mb-6">
        <div className="rule-card p-0 overflow-hidden">
          <div className="p-4 border-b border-[var(--color-line)] bg-[var(--color-canvas)]">
            <h3 className="font-heading font-semibold text-base">Bobot kriteria periode ini</h3>
          </div>
          <div className="p-5">
            <BobotKriteriaPublik bobot={detail.bobot_kriteria} label={KRITERIA_LABEL} />
            <div className="mt-6 border-t border-[var(--color-line)] pt-5">
              <h4 className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Sumber data</h4>
              <MethodologyEvidence detail={detail} />
            </div>
          </div>
        </div>

        <div className="rule-card p-5 bg-[var(--color-paper)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Batas periode ini</p>
          <p className="mt-3 font-mono text-[2rem] leading-none text-[var(--color-accent)]">
            {selisih === null ? "—" : selisih.toFixed(6)}
          </p>
          <p className="mt-2 text-xs text-[var(--color-ink-3)]">
            Selisih skor penerima terakhir vs kandidat berikutnya
          </p>
          <dl className="mt-6 space-y-3 border-t border-[var(--color-line)] pt-5 text-[12px]">
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--color-ink-3)]">Jumlah cluster (k)</dt>
              <dd className="font-mono">{detail.k_cluster}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--color-ink-3)]">Silhouette score</dt>
              <dd className="font-mono">
                {detail.silhouette_score === null ? "—" : detail.silhouette_score.toFixed(3)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--color-ink-3)]">Skema alokasi</dt>
              <dd className="font-mono">{detail.skema_alokasi}</dd>
            </div>
          </dl>
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
              <TraceStep label="Keluarga diverifikasi" meta={`${angka(detail.total_verifikasi)} keluarga`} />
              <TraceStep label="Cluster prioritas dihitung" meta={`${detail.clusters.length} cluster`} />
              <TraceStep
                label="Kuota final ditetapkan"
                meta={`${angka(detail.kuota_penerima ?? detail.jumlah_penerima)} penerima`}
              />
              <TraceStep label="Dana ter-update publik" meta={rupiahRingkas(detail.total_tersalur)} active />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
