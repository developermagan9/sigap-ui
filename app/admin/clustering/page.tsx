import { ClusterScatter } from "@/components/charts/ClusterScatter";
import { ElbowChart } from "@/components/charts/ElbowChart";
import { Reveal } from "@/components/ui/Reveal";
import { AdminAsideSummary, AdminHero, AdminSubnav, ClusterSummaryCards } from "@/components/admin/AdminShared";
import { PROGRAM, dataset } from "@/lib/mock/data";
import { angka } from "@/lib/format";

export default function HalamanClustering() {
  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
      <AdminSubnav />

      <AdminHero
        eyebrow="Portal Admin · Konfigurasi Clustering"
        title={
          <>
            Memilih jumlah kelompok
            <br />
            yang masih bisa dijelaskan.
          </>
        }
        body={
          <>
            Untuk demo periode {PROGRAM.periode}, konfigurasi saat ini menggunakan `k = {PROGRAM.kCluster}`.
            Tujuannya memisahkan rumah tangga dari sangat rentan sampai mampu tanpa membuat segmen
            terlalu pecah untuk dijelaskan ke pengambil kebijakan.
          </>
        }
        aside={<AdminAsideSummary />}
      />

      <section className="px-4 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto grid max-w-[78rem] gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <section className="rule-card p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Konfigurasi aktif</p>
              <h2 className="mt-4 text-[2rem]">Pemisahan kerentanan berdasarkan fitur numerik</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["Jumlah cluster", String(PROGRAM.kCluster)],
                  ["Fitur utama", "Pendapatan/kapita, tanggungan, disabilitas/lansia, kondisi rumah"],
                  ["Iterasi konvergen", angka(dataset.km.iterations)],
                  ["Rumah tangga terverifikasi", angka(dataset.peserta.length)],
                ].map(([k, v]) => (
                  <div key={k} className="border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-4)]">{k}</p>
                    <p className="mt-2 text-[13px] leading-6 text-[var(--color-ink-2)]">{v}</p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal className="lg:col-span-5" delay={80}>
            <section className="rule-card p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Elbow chart</p>
              <h2 className="mt-4 text-[2rem]">Titik siku dipertahankan di k = {PROGRAM.kCluster}</h2>
              <div className="mt-6">
                <ElbowChart data={dataset.elbow} pilih={PROGRAM.kCluster} />
              </div>
            </section>
          </Reveal>
        </div>
      </section>

      <section className="px-4 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <ClusterSummaryCards />
        </div>
      </section>
    </main>
  );
}
