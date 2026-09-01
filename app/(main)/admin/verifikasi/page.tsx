import { cookies } from "next/headers";
import { Antrean } from "@/components/verifikator/Antrean";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminStatsGrid } from "@/components/admin/AdminShared";
import { ApiClient } from "@/lib/api";
import { getPeriodeAktifId } from "@/lib/periode";
import { angka } from "@/lib/format";

export default async function HalamanVerifikasiAdmin() {
  const token = (await cookies()).get("sigap_token")?.value;
  const periodeId = await getPeriodeAktifId(token);

  const [rumahTangga, summary, periode] = await Promise.all([
    ApiClient.rumahTangga.getAll({ periode_id: periodeId, limit: 100 }, token),
    ApiClient.periode.getSummary(periodeId, token),
    ApiClient.periode.getById(periodeId, token),
  ]);

  // Antrean = berkas yang belum diputuskan. Berkas yang ditandai (flaggedDuplicate)
  // tetap tampil selama masih pending, tapi tidak lagi muncul selamanya begitu
  // sudah diputuskan verifikator — beda dari perilaku data mock sebelumnya.
  const antrean = rumahTangga.data.filter((r) => r.statusVerifikasi === "pending");

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Admin"
          title="Antrian Verifikasi"
          description={`${angka(antrean.length)} berkas masih menunggu keputusan approve/reject.`}
        />
      </div>

      <section className="px-4 pt-8 pb-16 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <AdminStatsGrid
            totalRumahTangga={summary.total_rumah_tangga}
            dataTerverifikasi={summary.total_verified}
            clusterPrioritas={summary.total_terpilih}
            totalAlokasi={periode.totalAlokasi ?? 0}
            sisaAnggaran={periode.sisaAnggaran ?? 0}
            kuotaPenerima={periode.kuotaPenerima ?? 0}
            jumlahKlaim={summary.total_claimed}
          />
        </div>
      </section>

      <Antrean baris={antrean} />
    </main>
  );
}
