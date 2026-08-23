import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { AdminAsideSummary, AdminHero, AdminSubnav, ApprovalChecklist } from "@/components/admin/AdminShared";
import { dataset } from "@/lib/mock/data";
import { angka, rupiahRingkas } from "@/lib/format";

export default function HalamanApproval() {
  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
      <AdminSubnav />

      <AdminHero
        eyebrow="Portal Admin · Review & Approval"
        title={
          <>
            Mesin menghitung,
            <br />
            pejabat menanggung keputusan.
          </>
        }
        body={
          <>
            Sebelum daftar final disahkan, admin harus memeriksa invarian alokasi, cutoff, dan
            alasan approval. Setelah itu, Merkle root dapat dikirim ke kontrak dan daftar tidak lagi
            bisa diubah diam-diam.
          </>
        }
        aside={<AdminAsideSummary />}
      />

      <section className="px-4 pb-20 sm:px-8 sm:pb-28">
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
              <dl className="mt-4 space-y-4 text-[13px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--color-ink-3)]">Kuota penerima</dt>
                  <dd className="font-mono">{angka(dataset.alokasi.kuotaPenerima)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--color-ink-3)]">Total alokasi</dt>
                  <dd className="font-mono">{rupiahRingkas(dataset.alokasi.totalAlokasi)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--color-ink-3)]">Merkle root</dt>
                  <dd className="font-mono">{dataset.merkleRoot.slice(0, 10)}...{dataset.merkleRoot.slice(-6)}</dd>
                </div>
              </dl>
              <div className="mt-6">
                <Button href="/admin/on-chain">Sahkan daftar final</Button>
              </div>
            </section>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
