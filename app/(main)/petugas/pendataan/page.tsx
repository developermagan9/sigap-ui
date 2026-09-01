import { cookies } from "next/headers";
import { FormPendataan } from "@/components/form/FormPendataan";
import { PageHeader } from "@/components/ui/PageHeader";
import { PetugasQuickSteps } from "@/components/petugas/PetugasShared";
import { ImportCsv } from "@/components/petugas/ImportCsv";
import { ApiClient } from "@/lib/api";
import { getPeriodeAktifId } from "@/lib/periode";

export default async function Halaman() {
  const token = (await cookies()).get("sigap_token")?.value;
  const [wilayah, periodeId] = await Promise.all([
    ApiClient.wilayah.getAll(token),
    getPeriodeAktifId(token),
  ]);

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Petugas"
          title="Form Input KK"
          description="Menolak data ganda lewat NIK kepala keluarga, No. KK, dan NIK tiap anggota."
        />
      </div>

      <section className="px-4 pt-8 pb-16 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <PetugasQuickSteps />
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <ImportCsv periodeId={periodeId} />
        </div>
      </section>

      <FormPendataan wilayah={wilayah} periodeId={periodeId} />
    </main>
  );
}
