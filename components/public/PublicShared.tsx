import { Reveal } from "@/components/ui/Reveal";
import { Check, Cube, Doc, Layers, Link as LinkIcon, Scale } from "@/components/ui/Icons";
import type { PublicProgramDetail, PublicTransaksi } from "@/lib/api";
import { EXPLORER_BASE } from "@/lib/constants";
import { angka, pendek, persen, rupiah, rupiahRingkas, waktu } from "@/lib/format";

/** Urutan tahap periode, sejajar dengan enum `ProgramStatus` di skema Prisma.
 *  Dipakai TrailIndicator untuk menentukan tahap mana yang sudah dilewati. */
const TAHAP: { status: string; label: string }[] = [
  { status: "draft", label: "Input Data" },
  { status: "clustering", label: "Clustering" },
  { status: "ranking", label: "Perankingan" },
  { status: "alokasi", label: "Alokasi" },
  { status: "approved", label: "Disahkan" },
  { status: "disbursed", label: "Tersalur" },
];

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

/**
 * Tabel transaksi publik. Barisnya datang dari `GET /public/transactions`
 * (disbursement_record yang sudah dianonimkan jadi REC-XXXX), bukan data mock.
 *
 * Status ditampilkan apa adanya: penerima yang dananya belum ditarik tampil
 * sebagai "menunggu klaim", bukan disembunyikan — menyembunyikannya akan
 * membuat portal terlihat seolah semua dana sudah cair.
 */
export function TransactionsTable({ rows }: { rows: PublicTransaksi[] }) {
  if (rows.length === 0) {
    return (
      <p className="mt-6 text-[13px] text-[var(--color-ink-3)]">
        Belum ada transaksi pencairan yang tercatat untuk periode ini.
      </p>
    );
  }

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
            <tr key={tx.reference} className="border-b border-[var(--color-line)] last:border-b-0">
              <td className="py-4 pr-4 font-mono text-[12px] text-[var(--color-ink)]">{tx.reference}</td>
              <td className="py-4 pr-4 text-[13px] text-[var(--color-ink-2)]">{tx.desa}</td>
              <td className="py-4 pr-4 font-mono text-[13px] tnum">{rupiah(tx.amount)}</td>
              <td className="py-4 pr-4">
                <StatusChip tone={tx.status === "claimed" ? "ok" : "netral"}>
                  {tx.status === "claimed" ? "tersalur" : tx.status === "failed" ? "gagal" : "menunggu klaim"}
                </StatusChip>
              </td>
              <td className="py-4 pr-4">
                {tx.tx_hash ? (
                  <a
                    href={`${EXPLORER_BASE}/tx/${tx.tx_hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[12px] text-[var(--color-chain)]"
                  >
                    {pendek(tx.tx_hash, 6, 4)}
                  </a>
                ) : (
                  <span className="font-mono text-[12px] text-[var(--color-ink-4)]" title="Belum ada transaksi klaim on-chain">
                    —
                  </span>
                )}
              </td>
              <td className="py-4 text-[12px] text-[var(--color-ink-3)]">{waktu(tx.claimed_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type BarisWilayah = { desa: string; jumlah_penerima: number; total_dana: number; total_cair: number };

export function DistributionList({ perWilayah, limit }: { perWilayah: BarisWilayah[]; limit?: number }) {
  if (perWilayah.length === 0) {
    return <p className="text-[13px] text-[var(--color-ink-3)]">Belum ada penerima yang terdaftar.</p>;
  }
  const top = perWilayah[0]?.jumlah_penerima || 1;
  const rows = typeof limit === "number" ? perWilayah.slice(0, limit) : perWilayah;

  return (
    <div className="space-y-5">
      {rows.map((wilayah) => (
        <div key={wilayah.desa}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[15px] text-[var(--color-ink)]">{wilayah.desa}</p>
              <p className="mt-1 text-[12px] text-[var(--color-ink-3)]">
                {persen(wilayah.jumlah_penerima ? wilayah.total_cair / wilayah.total_dana : 0)} dana telah dicairkan
              </p>
            </div>
            <p className="font-mono text-[13px] text-[var(--color-ink-2)]">{angka(wilayah.jumlah_penerima)} KK</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-[4px] bg-[var(--color-paper-2)]">
            <div
              className="h-full bg-[var(--color-primary)]"
              style={{ width: `${Math.min(wilayah.jumlah_penerima / top, 1) * 100}%` }}
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

/** Tahap periode. Yang aktif = status periode saat ini; tahap sebelumnya dianggap selesai. */
export function TrailIndicator({ status }: { status: string }) {
  // `reviewed` tidak punya kartu sendiri (tahap antara alokasi dan approved) —
  // diperlakukan sama dengan `alokasi` supaya jumlah kartunya tetap enam.
  const normalisasi = status === "reviewed" ? "alokasi" : status;
  const indexAktif = TAHAP.findIndex((t) => t.status === normalisasi);

  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      {TAHAP.map((item, index) => {
        const selesai = indexAktif >= 0 && index < indexAktif;
        const aktif = index === indexAktif;
        return (
          <div key={item.status} className="relative border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink-4)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  aktif
                    ? "bg-[var(--color-primary)]"
                    : selesai
                      ? "bg-[var(--color-ink-3)]"
                      : "bg-[var(--color-line)]"
                }`}
              />
            </div>
            <p className="mt-6 font-display text-[1.15rem]">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}

export function MetaRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] pb-4 last:border-b-0 last:pb-0">
      <dt className="text-[var(--color-ink-3)]">{label}</dt>
      <dd className={mono ? "font-mono text-right text-[var(--color-ink)]" : "text-right text-[var(--color-ink)]"}>
        {value}
      </dd>
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

export function StatusChip({
  children,
  tone = "ok",
}: {
  children: React.ReactNode;
  tone?: "ok" | "netral";
}) {
  const kelas =
    tone === "ok"
      ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
      : "bg-[var(--color-paper-2)] text-[var(--color-ink-3)]";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${kelas}`}>
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

export function PeriodSummaryAside({ detail }: { detail: PublicProgramDetail }) {
  return (
    <>
      <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Jejak teknis</p>
      <dl className="mt-5 space-y-4 text-[13px]">
        <MetaRow label="Merkle root" value={detail.merkle_root ? pendek(detail.merkle_root, 12, 8) : "belum dikunci"} mono />
        <MetaRow
          label="Kontrak pencairan"
          value={detail.contract_address ? pendek(detail.contract_address, 10, 8) : "belum dideploy"}
          mono
        />
        <MetaRow label="Explorer" value={EXPLORER_BASE.replace(/^https?:\/\//, "")} />
        <MetaRow label="Model alokasi" value="K-Means + TOPSIS + Merkle" />
      </dl>
    </>
  );
}

export function ExplorerLink({ address }: { address?: string | null }) {
  // Tanpa alamat kontrak (belum dideploy ke testnet), tautan ke explorer akan
  // membuka halaman kosong — lebih jujur menyatakannya daripada memberi tautan mati.
  if (!address) {
    return (
      <span className="inline-flex items-center gap-2 text-[13px] text-[var(--color-ink-4)]">
        <LinkIcon className="h-4 w-4" />
        Kontrak belum terdaftar di explorer
      </span>
    );
  }
  return (
    <a
      href={`${EXPLORER_BASE}/address/${address}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 text-[13px] text-[var(--color-chain)]"
    >
      <LinkIcon className="h-4 w-4" />
      Buka block explorer
    </a>
  );
}

/** Daftar kriteria + bobot yang benar-benar dipakai periode ini (FE-3).
 *  Hanya definisi kriteria dan bobotnya — tidak ada skor individu, sesuai
 *  batasan kanal publik di 07-Security-Privacy-Ethics.md §4. */
export function BobotKriteriaPublik({
  bobot,
  label,
}: {
  bobot: Record<string, number>;
  label: Record<string, string>;
}) {
  const entri = Object.entries(bobot).sort((a, b) => b[1] - a[1]);
  if (entri.length === 0) {
    return <p className="text-[13px] text-[var(--color-ink-3)]">Bobot kriteria belum dikonfigurasi.</p>;
  }

  return (
    <ul className="space-y-4">
      {entri.map(([key, nilai]) => (
        <li key={key}>
          <div className="flex items-end justify-between gap-4">
            <p className="text-[14px] text-[var(--color-ink)]">{label[key] ?? key}</p>
            <p className="font-mono text-[13px] tnum text-[var(--color-ink-2)]">{persen(nilai, 1)}</p>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--color-paper-2)]">
            <div className="h-full bg-[var(--color-primary)]" style={{ width: `${nilai * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MethodologyEvidence({ detail }: { detail: PublicProgramDetail }) {
  const butir = [
    `Bobot kriteria di halaman ini dibaca langsung dari konfigurasi periode "${detail.nama_program}", bukan angka contoh.`,
    `${angka(detail.total_verifikasi)} rumah tangga terverifikasi dikelompokkan ke ${detail.k_cluster} tingkat kerentanan; ${angka(detail.total_masuk_ranking)} di antaranya masuk tahap perankingan.`,
    detail.merkle_root
      ? "Daftar final sudah diringkas menjadi Merkle root, sehingga perubahan setelah pengesahan akan terlihat publik."
      : "Daftar final belum dikunci menjadi Merkle root untuk periode ini.",
    "Halaman publik ini tidak pernah menampilkan skor atau identitas individu — hanya definisi kriteria dan angka agregat.",
  ];

  return (
    <ul className="mt-4 space-y-3 text-[13px] text-[var(--color-ink-2)]">
      {butir.map((teks) => (
        <li key={teks} className="flex items-start gap-3">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
          {teks}
        </li>
      ))}
    </ul>
  );
}

export function ProgramStatsGrid({ detail }: { detail: PublicProgramDetail }) {
  const selisih = detail.cutoff.selisih;

  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <Reveal delay={40}>
        <InfoCard
          label="Pagu anggaran"
          value={rupiahRingkas(detail.anggaran_total)}
          body="Dana tersedia untuk periode berjalan sebelum kuota final ditetapkan."
        />
      </Reveal>
      <Reveal delay={80}>
        <InfoCard
          label="Jumlah penerima"
          value={angka(detail.kuota_penerima ?? detail.jumlah_penerima)}
          body={`Dipilih dari ${angka(detail.total_masuk_ranking)} keluarga rentan yang masuk tahap ranking.`}
        />
      </Reveal>
      <Reveal delay={120}>
        <InfoCard
          label="Batas tipis terakhir"
          value={selisih === null ? "—" : selisih.toFixed(6)}
          body="Selisih skor antara penerima terakhir dan kandidat pertama yang belum masuk kuota."
          mono
        />
      </Reveal>
      <Reveal delay={160}>
        <InfoCard
          label="Biaya operasional"
          value={rupiah(detail.biaya_operasional)}
          body={
            detail.biaya_operasional === 0
              ? "Tidak ada potongan admin — dana dikirim penuh ke alamat tujuan yang terdaftar."
              : "Dipotong dari pagu sebelum kuota penerima dihitung."
          }
        />
      </Reveal>
    </div>
  );
}
