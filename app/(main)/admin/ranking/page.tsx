import { cookies } from "next/headers";
import { RuangKerja } from "@/components/admin/RuangKerja";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiClient } from "@/lib/api";
import { getPeriodeAktifId } from "@/lib/periode";

export default async function HalamanRanking() {
  const token = (await cookies()).get("sigap_token")?.value;
  const periodeId = await getPeriodeAktifId(token);
  const [periode, ranking] = await Promise.all([
    ApiClient.periode.getById(periodeId, token),
    ApiClient.mining.getRanking(periodeId, token),
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
          periodeId={periodeId}
          initialBobot={periode.bobotKriteria}
          initialRanking={ranking.results as any}
          clusterIndexTarget={periode.clusterPrioritas}
          nominalDasar={periode.nominalDasar}
          terkunci={periode.status === "approved" || periode.status === "disbursed"}
        />
      </section>
    </main>
  );
}
