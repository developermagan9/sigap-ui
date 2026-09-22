import { cookies } from "next/headers";
import { FormPendataan } from "@/components/form/FormPendataan";
import { PageHeader } from "@/components/ui/PageHeader";
import { PetugasQuickSteps } from "@/components/petugas/PetugasShared";
import { ImportCsv } from "@/components/petugas/ImportCsv";
import { getPeriodePendataan } from "@/lib/periode";

export default async function Halaman() {
  const token = (await cookies()).get("sigap_token")?.value;
  const periode = await getPeriodePendataan(token);

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Petugas"
          title="Form Input KK"
          description="Alamat dipilih dari referensi wilayah resmi; data ganda ditolak lewat NIK kepala keluarga, No. KK, dan NIK tiap anggota."
        />
        {periode && (
          <p className="mt-4 text-[13px] text-[var(--color-ink-3)]">
            Data masuk ke periode <span className="text-[var(--color-ink)]">{periode.namaProgram}</span>. Hanya desa
            di wilayah kerja Anda yang bisa didata.
          </p>
        )}
      </div>

      {!periode ? (
        <section className="px-4 pt-8 sm:px-8">
          <div className="rule-card mx-auto max-w-[78rem] p-6 sm:p-8">
            <h2 className="text-[1.6rem]">Belum ada periode yang sedang pendataan</h2>
            <p className="mt-3 max-w-2xl text-[13px] leading-6 text-[var(--color-ink-3)]">
              Semua periode program sudah lewat tahap pendataan (status selain &ldquo;draft&rdquo;). Minta admin membuat
              periode baru di menu Periode, lalu buka halaman ini lagi.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="px-4 pt-8 pb-16 sm:px-8">
            <div className="mx-auto max-w-[78rem]">
              <PetugasQuickSteps />
            </div>
          </section>

          <section className="px-4 pb-16 sm:px-8">
            <div className="mx-auto max-w-[78rem]">
              <ImportCsv periodeId={periode.id} />
            </div>
          </section>

          <FormPendataan periodeId={periode.id} />
        </>
      )}
    </main>
  );
}
