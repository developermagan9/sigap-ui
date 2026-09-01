import { cookies } from "next/headers";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Hash } from "@/components/ui/Hash";
import { OnChainSummary, SummaryRow } from "@/components/admin/AdminShared";
import { OnChainActions } from "@/components/admin/OnChainActions";
import { ApiClient } from "@/lib/api";
import { getPeriodeAktifId } from "@/lib/periode";

export default async function HalamanOnChain() {
  const token = (await cookies()).get("sigap_token")?.value;
  const periodeId = await getPeriodeAktifId(token);
  const [periode, status] = await Promise.all([
    ApiClient.periode.getById(periodeId, token),
    ApiClient.blockchain.getStatus(periodeId, token),
  ]);

  const langkah = [
    { label: "Daftar final disahkan", selesai: periode.status === "approved" || periode.status === "disbursed" },
    { label: "Merkle root dibangun", selesai: !!periode.merkleRoot },
    { label: "Transaksi on-chain disubmit", selesai: !!periode.txHash },
    { label: "Klaim penerima berjalan", selesai: false, aktif: !!periode.txHash },
  ];

  return (
    <main className="overflow-x-hidden pb-16 pt-8">
      <div className="mx-auto max-w-[78rem] px-4 sm:px-4">
        <PageHeader
          eyebrow="Portal Admin"
          title="Penyaluran On-chain"
          description="Root, kontrak, deposit dana, dan progres klaim penerima setelah daftar final disahkan."
          actions={<OnChainActions periodeId={periodeId} merkleRoot={periode.merkleRoot} txHash={periode.txHash} />}
        />
      </div>

      <section className="px-4 pt-8 pb-16 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <OnChainSummary
            totalRecipients={status.total_recipients}
            totalClaimed={status.total_claimed}
            totalPending={status.total_pending}
            nominalDasar={periode.nominalDasar}
          />
        </div>
      </section>

      <section className="px-4 sm:px-8">
        <div className="mx-auto grid max-w-[78rem] gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Reveal>
            <section className="rule-card p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Progress chain</p>
              <div className="mt-6 space-y-4">
                {langkah.map((item, index) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-[var(--color-ink-4)]">{String(index + 1).padStart(2, "0")}</span>
                      <span className="text-[13px] text-[var(--color-ink-2)]">{item.label}</span>
                    </div>
                    {item.selesai ? (
                      <span className="rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-primary)]">
                        Selesai
                      </span>
                    ) : item.aktif ? (
                      <span className="rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-primary)]">
                        Aktif
                      </span>
                    ) : (
                      <span className="rounded-full bg-[var(--color-paper-2)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink-4)]">
                        Menunggu
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={80}>
            <section className="rule-card p-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Jejak kontrak</p>
              <dl className="mt-4 space-y-4 text-[13px]">
                <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] pb-4">
                  <dt className="text-[var(--color-ink-3)]">Merkle root</dt>
                  <dd>{periode.merkleRoot ? <Hash value={periode.merkleRoot} kepala={8} ekor={6} /> : <span className="text-[var(--color-ink-4)]">Belum dibangun</span>}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] pb-4">
                  <dt className="text-[var(--color-ink-3)]">Kontrak</dt>
                  <dd>{periode.contractAddress ? <Hash value={periode.contractAddress} kepala={8} ekor={6} /> : <span className="text-[var(--color-ink-4)]">—</span>}</dd>
                </div>
                <SummaryRow label="Tx hash" value={periode.txHash ? `${periode.txHash.slice(0, 10)}...${periode.txHash.slice(-6)}` : "—"} mono />
              </dl>
            </section>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
