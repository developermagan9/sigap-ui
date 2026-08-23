import { ClusterScatter } from "@/components/charts/ClusterScatter";
import { Reveal } from "@/components/ui/Reveal";
import { AdminAsideSummary, AdminHero, AdminSubnav, ClusterSummaryCards } from "@/components/admin/AdminShared";
import { dataset } from "@/lib/mock/data";

export default function HalamanHasilClustering() {
  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
      <AdminSubnav />

      <AdminHero
        eyebrow="Portal Admin · Hasil Clustering"
        title={
          <>
            Kelompok muncul dari data,
            <br />
            bukan label manual.
          </>
        }
        body={
          <>
            Scatter ini memperlihatkan hasil pembentukan cluster terhadap rumah tangga terverifikasi.
            Sumbu X menampilkan pendapatan per kapita, sumbu Y jumlah tanggungan, dan warna
            menunjukkan tingkat kerentanan setelah centroid diurutkan.
          </>
        }
        aside={<AdminAsideSummary />}
      />

      <section className="px-4 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto grid max-w-[78rem] gap-5 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <section className="rule-card p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Visualisasi cluster</p>
              <div className="mt-6">
                <ClusterScatter data={dataset.scatter} label={dataset.clusters.map((cluster) => cluster.label)} />
              </div>
            </section>
          </Reveal>

          <Reveal className="lg:col-span-4" delay={80}>
            <section className="rule-card p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Interpretasi</p>
              <ul className="mt-4 space-y-3 text-[13px] leading-6 text-[var(--color-ink-2)]">
                <li>Kelompok paling rentan punya pendapatan rendah dan tanggungan lebih besar.</li>
                <li>Cluster tidak menggantikan verifikasi manual; ia hanya membantu memisahkan populasi.</li>
                <li>Kecocokan segmen tetap perlu diuji dengan pengetahuan lapangan, bukan hanya angka.</li>
              </ul>
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
