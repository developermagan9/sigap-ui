import { cookies } from "next/headers";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { SanggahanPanel, type SanggahanRow } from "@/components/admin/SanggahanPanel";
import { ApiClient } from "@/lib/api";

export default async function HalamanSanggahan() {
  const token = (await cookies()).get("sigap_token")?.value;
  const items = (await ApiClient.sanggahan.getAll(undefined, token)) as SanggahanRow[];

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Admin"
          title="Sanggahan Data"
          description="Jalur koreksi data yang diajukan petugas atas nama warga — menyetujui hanya mengubah data mentah, skor dihitung ulang otomatis di run berikutnya, bukan di-override manual."
        />
      </div>

      <section className="px-4 pt-8 pb-16 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <Reveal>
            <div className="rule-card p-6 sm:p-8">
              <SanggahanPanel items={items} />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
