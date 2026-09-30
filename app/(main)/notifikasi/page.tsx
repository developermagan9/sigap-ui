import { cookies } from "next/headers";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { DaftarNotifikasi } from "@/components/akun/DaftarNotifikasi";
import { ApiClient } from "@/lib/api";
import { angka, waktu } from "@/lib/format";

/**
 * Notifikasi in-app pengguna, plus (untuk admin) outbox SMS mock ke warga.
 * 01-PRD.md menetapkan SMS/WA produksi di luar cakupan — outbox ini menunjukkan
 * pesan yang AKAN dikirim, tanpa benar-benar mengirimnya.
 */
export default async function HalamanNotifikasi({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const jar = await cookies();
  const token = jar.get("sigap_token")?.value;
  const admin = jar.get("sigap_role")?.value === "admin";
  const tab = admin && (await searchParams).tab === "sms" ? "sms" : "saya";

  const [milikSaya, outbox] = await Promise.all([
    ApiClient.notifikasi.milikSaya({ limit: 50 }, token),
    tab === "sms" ? ApiClient.notifikasi.outboxSms(1, 50, token) : Promise.resolve(null),
  ]);

  const kelasTab = (aktif: boolean) =>
    `rounded-md border px-3 py-2 text-[13px] ${aktif ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white" : "border-[var(--color-line)] bg-white"}`;

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Akun"
          title="Notifikasi"
          description="Pemberitahuan keputusan verifikasi, sanggahan, dan pengesahan yang menyangkut Anda."
        />
      </div>

      <section className="px-4 pt-8 sm:px-8">
        <div className="mx-auto flex max-w-[78rem] flex-col gap-6">
          {admin && (
            <nav className="flex gap-2" aria-label="Jenis notifikasi">
              <Link href="/notifikasi" className={kelasTab(tab === "saya")}>
                Untuk saya
              </Link>
              <Link href="/notifikasi?tab=sms" className={kelasTab(tab === "sms")}>
                Outbox SMS warga (mock)
              </Link>
            </nav>
          )}

          {tab === "saya" ? (
            <DaftarNotifikasi data={milikSaya.data} belumDibaca={milikSaya.belum_dibaca} />
          ) : (
            <section className="rule-card p-6">
              <p className="text-[12px] leading-6 text-[var(--color-ink-3)]">
                {angka(outbox?.total ?? 0)} pesan tercatat. Tidak ada yang benar-benar dikirim — kanal SMS/WA produksi
                di luar cakupan purwarupa ini.
              </p>
              <ul className="mt-4 divide-y divide-[var(--color-line)]">
                {(outbox?.data ?? []).map((n) => (
                  <li key={n.id} className="py-3 text-[13px]">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <span className="font-mono text-[12px] text-[var(--color-ink-2)]">{n.tujuan}</span>
                      <span className="text-[11px] text-[var(--color-ink-4)]">{waktu(n.createdAt)}</span>
                    </div>
                    <p className="mt-1 font-medium text-[var(--color-ink)]">{n.judul}</p>
                    <p className="text-[var(--color-ink-2)]">{n.pesan}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
