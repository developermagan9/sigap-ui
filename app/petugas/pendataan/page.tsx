import { cookies } from "next/headers";
import { FormPendataan } from "@/components/form/FormPendataan";
import { PageHeader } from "@/components/ui/PageHeader";
import { PetugasQuickSteps } from "@/components/petugas/PetugasShared";
import { ApiClient } from "@/lib/api";

export default async function Halaman() {
  const token = (await cookies()).get("sigap_token")?.value;
  const wilayah = await ApiClient.wilayah.getAll(token);

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

      <FormPendataan wilayah={wilayah} />
    </main>
  );
}
