import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Check, Cube, Layers, Ledger, Scale, ShieldCheck, Users } from "@/components/ui/Icons";
import { BOBOT_DEFAULT, dataset, KRITERIA, PROGRAM, ringkasanPublik } from "@/lib/mock/data";
import { angka, persen, rupiah, rupiahRingkas } from "@/lib/format";

export function AdminSubnav() {
  const items = [
    { href: "/admin/login", label: "Login" },
    { href: `/admin/periode/${PROGRAM.id}`, label: "Dashboard" },
    { href: "/admin/verifikasi", label: "Verifikasi" },
    { href: "/admin/clustering", label: "Clustering" },
    { href: "/admin/clustering/hasil", label: "Hasil Cluster" },
    { href: "/admin/bobot", label: "Bobot" },
    { href: "/admin/ranking", label: "Ranking" },
    { href: "/admin/approval", label: "Approval" },
    { href: "/admin/on-chain", label: "On-Chain" },
    { href: "/admin/audit-log", label: "Audit Log" },
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

export function AdminHero({
  eyebrow,
  title,
  body,
  aside,
}: {
  eyebrow: string;
  title: ReactNode;
  body: ReactNode;
  aside?: ReactNode;
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

export function AdminAsideSummary() {
  return (
    <>
      <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Ringkasan periode</p>
      <dl className="mt-5 space-y-4 text-[13px]">
        <SummaryRow label="Program" value={PROGRAM.nama} />
        <SummaryRow label="Periode" value={PROGRAM.periode} />
        <SummaryRow label="Pagu" value={rupiahRingkas(PROGRAM.anggaranTotal)} mono />
        <SummaryRow label="Kuota final" value={angka(dataset.alokasi.kuotaPenerima)} mono />
      </dl>
    </>
  );
}

export function SummaryRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] pb-4 last:border-b-0 last:pb-0">
      <dt className="text-[var(--color-ink-3)]">{label}</dt>
      <dd className={mono ? "font-mono text-right text-[var(--color-ink)]" : "text-right text-[var(--color-ink)]"}>
        {value}
      </dd>
    </div>
  );
}

export function AdminStatsGrid() {
  const verified = dataset.peserta.length;
  const tercairkan = dataset.pencairan.filter((p) => p.status === "claimed").length;
  const prioritasUtama = dataset.clusters.slice(0, 2).reduce((sum, c) => sum + c.jumlahAnggota, 0);

  const items = [
    {
      label: "Data terverifikasi",
      value: angka(verified),
      sub: `${angka(dataset.semua.length - verified)} rumah tangga masih tertahan atau ditolak`,
      icon: <Users className="h-[18px] w-[18px]" />,
    },
    {
      label: "Cluster prioritas",
      value: angka(prioritasUtama),
      sub: "dua kelompok paling rentan masuk antrean ranking",
      icon: <Layers className="h-[18px] w-[18px]" />,
    },
    {
      label: "Dana siap disalurkan",
      value: rupiahRingkas(dataset.alokasi.totalAlokasi),
      sub: `${rupiah(dataset.alokasi.sisaAnggaran)} tersisa sebagai carry-over`,
      icon: <Scale className="h-[18px] w-[18px]" />,
    },
    {
      label: "Sudah diklaim",
      value: persen(tercairkan / dataset.alokasi.kuotaPenerima),
      sub: `${angka(tercairkan)} dari ${angka(dataset.alokasi.kuotaPenerima)} penerima telah menarik dananya`,
      icon: <ShieldCheck className="h-[18px] w-[18px]" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <Reveal key={item.label} delay={index * 70}>
          <article className="rule-card h-full p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">{item.label}</p>
                <p className="mt-4 font-display text-[2rem] leading-none">{item.value}</p>
                <p className="mt-4 text-[13px] leading-6 text-[var(--color-ink-3)]">{item.sub}</p>
              </div>
              <span className="text-[var(--color-ink-3)]">{item.icon}</span>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export function WorkflowCards() {
  const items = [
    { no: "01", title: "Verifikasi lapangan", body: "Data pending dan flagged diperiksa manusia lebih dulu." },
    { no: "02", title: "Clustering kerentanan", body: "K-Means membentuk kelompok rentan sampai mampu." },
    { no: "03", title: "Ranking TOPSIS", body: "Skor dan cutoff diuji sebelum menjadi daftar final." },
    { no: "04", title: "Approval dan chain", body: "Merkle root dikunci setelah approval manusia." },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <Reveal key={item.no} delay={index * 80}>
          <article className="rule-card h-full p-6">
            <p className="font-mono text-[11px] text-[var(--color-ink-4)]">{item.no}</p>
            <h3 className="mt-6 text-[1.4rem]">{item.title}</h3>
            <p className="mt-4 text-[13px] leading-6 text-[var(--color-ink-3)]">{item.body}</p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export function ClusterSummaryCards() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {dataset.clusters.map((cluster, index) => (
        <Reveal key={cluster.index} delay={index * 70}>
          <article className="rule-card h-full p-6">
            <Eyebrow className="max-w-max" tone={index < 2 ? "clay" : "ink"}>
              {cluster.label}
            </Eyebrow>
            <p className="mt-5 font-display text-[2rem] leading-none">{angka(cluster.jumlahAnggota)}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--color-ink-3)]">rumah tangga di kelompok ini</p>
            <dl className="mt-6 flex flex-col gap-3 text-[12px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--color-ink-3)]">Pendapatan centroid</dt>
                <dd className="tnum text-[var(--color-ink-2)]">{rupiah(cluster.centroid.pendapatanPerKapita)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--color-ink-3)]">Tanggungan rata-rata</dt>
                <dd className="tnum text-[var(--color-ink-2)]">{cluster.centroid.jumlahTanggungan.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--color-ink-3)]">Kecocokan segmen</dt>
                <dd className="tnum text-[var(--color-ink-2)]">{persen(cluster.kecocokanSegmen, 1)}</dd>
              </div>
            </dl>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export function BobotList() {
  return (
    <ul className="flex flex-col gap-3">
      {KRITERIA.map((k) => (
        <li
          key={k.key}
          className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-line)] bg-white p-4"
        >
          <span className="text-[13px] text-[var(--color-ink-2)]">{k.label}</span>
          <span className="font-mono text-[12px]">{persen(BOBOT_DEFAULT[k.key], 0)}</span>
        </li>
      ))}
    </ul>
  );
}

export function ApprovalChecklist() {
  const invarian = dataset.invarian;
  return (
    <ul className="flex flex-col gap-3">
      {invarian.map((item) => (
        <li key={item.nama} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-line)] bg-white p-4">
          <span className="flex items-center gap-3 text-[13px]">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full ${item.lolos ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]" : "bg-[var(--color-clay-soft)] text-[var(--color-clay)]"}`}>
              {item.lolos ? <Check className="h-3.5 w-3.5" /> : <Cube className="h-3.5 w-3.5" />}
            </span>
            {item.nama}
          </span>
          <span className="font-mono text-[11px] text-[var(--color-ink-3)]">{item.detail}</span>
        </li>
      ))}
    </ul>
  );
}

export function OnChainSummary() {
  const claimed = dataset.pencairan.filter((p) => p.status === "claimed").length;
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {[
        { label: "Transaksi berhasil", value: angka(claimed), sub: `${angka(dataset.pencairan.length - claimed)} penerima masih menunggu klaim`, icon: <Ledger className="h-[18px] w-[18px]" /> },
        { label: "Nominal per keluarga", value: rupiahRingkas(PROGRAM.nominalDasar), sub: "skema flat menghindari kebocoran peringkat kemiskinan di ledger", icon: <Scale className="h-[18px] w-[18px]" /> },
        { label: "Dana sudah tersalur", value: rupiahRingkas(ringkasanPublik.totalTersalur), sub: `${rupiahRingkas(ringkasanPublik.totalAlokasi - ringkasanPublik.totalTersalur)} masih terkunci`, icon: <Cube className="h-[18px] w-[18px]" /> },
      ].map((item) => (
        <article key={item.label} className="rule-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">{item.label}</p>
              <p className="mt-3 font-display text-[1.7rem] leading-none">{item.value}</p>
              <p className="mt-3 text-[12px] leading-6 text-[var(--color-ink-3)]">{item.sub}</p>
            </div>
            <span className="text-[var(--color-ink-3)]">{item.icon}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

export function AuditEntries() {
  const entries = [
    { at: "20 Agt 2026 09:10", actor: "Verifikator Rina", action: "Approve REC-0042", detail: "Dokumen rumah tangga sesuai hasil kunjungan lapangan." },
    { at: "20 Agt 2026 10:25", actor: "Admin Fajar", action: "Run clustering", detail: "k = 4, iterasi konvergen 7 langkah." },
    { at: "20 Agt 2026 10:41", actor: "Admin Fajar", action: "Update bobot", detail: "Pendapatan 35%, tanggungan 25%, disabilitas 20%, rumah 20%." },
    { at: "20 Agt 2026 11:05", actor: "Admin Fajar", action: "Approve daftar final", detail: "Kuota 185 penerima, Merkle root siap dikunci." },
    { at: "20 Agt 2026 11:22", actor: "Sistem", action: "Register root on-chain", detail: "Transaksi registerPeriode() berhasil di Polygon Amoy." },
  ];

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <article key={`${entry.at}-${entry.action}`} className="rule-card p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[14px] text-[var(--color-ink)]">{entry.action}</p>
              <p className="mt-1 text-[12px] text-[var(--color-ink-4)]">{entry.actor}</p>
              <p className="mt-3 text-[13px] leading-6 text-[var(--color-ink-3)]">{entry.detail}</p>
            </div>
            <span className="font-mono text-[12px] text-[var(--color-ink-3)]">{entry.at}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

export function LoginRoleCards({
  nextAdmin,
  nextVerifikator,
}: {
  nextAdmin: string;
  nextVerifikator: string;
}) {
  const items = [
    {
      title: "Admin",
      body: "Mengatur bobot, menjalankan clustering dan ranking, lalu mengesahkan daftar final.",
      href: `/auth/mock-login?role=admin&next=${encodeURIComponent(nextAdmin)}`,
    },
    {
      title: "Verifikator",
      body: "Meninjau data pending dan flagged sebelum rumah tangga ikut ranking.",
      href: `/auth/mock-login?role=verifikator&next=${encodeURIComponent(nextVerifikator)}`,
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {items.map((item) => (
        <article key={item.title} className="rule-card p-6">
          <h3 className="text-[1.5rem]">{item.title}</h3>
          <p className="mt-4 text-[13px] leading-6 text-[var(--color-ink-3)]">{item.body}</p>
          <div className="mt-6">
            <Button href={item.href}>Masuk sebagai {item.title}</Button>
          </div>
        </article>
      ))}
    </div>
  );
}
