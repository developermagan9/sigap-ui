import { PageHeader } from "@/components/ui/PageHeader";
import { FormGantiPassword } from "@/components/akun/FormGantiPassword";

export default function HalamanAkun() {
  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader eyebrow="Akun" title="Ganti Password" description="Password baru berlaku untuk semua perangkat." />
      </div>
      <section className="px-4 pt-8 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <FormGantiPassword />
        </div>
      </section>
    </main>
  );
}
