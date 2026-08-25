import { cookies } from "next/headers";
import { RuangKerja } from "@/components/admin/RuangKerja";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiClient } from "@/lib/api";
import { PERIODE_AKTIF_ID } from "@/lib/constants";

export default async function HalamanRanking() {
  const token = (await cookies()).get("sigap_token")?.value;
  const [periode, ranking] = await Promise.all([
    ApiClient.periode.getById(PERIODE_AKTIF_ID, token),
    ApiClient.mining.getRanking(PERIODE_AKTIF_ID, token),
  ]);

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Admin"
          title="Hasil Ranking Draft"
          description="Daftar ranking, perubahan urutan akibat simulasi, dan posisi tiap rumah tangga terhadap cutoff kuota."
        />
      </div>

      <section className="py-5">
        <RuangKerja
          periodeId={PERIODE_AKTIF_ID}
          initialBobot={periode.bobotKriteria}
          initialRanking={ranking.results as any}
          clusterIndexTarget={periode.clusterPrioritas}
          nominalDasar={periode.nominalDasar}
          biayaOperasional={periode.biayaOperasional}
          terkunci={periode.status === "approved" || periode.status === "disbursed"}
        />
      </section>
    </main>
  );
}
