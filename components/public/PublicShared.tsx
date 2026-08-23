import { Reveal } from "@/components/ui/Reveal";
import { Check, Cube, Doc, Layers, Link as LinkIcon, Scale } from "@/components/ui/Icons";
import { PROGRAM, dataset, ringkasanPublik as R } from "@/lib/mock/data";
import { angka, pendek, persen, rupiah, rupiahRingkas, waktu } from "@/lib/format";

export const JEJAK = [
  { label: "Input Data", state: "done" },
  { label: "Verifikasi", state: "done" },
  { label: "Perankingan", state: "done" },
  { label: "Disahkan", state: "done" },
  { label: "Tersalur", state: "active" },
] as const;

export const METODOLOGI = [
  {
    icon: Doc,
    title: "Kriteria dipublikasikan",
    body: "Pendapatan per kapita, jumlah tanggungan, disabilitas atau lansia, dan kondisi rumah dipakai sebagai dasar penentuan prioritas.",
  },
  {
    icon: Layers,
    title: "Kondisi serupa dikelompokkan",
    body: "K-Means membagi rumah tangga ke tingkat kerentanan agar perbandingan dilakukan secara lebih adil, bukan mencampur semua kondisi dalam satu antrean.",
  },
  {
    icon: Scale,
    title: "Skor dihitung terbuka",
    body: "TOPSIS memberi skor akhir 0 sampai 1. Bobot tiap kriteria bisa diperiksa ulang dan hasilnya dapat dijalankan ulang oleh admin.",
  },
  {
    icon: Cube,
    title: "Daftar final dikunci on-chain",
    body: "Setelah disahkan, daftar penerima diringkas menjadi Merkle root. Perubahan setelah itu akan terlihat publik karena jejak teknisnya tercatat.",
  },
] as const;

export function PublicSubnav() {
  const items = [
    { href: "/", label: "Beranda" },
    { href: `/program/${PROGRAM.id}`, label: "Detail Program" },
    { href: "/transaksi", label: "Jejak Transaksi" },
    { href: "/metodologi", label: "Metodologi" },
    { href: "/cek-status", label: "Cek Status" },
  ];

  return (
    <div className="mx-auto flex max-w-[78rem] flex-wrap gap-2 px-4 pt-8 sm:px-8">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="border border-[var(--color-line)] bg-white px-3 py-2 text-[12px] uppercase tracking-[0.14em] text-[var(--color-ink-3)] transition-colors hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)]"
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}

export function PublicPageHero({
  eyebrow,
  title,
  body,
  aside,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="relative px-4 pb-10 pt-10 sm:px-8 sm:pt-14">
      <div className="paper-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[24rem]" />
      <div className="mx-auto max-w-[78rem]">
        <Reveal>
          <div className="grid gap-6 border-b border-[var(--color-line)] pb-10 lg:grid-cols-[minmax(0,1.3fr)_22rem] lg:items-end">
            <div className="max-w-4xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-3)]">{eyebrow}</p>
              <h1 className="mt-5 text-[3rem] sm:text-[4.25rem]">{title}</h1>
              <div className="mt-6 max-w-2xl text-[15px] leading-7 text-[var(--color-ink-2)] sm:text-base">
                {body}
              </div>
            </div>
            {aside ? <div className="rule-card p-6">{aside}</div> : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function TransactionsTable({ limit }: { limit?: number }) {
  const rows = typeof limit === "number" ? R.transaksiTerbaru.slice(0, limit) : R.transaksiTerbaru;

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse">
        <thead>
          <tr className="border-b border-[var(--color-line)] text-left">
            {["ID anonim", "Wilayah", "Nominal", "Status", "Hash", "Waktu"].map((label) => (
              <th
                key={label}
                className="py-3 pr-4 text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink-4)]"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((tx) => (
            <tr key={`${tx.ref}-${tx.txHash}`} className="border-b border-[var(--color-line)] last:border-b-0">
              <td className="py-4 pr-4 font-mono text-[12px] text-[var(--color-ink)]">{tx.ref}</td>
              <td className="py-4 pr-4 text-[13px] text-[var(--color-ink-2)]">{tx.desa}</td>
              <td className="py-4 pr-4 font-mono text-[13px] tnum">{rupiah(tx.amount)}</td>
              <td className="py-4 pr-4">
                <StatusChip>tersalur</StatusChip>
              </td>
              <td className="py-4 pr-4">
                <a
                  href={`${PROGRAM.explorer}/tx/${tx.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[12px] text-[var(--color-chain)]"
                >
                  {pendek(tx.txHash ?? "", 6, 4)}
                </a>
              </td>
              <td className="py-4 text-[12px] text-[var(--color-ink-3)]">{waktu(tx.waktu)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DistributionList({ limit = 5 }: { limit?: number }) {
  const top = R.perWilayah[0]?.jumlahPenerima ?? 1;

  return (
    <div className="space-y-5">
      {R.perWilayah.slice(0, limit).map((wilayah) => (
        <div key={wilayah.desa}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[15px] text-[var(--color-ink)]">{wilayah.desa}</p>
              <p className="mt-1 text-[12px] text-[var(--color-ink-3)]">
                {persen(wilayah.klaim)} penerima telah klaim
              </p>
            </div>
            <p className="font-mono text-[13px] text-[var(--color-ink-2)]">{angka(wilayah.jumlahPenerima)} KK</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-[4px] bg-[var(--color-paper-2)]">
            <div
              className="h-full bg-[var(--color-primary)]"
              style={{ width: `${Math.min(wilayah.jumlahPenerima / top, 1) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MethodologyGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {METODOLOGI.map((item, index) => {
        const Icon = item.icon;
        return (
          <Reveal key={item.title} delay={index * 80}>
            <article className="rule-card h-full p-6">
              <div className="flex h-10 w-10 items-center justify-center border border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-[1.45rem]">{item.title}</h3>
              <p className="mt-4 text-[13px] leading-6 text-[var(--color-ink-3)]">{item.body}</p>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

export function TrailIndicator() {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {JEJAK.map((item, index) => (
        <div key={item.label} className="relative border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink-4)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                item.state === "active" ? "bg-[var(--color-primary)]" : "bg-[var(--color-line)]"
              }`}
            />
          </div>
          <p className="mt-6 font-display text-[1.15rem]">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export function MetaRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] pb-4 last:border-b-0 last:pb-0">
      <dt className="text-[var(--color-ink-3)]">{label}</dt>
      <dd className={mono ? "font-mono text-right text-[var(--color-ink)]" : "text-right text-[var(--color-ink)]"}>
        {value}
      </dd>
    </div>
  );
}

export function MetricMini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink-4)]">{label}</p>
      <p className="mt-1 font-mono text-[15px] text-[var(--color-ink)]">{value}</p>
    </div>
  );
}

export function InfoCard({
  label,
  value,
  body,
  mono = false,
}: {
  label: string;
  value: string;
  body: string;
  mono?: boolean;
}) {
  return (
    <article className="rule-card h-full p-6">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">{label}</p>
      <p className={`mt-4 text-[2rem] leading-none ${mono ? "font-mono tnum" : "font-display"}`}>{value}</p>
      <p className="mt-4 text-[13px] leading-6 text-[var(--color-ink-3)]">{body}</p>
    </article>
  );
}

export function StatusChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-primary)]">
      {children}
    </span>
  );
}

export function TraceStep({ label, meta, active = false }: { label: string; meta: string; active?: boolean }) {
  return (
    <div className="relative pl-5">
      <span
        className={`absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full ${
          active ? "bg-[var(--color-primary)]" : "bg-[var(--color-line)]"
        }`}
      />
      <p className="text-[14px] text-[var(--color-ink)]">{label}</p>
      <p className="mt-1 font-mono text-[12px] text-[var(--color-ink-3)]">{meta}</p>
    </div>
  );
}

export function PeriodSummaryAside() {
  return (
    <>
      <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Jejak teknis</p>
      <dl className="mt-5 space-y-4 text-[13px]">
        <MetaRow label="Merkle root" value={pendek(dataset.merkleRoot, 12, 8)} mono />
        <MetaRow label="Kontrak pencairan" value={pendek(PROGRAM.disbursement, 10, 8)} mono />
        <MetaRow label="Explorer" value="amoy.polygonscan.com" />
        <MetaRow label="Model alokasi" value="K-Means + TOPSIS + Merkle" />
      </dl>
    </>
  );
}

export function ExplorerLink() {
  return (
    <a
      href={`${PROGRAM.explorer}/address/${PROGRAM.disbursement}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 text-[13px] text-[var(--color-chain)]"
    >
      <LinkIcon className="h-4 w-4" />
      Buka block explorer
    </a>
  );
}

export function MethodologyEvidence() {
  return (
    <ul className="mt-4 space-y-3 text-[13px] text-[var(--color-ink-2)]">
      <li className="flex items-start gap-3">
        <Check className="mt-0.5 h-4 w-4 text-[var(--color-primary)]" />
        Data yang tampil di UI ini berasal dari dataset sintetis internal demo.
      </li>
      <li className="flex items-start gap-3">
        <Check className="mt-0.5 h-4 w-4 text-[var(--color-primary)]" />
        Semua nominal dan kuota dihitung dari pipeline mock, bukan angka tempelan.
      </li>
      <li className="flex items-start gap-3">
        <Check className="mt-0.5 h-4 w-4 text-[var(--color-primary)]" />
        Tanggal transaksi yang tampil di portal ini berada pada Agustus 2026 untuk kebutuhan demo.
      </li>
    </ul>
  );
}

export function ProgramStatsGrid() {
  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <Reveal delay={40}>
        <InfoCard
          label="Pagu anggaran"
          value={rupiahRingkas(R.totalAnggaran)}
          body="Dana tersedia untuk periode berjalan sebelum kuota final ditetapkan."
        />
      </Reveal>
      <Reveal delay={80}>
        <InfoCard
          label="Kuota penerima"
          value={angka(dataset.alokasi.kuotaPenerima)}
          body={`Dipilih dari ${angka(dataset.ranking.length)} keluarga rentan yang masuk tahap ranking.`}
        />
      </Reveal>
      <Reveal delay={120}>
        <InfoCard
          label="Batas tipis terakhir"
          value={dataset.alokasi.cutoff.selisih ? dataset.alokasi.cutoff.selisih.toFixed(6) : "0.000000"}
          body="Selisih skor antara penerima terakhir dan kandidat pertama yang belum masuk kuota."
          mono
        />
      </Reveal>
      <Reveal delay={160}>
        <InfoCard
          label="Integritas distribusi"
          value="Rp0"
          body="Tidak ada biaya potong admin dalam skema pencairan. Dana dikirim langsung ke alamat tujuan yang terdaftar."
        />
      </Reveal>
    </div>
  );
}
