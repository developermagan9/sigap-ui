import { cookies } from "next/headers";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClusterSummaryCards } from "@/components/admin/AdminShared";
import { JalankanClustering } from "@/components/admin/JalankanClustering";
import { ApiClient } from "@/lib/api";
import { PERIODE_AKTIF_ID } from "@/lib/constants";

export default async function HalamanClustering() {
  const token = (await cookies()).get("sigap_token")?.value;
  const [periode, summary] = await Promise.all([
    ApiClient.periode.getById(PERIODE_AKTIF_ID, token),
    ApiClient.periode.getSummary(PERIODE_AKTIF_ID, token),
  ]);
  const clusters = periode.clusterResults ?? [];

  return (
    <main className="overflow-x-hidden pb-16 pt-8 sm:px-4">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Admin"
          title="Konfigurasi Clustering"
          description={`k = ${periode.kCluster} — memisahkan rumah tangga dari sangat rentan sampai mampu.`}
        />
      </div>

      <section className="px-4 pt-8 pb-16 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <JalankanClustering
            periodeId={PERIODE_AKTIF_ID}
            defaultK={periode.kCluster}
            totalVerified={summary.total_verified}
          />
        </div>
      </section>

      <section className="px-4 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          {clusters.length === 0 ? (
            <p className="text-[13px] text-[var(--color-ink-3)]">Belum ada hasil clustering untuk periode ini.</p>
          ) : (
            <ClusterSummaryCards clusters={clusters} />
          )}
        </div>
      </section>
    </main>
  );
}
