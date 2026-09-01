import { PageHeader } from "@/components/ui/PageHeader";
import { FormPeriode } from "@/components/admin/FormPeriode";

/** Buat periode program baru (item D). Rute statis `baru` menang atas
 *  `[periodeId]` di segmen yang sama, jadi tidak bentrok dengan dashboard periode. */
export default function HalamanPeriodeBaru() {
  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Admin"
          title="Periode Program Baru"
          description="Periode baru dibuat dengan status draft dan langsung jadi periode aktif — pendataan berikutnya akan masuk ke periode ini."
        />
      </div>

      <section className="px-4 pt-8 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <FormPeriode />
        </div>
      </section>
    </main>
  );
}
