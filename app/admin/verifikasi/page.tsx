import { Antrean } from "@/components/verifikator/Antrean";
import { AdminAsideSummary, AdminHero, AdminStatsGrid, AdminSubnav } from "@/components/admin/AdminShared";
import { dataset } from "@/lib/mock/data";
import { angka } from "@/lib/format";

export default function HalamanVerifikasiAdmin() {
  const semua = dataset.semua;
  const menunggu = semua.filter((r) => r.statusVerifikasi === "pending");
  const ditandai = semua.filter((r) => r.flaggedDuplicate);
  const antrean = [...menunggu, ...ditandai.filter((r) => r.statusVerifikasi !== "pending")];

  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
      <AdminSubnav />

      <AdminHero
        eyebrow="Portal Admin · Antrian Verifikasi"
        title={
          <>
            Algoritma mengusulkan,
            <br />
            manusia memutuskan.
          </>
        }
        body={
          <>
            Data yang tidak lolos di meja ini tidak akan pernah masuk clustering dan ranking. Setiap
            penolakan butuh alasan tertulis, dan setiap approval menjadi bagian dari jejak audit.
            Per 20 Agustus 2026, ada {angka(antrean.length)} berkas yang masih perlu keputusan.
          </>
        }
        aside={<AdminAsideSummary />}
      />

      <section className="px-4 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-[78rem]">
          <AdminStatsGrid />
        </div>
      </section>

      <Antrean baris={antrean} />
    </main>
  );
}
