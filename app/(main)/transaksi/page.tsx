import { Reveal } from "@/components/ui/Reveal";
import {
  ExplorerLink,
  MetaRow,
  PublicPageHero,
  PublicSubnav,
  StatusChip,
  TransactionsTable,
} from "@/components/public/PublicShared";
import { PROGRAM, ringkasanPublik as R } from "@/lib/mock/data";
import { angka, rupiahRingkas } from "@/lib/format";

export default function HalamanTransaksi() {
  return (
    <main className="overflow-x-hidden pb-24 pt-20 sm:pb-32">

      <PublicPageHero
        eyebrow={`Jejak Transaksi · ${PROGRAM.periode}`}
        title={
          <>
            Jejak transaksi
            <br />
            pencairan terbaru.
          </>
        }
        body={
          <>
            Semua transaksi yang tampil di sini sudah dianonimkan di level UI. Warga bisa memeriksa
            nominal dan waktu pencairan tanpa membuka identitas pribadi penerima lain.
          </>
        }
        aside={
          <>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
              Ringkasan transaksi
            </p>
            <dl className="mt-5 space-y-4 text-[13px]">
              <MetaRow label="Transaksi tampil" value={angka(R.transaksiTerbaru.length)} mono />
              <MetaRow label="Dana tersalur" value={rupiahRingkas(R.totalTersalur)} mono />
              <MetaRow label="Penerima sukses klaim" value={angka(R.jumlahTerklaim)} mono />
              <MetaRow label="Status tampilan" value={<StatusChip>publik</StatusChip> as unknown as string} />
            </dl>
          </>
        }
      />

      <section className="px-4 sm:px-8">
        <div className="mx-auto max-w-[78rem]">
          <Reveal>
            <section className="rule-card p-6 sm:p-8">
              <div className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-3)]">
                    Buku besar publik
                  </p>
                  <h2 className="mt-4 text-[2rem]">Daftar transaksi periode berjalan</h2>
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
        </div>
      </section>
    </main>
  );
}
