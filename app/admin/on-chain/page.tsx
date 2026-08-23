import { Reveal } from "@/components/ui/Reveal";
import { AdminAsideSummary, AdminHero, AdminSubnav, OnChainSummary, SummaryRow } from "@/components/admin/AdminShared";
import { PROGRAM, dataset } from "@/lib/mock/data";

export default function HalamanOnChain() {
  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
      <AdminSubnav />

      <AdminHero
        eyebrow="Portal Admin · Status On-Chain"
        title={
          <>
            Setelah approval,
            <br />
            jejak teknis dimulai.
          </>
        }
        body={
          <>
            Halaman ini memisahkan status sosial dari status teknis. Yang dipantau di sini adalah
            root, kontrak, deposit dana, dan progres klaim penerima yang berjalan setelah daftar
            final disahkan.
          </>
        }
        aside={<AdminAsideSummary />}
      />

      <section className="px-4 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-[78rem]">
          <OnChainSummary />
        </div>
      </section>

      <section className="px-4 sm:px-8">
        <div className="mx-auto grid max-w-[78rem] gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Reveal>
            <section className="rule-card p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Progress chain</p>
              <div className="mt-6 space-y-4">
                {[
                  ["Merkle root dibangun", "Selesai"],
                  ["registerPeriode() disubmit", "Selesai"],
                  ["Dana di-deposit", "Selesai"],
                  ["Klaim penerima berjalan", "Aktif"],
                ].map(([label, state], index) => (
                  <div key={label} className="flex items-center justify-between gap-4 border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-[var(--color-ink-4)]">{String(index + 1).padStart(2, "0")}</span>
                      <span className="text-[13px] text-[var(--color-ink-2)]">{label}</span>
                    </div>
                    <span className="rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      {state}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={80}>
            <section className="rule-card p-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Jejak kontrak</p>
              <dl className="mt-4 space-y-4 text-[13px]">
                <SummaryRow label="Registry" value={`${PROGRAM.registry.slice(0, 8)}...${PROGRAM.registry.slice(-6)}`} mono />
                <SummaryRow label="Disbursement" value={`${PROGRAM.disbursement.slice(0, 8)}...${PROGRAM.disbursement.slice(-6)}`} mono />
                <SummaryRow label="Tx register" value={`${dataset.txRegister.slice(0, 8)}...${dataset.txRegister.slice(-6)}`} mono />
              </dl>
            </section>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
