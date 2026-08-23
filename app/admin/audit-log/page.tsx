import { AdminAsideSummary, AdminHero, AdminSubnav, AuditEntries } from "@/components/admin/AdminShared";

export default function HalamanAuditLog() {
  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
      <AdminSubnav />

      <AdminHero
        eyebrow="Portal Admin · Audit Log"
        title={
          <>
            Setiap perubahan status
            <br />
            harus punya jejak.
          </>
        }
        body={
          <>
            Audit log adalah tempat seluruh perubahan status, alasan keputusan, dan aksi sistem
            dicatat berurutan. Di implementasi riil, layar ini menjadi dasar pengawasan internal dan
            klarifikasi lintas aktor.
          </>
        }
        aside={<AdminAsideSummary />}
      />

      <section className="px-4 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <AuditEntries />
        </div>
      </section>
    </main>
  );
}
