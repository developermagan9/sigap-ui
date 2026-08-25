import { cookies } from "next/headers";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { PetugasStatsGrid, PetugasTaskCards } from "@/components/petugas/PetugasShared";
import { ApiClient } from "@/lib/api";
import { PERIODE_AKTIF_ID } from "@/lib/constants";

export default async function HalamanTugasPetugas() {
  const token = (await cookies()).get("sigap_token")?.value;
  const { data } = await ApiClient.rumahTangga.getAll({ periode_id: PERIODE_AKTIF_ID, limit: 100 }, token);

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Petugas"
          title="Daftar Tugas Wilayah"
          description="Antrean rumah tangga di wilayah tugas aktif yang perlu didata atau dilengkapi."
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
            <div className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Antrian wilayah</p>
                <h2 className="mt-4 text-[2rem]">Tugas aktif hari ini</h2>
              </div>
              <Button href="/petugas/pendataan">Mulai input baru</Button>
            </div>
          </Reveal>

          <div className="mt-8">
            <PetugasTaskCards items={data} />
          </div>
        </div>
      </section>
    </main>
  );
}
