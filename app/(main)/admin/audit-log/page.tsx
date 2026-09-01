import { cookies } from "next/headers";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { AuditEntries } from "@/components/admin/AdminShared";
import { ApiClient } from "@/lib/api";
import { angka } from "@/lib/format";

const PER_HALAMAN = 20;

export default async function HalamanAuditLog({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const token = (await cookies()).get("sigap_token")?.value;
  const page = Math.max(1, Number((await searchParams).page) || 1);

  // Sumbernya `GET /audit-log` (audit.controller.ts, admin/auditor saja) —
  // bukan lagi daftar contoh yang ditulis tangan di komponen.
  const { data, meta } = await ApiClient.audit.getAll(page, PER_HALAMAN, token);

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Admin"
          title="Audit Log"
          description={`${angka(meta.total)} aktivitas tercatat — perubahan status, keputusan verifikasi, dan aksi sistem, terbaru lebih dulu.`}
        />
      </div>

      <section className="px-4 pt-8 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <AuditEntries entries={data} />

          {meta.totalPages > 1 ? (
            <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Navigasi halaman">
              <PagerLink page={page - 1} disabled={page <= 1}>
                ← Lebih baru
              </PagerLink>
              <span className="font-mono text-[12px] text-[var(--color-ink-3)]">
                Halaman {page} dari {meta.totalPages}
              </span>
              <PagerLink page={page + 1} disabled={page >= meta.totalPages}>
                Lebih lama →
              </PagerLink>
            </nav>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function PagerLink({
  page,
  disabled,
  children,
}: {
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const kelas =
    "rounded-md border border-[var(--color-line)] px-3 py-2 text-[13px] transition-colors";
  if (disabled) {
    return <span className={`${kelas} text-[var(--color-ink-4)] opacity-50`}>{children}</span>;
  }
  return (
    <Link href={`/admin/audit-log?page=${page}`} className={`${kelas} bg-white hover:bg-[var(--color-paper-2)]`}>
      {children}
    </Link>
  );
}
