import { cookies } from "next/headers";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApprovalChecklist } from "@/components/admin/AdminShared";
import { ApprovalPanel } from "@/components/admin/ApprovalPanel";
import { ApiClient } from "@/lib/api";
import { getPeriodeAktifId } from "@/lib/periode";

export default async function HalamanApproval() {
  const token = (await cookies()).get("sigap_token")?.value;
  const periodeId = await getPeriodeAktifId(token);
  const periode = await ApiClient.periode.getById(periodeId, token);
  const bisaSahkan = periode.status === "alokasi" || periode.status === "reviewed";

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Admin"
          title="Review & Approval"
          description="Periksa invarian alokasi dan cutoff sebelum daftar final dikunci ke Merkle root."
        />
      </div>

      <section className="px-4 pt-8 pb-16 sm:px-8">
        <div className="mx-auto grid max-w-[78rem] gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Reveal>
            <section className="rule-card p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Checklist sebelum sah</p>
              <h2 className="mt-4 text-[2rem]">Lima hal yang harus benar sebelum daftar dikunci</h2>
              <div className="mt-6">
                <ApprovalChecklist />
              </div>
            </section>
          </Reveal>

          <Reveal delay={80}>
            <section className="rule-card p-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Ringkasan final</p>
              <ApprovalPanel
                periodeId={periodeId}
                kuotaPenerima={periode.kuotaPenerima ?? 0}
                totalAlokasi={periode.totalAlokasi ?? 0}
                merkleRoot={periode.merkleRoot}
                bisaSahkan={bisaSahkan}
              />
            </section>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
