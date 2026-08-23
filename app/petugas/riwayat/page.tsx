import { Reveal } from "@/components/ui/Reveal";
import { PetugasAsideSummary, PetugasHero, PetugasStatsGrid, PetugasSubnav, RiwayatList } from "@/components/petugas/PetugasShared";

export default function HalamanRiwayatPetugas() {
  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
      <PetugasSubnav />

      <PetugasHero
        eyebrow="Portal Petugas · Riwayat Input"
        title={
          <>
            Pantau hasil input
            <br />
            dari lapangan.
          </>
        }
        body={
          <>
            Riwayat ini membantu petugas melihat mana entri yang masih `pending`, mana yang lolos,
            dan mana yang perlu revisi karena ditandai potensi duplikat atau kekurangan dokumen.
          </>
        }
        aside={<PetugasAsideSummary />}
      />

      <section className="px-4 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-[78rem]">
          <PetugasStatsGrid />
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
            <RiwayatList />
          </div>
        </div>
      </section>
    </main>
  );
}
