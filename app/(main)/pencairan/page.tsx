"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import {
  DistributionList,
  ExplorerLink,
  MetaRow,
  PublicPageHero,
  TransactionsTable,
} from "@/components/public/PublicShared";
import { ringkasanPublik as R } from "@/lib/mock/data";
import { angka, rupiahRingkas } from "@/lib/format";

const TABS = [
  { key: "onchain", label: "Pencairan On-chain" },
  { key: "wilayah", label: "Distribusi Wilayah" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function HalamanPencairan() {
  const [tab, setTab] = useState<TabKey>("onchain");

  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">
      <PublicPageHero
        eyebrow="Portal Publik · Pencairan"
        title={
          <>
            Dana yang tersalur,
            <br />
            per transaksi dan per wilayah.
          </>
        }
        body={
          <>
            Lihat pencairan dana on-chain terbaru, atau beralih ke tab wilayah untuk melihat sebaran
            penerima per desa. Dipisah jadi dua tab agar masing-masing tetap mudah dibaca.
          </>
        }
        aside={
          <>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
              Ringkasan pencairan
            </p>
            <dl className="mt-5 space-y-4 text-[13px]">
              <MetaRow label="Dana tersalur" value={rupiahRingkas(R.totalTersalur)} mono />
              <MetaRow label="Transaksi tampil" value={angka(R.transaksiTerbaru.length)} mono />
              <MetaRow label="Wilayah tercakup" value={angka(R.perWilayah.length)} mono />
            </dl>
          </>
        }
      />

      <section className="px-4 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <div className="mb-6 flex gap-2 border-b border-[var(--color-line)]">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`border-b-2 px-4 py-3 text-[13px] uppercase tracking-[0.14em] transition-colors ${
                  tab === t.key
                    ? "border-[var(--color-primary)] text-[var(--color-ink)]"
                    : "border-transparent text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "onchain" ? (
            <Reveal>
              <section className="rule-card p-6 sm:p-8">
                <div className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-3)]">
                      Buku besar publik
                    </p>
                    <h2 className="mt-4 text-[2rem]">Pencairan on-chain terbaru</h2>
                  </div>
                  <ExplorerLink />
                </div>

                <TransactionsTable />

                <p className="mt-5 text-[13px] leading-6 text-[var(--color-ink-3)]">
                  Tautan hash membuka block explorer. Identitas asli tetap off-chain dari perspektif
                  portal publik ini; yang ditampilkan hanya kode anonim dan wilayah.
                </p>
              </section>
            </Reveal>
          ) : (
            <Reveal>
              <section className="rule-card p-6 sm:p-8">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-3)]">
                  Sebaran penerima
                </p>
                <h2 className="mt-4 text-[2rem]">Distribusi per wilayah</h2>
                <div className="mt-8">
                  <DistributionList limit={R.perWilayah.length} />
                </div>
              </section>
            </Reveal>
          )}
        </div>
      </section>
    </main>
  );
}
