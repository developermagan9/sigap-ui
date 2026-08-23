import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { PetugasAsideSummary, PetugasHero, PetugasStatsGrid, PetugasSubnav, PetugasTaskCards } from "@/components/petugas/PetugasShared";

export default function HalamanTugasPetugas() {
  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
      <PetugasSubnav />

      <PetugasHero
        eyebrow="Portal Petugas · Daftar Tugas Wilayah"
        title={
          <>
            Daftar rumah tangga
            <br />
            yang perlu didata.
          </>
        }
        body={
          <>
            Petugas melihat antrean rumah tangga berdasarkan wilayah tugas aktif. Dari sini petugas
            bisa masuk ke form input baru, melengkapi data lama, atau menindaklanjuti entri yang
            masih kurang.
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
            <div className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Antrian wilayah</p>
                <h2 className="mt-4 text-[2rem]">Tugas aktif hari ini</h2>
              </div>
              <Button href="/petugas/pendataan">Mulai input baru</Button>
            </div>
          </Reveal>

          <div className="mt-8">
            <PetugasTaskCards />
          </div>
        </div>
      </section>
    </main>
  );
}
