import { PageHeader } from "@/components/ui/PageHeader";
import { AuditEntries } from "@/components/admin/AdminShared";

export default function HalamanAuditLog() {
  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Admin"
          title="Audit Log"
          description="Seluruh perubahan status, alasan keputusan, dan aksi sistem, dicatat berurutan."
        />
      </div>

      <section className="px-4 pt-8 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <AuditEntries />
        </div>
      </section>
    </main>
  );
}
