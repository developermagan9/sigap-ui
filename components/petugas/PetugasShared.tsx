import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check, Doc, Ledger, Users } from "@/components/ui/Icons";
import { dataset } from "@/lib/mock/data";
import { KASUS_DUPLIKAT, WILAYAH } from "@/lib/mock/generate";
import { angka, persen, rupiah } from "@/lib/format";

export function PetugasSubnav() {
  const items = [
    { href: "/petugas/login", label: "Login" },
    { href: "/petugas/tugas", label: "Daftar Tugas" },
    { href: "/petugas/pendataan", label: "Form Input" },
    { href: "/petugas/konfirmasi", label: "Konfirmasi" },
    { href: "/petugas/riwayat", label: "Riwayat" },
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

export function PetugasHero({
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

export function PetugasAsideSummary() {
  const pending = dataset.semua.filter((r) => r.statusVerifikasi === "pending").length;
  const verified = dataset.semua.filter((r) => r.statusVerifikasi === "verified").length;

  return (
    <>
      <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Status lapangan</p>
      <dl className="mt-5 space-y-4 text-[13px]">
        <SummaryRow label="Wilayah aktif" value={`${WILAYAH.length} desa`} />
        <SummaryRow label="Menunggu verifikasi" value={angka(pending)} mono />
        <SummaryRow label="Sudah lolos" value={angka(verified)} mono />
        <SummaryRow label="Kasus duplikat contoh" value={angka(KASUS_DUPLIKAT.length)} mono />
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

export function PetugasTaskCards() {
  const candidates = dataset.semua
    .filter((r) => r.statusVerifikasi !== "rejected")
    .slice(0, 6)
    .map((r, index) => ({
      ref: r.ref,
      desa: r.desa,
      note: index % 2 === 0 ? "Perlu foto dokumen rumah tangga" : "Lengkapi anggota keluarga dan pendapatan",
      status: index < 2 ? "baru" : index < 4 ? "diproses" : "menunggu review",
    }));

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {candidates.map((item, index) => (
        <Reveal key={item.ref} delay={index * 70}>
          <article className="rule-card h-full p-6">
            <div className="flex items-center justify-between gap-4">
              <Eyebrow tone={item.status === "baru" ? "gold" : item.status === "diproses" ? "ink" : "sage"}>
                {item.status}
              </Eyebrow>
              <span className="font-mono text-[11px] text-[var(--color-ink-4)]">{item.ref}</span>
            </div>
            <h3 className="mt-6 text-[1.5rem]">{item.desa}</h3>
            <p className="mt-3 text-[13px] leading-6 text-[var(--color-ink-3)]">{item.note}</p>
            <div className="mt-6">
              <Button href="/petugas/pendataan" icon={<ArrowRight className="h-4 w-4" />}>
                Buka pendataan
              </Button>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export function PetugasStatsGrid() {
  const pending = dataset.semua.filter((r) => r.statusVerifikasi === "pending").length;
  const flagged = dataset.semua.filter((r) => r.flaggedDuplicate).length;
  const verified = dataset.semua.filter((r) => r.statusVerifikasi === "verified").length;
  const successRate = verified / Math.max(dataset.semua.length, 1);

  const stats = [
    { label: "Entri menunggu review", value: angka(pending), body: "Masih perlu keputusan verifikator." },
    { label: "Perlu cek duplikat", value: angka(flagged), body: "Ditandai untuk review manual, bukan otomatis ditolak." },
    { label: "Lolos verifikasi", value: angka(verified), body: "Sudah siap ikut tahap clustering dan ranking." },
    { label: "Rasio lolos saat ini", value: persen(successRate), body: "Gambaran kualitas input lapangan terhadap data periode ini." },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item, index) => (
        <Reveal key={item.label} delay={index * 60}>
          <article className="rule-card h-full p-6">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">{item.label}</p>
            <p className="mt-4 font-display text-[2rem] leading-none">{item.value}</p>
            <p className="mt-4 text-[13px] leading-6 text-[var(--color-ink-3)]">{item.body}</p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export function PetugasQuickSteps() {
  const steps = [
    { icon: Users, title: "Pilih tugas wilayah", body: "Petugas melihat KK mana yang perlu didata atau dilengkapi." },
    { icon: Doc, title: "Isi form bertahap", body: "Data KK, anggota keluarga, kondisi rumah, dan lampiran dikumpulkan." },
    { icon: Check, title: "Kirim untuk review", body: "Sistem memberi status pending, flagged, atau ditolak bila duplikat keras ditemukan." },
    { icon: Ledger, title: "Pantau hasilnya", body: "Petugas dapat melihat apakah data lolos, ditolak, atau perlu revisi." },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {steps.map((item, index) => {
        const Icon = item.icon;
        return (
          <Reveal key={item.title} delay={index * 80}>
            <article className="rule-card h-full p-6">
              <div className="flex h-10 w-10 items-center justify-center border border-[var(--color-line)] bg-[var(--color-paper)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-[1.35rem]">{item.title}</h3>
              <p className="mt-4 text-[13px] leading-6 text-[var(--color-ink-3)]">{item.body}</p>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

export function RiwayatList() {
  const entries = dataset.semua.slice(0, 8).map((r, index) => ({
    ref: r.ref,
    desa: r.desa,
    status:
      r.statusVerifikasi === "verified"
        ? "verified"
        : r.flaggedDuplicate
          ? "flagged"
          : r.statusVerifikasi,
    amount: r.pendapatanPerKapita * (r.jumlahTanggungan + 1),
    note:
      r.statusVerifikasi === "verified"
        ? "Lolos review lapangan."
        : r.flaggedDuplicate
          ? "Perlu pemeriksaan manual oleh verifikator."
          : "Menunggu keputusan verifikator.",
    time: `20 Agt 2026 · ${String(8 + index).padStart(2, "0")}:15`,
  }));

  const tone = (status: string) =>
    status === "verified"
      ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
      : status === "flagged"
        ? "bg-[#fbf3db] text-[#956400]"
        : "bg-[var(--color-paper-2)] text-[var(--color-ink-2)]";

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <article key={entry.ref} className="rule-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[12px]">{entry.ref}</span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${tone(entry.status)}`}>
                  {entry.status}
                </span>
              </div>
              <p className="mt-3 text-[15px] text-[var(--color-ink)]">{entry.desa}</p>
              <p className="mt-1 text-[13px] leading-6 text-[var(--color-ink-3)]">{entry.note}</p>
            </div>
            <div className="sm:text-right">
              <p className="font-mono text-[13px]">{rupiah(entry.amount)}</p>
              <p className="mt-1 text-[12px] text-[var(--color-ink-4)]">{entry.time}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
