import { FormPendataan } from "@/components/form/FormPendataan";
import { Bezel } from "@/components/ui/Bezel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { KASUS_DUPLIKAT } from "@/lib/mock/generate";
import { Alert, Check } from "@/components/ui/Icons";
import { PetugasAsideSummary, PetugasHero, PetugasQuickSteps, PetugasSubnav } from "@/components/petugas/PetugasShared";

export default function Halaman() {
  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
      <PetugasSubnav />

      <PetugasHero
        eyebrow="Portal Petugas · Form Input KK"
        title={
          <>
            Satu keluarga, satu
            <br />
            baris, sekali saja.
          </>
        }
        body={
          <>
            Formulir ini menolak data ganda di tiga jalur sekaligus: NIK kepala keluarga, nomor
            kartu keluarga, dan NIK tiap anggota. Jalur ketiga itu yang menutup modus memecah satu
            keluarga menjadi dua kartu demi bantuan dobel.
          </>
        }
        aside={<PetugasAsideSummary />}
      />

      <section className="px-4 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-[78rem]">
          <PetugasQuickSteps />
        </div>
      </section>

      <FormPendataan />

      <section className="px-4 pt-5 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <Reveal>
            <Bezel>
              <div className="p-7 sm:p-9">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <Eyebrow tone="clay">Hasil impor massal terakhir</Eyebrow>
                    <h2 className="mt-5 text-[2rem]">Yang tertahan sebelum masuk basis data</h2>
                  </div>
                  <p className="max-w-sm text-[12px] leading-relaxed text-[var(--color-ink-3)]">
                    Perhatikan bedanya <span className="text-[var(--color-ink-2)]">ditolak</span> dan{" "}
                    <span className="text-[var(--color-ink-2)]">ditandai</span>: kemiripan nama bukan alasan cukup
                    untuk menghalangi warga yang berhak, jadi baris itu tetap tersimpan untuk direview
                    manusia.
                  </p>
                </div>

                <div className="mt-8 overflow-x-auto">
                  <table className="w-full min-w-[44rem] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[var(--color-line)]">
                        {["Baris", "Desa", "Kode", "Keterangan", "Tindakan"].map((h) => (
                          <th
                            key={h}
                            className="px-2 pb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--color-ink-4)]"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {KASUS_DUPLIKAT.map((k) => (
                        <tr key={k.ref} className="border-b border-[var(--color-line)] last:border-0">
                          <td className="px-2 py-3.5 font-mono text-[12px]">{k.ref}</td>
                          <td className="px-2 py-3.5 text-[13px] text-[var(--color-ink-2)]">{k.desa}</td>
                          <td className="px-2 py-3.5">
                            <span className="font-mono text-[11px] text-[var(--color-ink-3)]">{k.jenis}</span>
                          </td>
                          <td className="px-2 py-3.5 text-[12px] text-[var(--color-ink-2)]">{k.keterangan}</td>
                          <td className="px-2 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px]
                                uppercase tracking-[0.1em] ${
                                  k.tindakan === "ditolak"
                                    ? "bg-[var(--color-clay-soft)] text-[var(--color-clay)]"
                                    : "bg-[#fbf3db] text-[#956400]"
                                }`}
                            >
                              {k.tindakan === "ditolak" ? <Alert className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                              {k.tindakan}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Bezel>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
