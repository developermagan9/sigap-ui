import { cookies } from "next/headers";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { PetugasStatsGrid, RiwayatList } from "@/components/petugas/PetugasShared";
import { ApiClient } from "@/lib/api";
import { PERIODE_AKTIF_ID } from "@/lib/constants";

export default async function HalamanRiwayatPetugas() {
  const token = (await cookies()).get("sigap_token")?.value;
  const { data } = await ApiClient.rumahTangga.getAll({ periode_id: PERIODE_AKTIF_ID, limit: 100 }, token);

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Petugas"
          title="Riwayat Input"
          description="Status tiap entri: pending, lolos, atau ditandai duplikat/dokumen kurang."
        />
      </div>

      <section className="px-4 pt-8 pb-16 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <PetugasStatsGrid items={data} />
        </div>
      </section>

      <section className="px-4 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <Reveal>
            <div className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Riwayat status</p>
              <h2 className="text-[2rem]">Entri yang dikirim petugas</h2>
            </div>
          </Reveal>

          <div className="mt-8">
            <RiwayatList items={data} />
          </div>
        </div>
      </section>
    </main>
  );
}
