import { cookies } from "next/headers";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClusterSummaryCards } from "@/components/admin/AdminShared";
import { ApiClient } from "@/lib/api";
import { PERIODE_AKTIF_ID } from "@/lib/constants";
import { angka } from "@/lib/format";

export default async function HalamanHasilClustering() {
  const token = (await cookies()).get("sigap_token")?.value;
  const periode = await ApiClient.periode.getById(PERIODE_AKTIF_ID, token);
  const clusters = periode.clusterResults ?? [];
  const totalAnggota = clusters.reduce((s, c) => s + c.jumlahAnggota, 0);

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Admin"
          title="Hasil Clustering"
          description="Sumbu pengelompokan: pendapatan per kapita, tanggungan, disabilitas/lansia, kondisi rumah."
        />
      </div>

      {clusters.length === 0 ? (
        <section className="px-4 pt-8 sm:px-8">
          <p className="mx-auto max-w-[78rem] text-[13px] text-[var(--color-ink-3)]">
            Belum ada hasil clustering untuk periode ini — jalankan dulu di halaman{" "}
            <a href="/admin/clustering" className="underline">Analisis Clustering</a>.
          </p>
        </section>
      ) : (
        <>
          <section className="px-4 pt-8 pb-16 sm:px-8">
            <div className="mx-auto grid max-w-[78rem] gap-5 lg:grid-cols-12">
              <Reveal className="lg:col-span-8">
                <section className="rule-card p-6 sm:p-8">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Distribusi kelompok</p>
                  <div className="mt-6 flex flex-col gap-4">
                    {clusters.map((c) => (
                      <div key={c.clusterIndex}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[13px] text-[var(--color-ink-2)]">{c.label}</span>
                          <span className="font-mono text-[12px] text-[var(--color-ink-3)]">
                            {angka(c.jumlahAnggota)} KK · {totalAnggota > 0 ? Math.round((c.jumlahAnggota / totalAnggota) * 100) : 0}%
                          </span>
                        </div>
                        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--color-paper-2)]">
                          <div
                            className="h-full bg-[var(--color-primary)]"
                            style={{ width: `${totalAnggota > 0 ? (c.jumlahAnggota / totalAnggota) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 text-[12px] leading-relaxed text-[var(--color-ink-3)]">
                    Sebaran titik per rumah tangga tidak ditampilkan di sini — assignment cluster per
                    rumah tangga belum disimpan di backend (cuma agregat per kelompok).
                  </p>
                </section>
              </Reveal>

              <Reveal className="lg:col-span-4" delay={80}>
                <section className="rule-card p-6 sm:p-8">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Interpretasi</p>
                  <ul className="mt-4 space-y-3 text-[13px] leading-6 text-[var(--color-ink-2)]">
                    <li>Kelompok paling rentan: pendapatan rendah, tanggungan besar.</li>
                    <li>Bukan pengganti verifikasi manual — alat pemisah populasi.</li>
                    <li>Kecocokan segmen tetap perlu divalidasi lapangan.</li>
                  </ul>
                </section>
              </Reveal>
            </div>
          </section>

          <section className="px-4 sm:px-8">
            <div className="mx-auto max-w-[78rem]">
              <ClusterSummaryCards clusters={clusters} />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
