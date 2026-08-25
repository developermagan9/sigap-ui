import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check, Doc, Ledger, Users } from "@/components/ui/Icons";
import { angka, persen, rupiah, waktu } from "@/lib/format";
import { AjukanKoreksi } from "./AjukanKoreksi";
import type { RumahTanggaRow } from "@/lib/api";

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

export function PetugasTaskCards({ items }: { items: RumahTanggaRow[] }) {
  const candidates = items.filter((r) => r.statusVerifikasi !== "rejected").slice(0, 6);

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {candidates.length === 0 && (
        <p className="text-[13px] text-[var(--color-ink-3)]">Tidak ada tugas aktif untuk periode ini.</p>
      )}
      {candidates.map((item, index) => {
        const status = item.flaggedDuplicate ? "ditandai" : item.statusVerifikasi === "pending" ? "menunggu review" : "diproses";
        return (
          <Reveal key={item.id} delay={index * 70}>
            <article className="rule-card h-full p-6">
              <div className="flex items-center justify-between gap-4">
                <Eyebrow tone={status === "ditandai" ? "gold" : "ink"}>{status}</Eyebrow>
                <span className="font-mono text-[11px] text-[var(--color-ink-4)]">{item.id.slice(0, 8)}</span>
              </div>
              <h3 className="mt-6 text-[1.5rem]">{item.wilayah.desa}</h3>
              <p className="mt-3 text-[13px] leading-6 text-[var(--color-ink-3)]">
                {item.flaggedDuplicate ? "Ditandai mirip data lain — perlu review manual." : "Menunggu keputusan verifikator."}
              </p>
              <div className="mt-6">
                <Button href="/petugas/pendataan" icon={<ArrowRight className="h-4 w-4" />}>
                  Buka pendataan
                </Button>
              </div>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

export function PetugasStatsGrid({ items }: { items: RumahTanggaRow[] }) {
  const pending = items.filter((r) => r.statusVerifikasi === "pending").length;
  const flagged = items.filter((r) => r.flaggedDuplicate).length;
  const verified = items.filter((r) => r.statusVerifikasi === "verified").length;
  const successRate = verified / Math.max(items.length, 1);

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

export function RiwayatList({ items }: { items: RumahTanggaRow[] }) {
  const entries = items.slice(0, 8).map((r) => ({
    id: r.id,
    desa: r.wilayah.desa,
    status: r.statusVerifikasi === "verified" ? "verified" : r.flaggedDuplicate ? "flagged" : r.statusVerifikasi,
    pendapatanPerKapita: r.pendapatanPerKapita,
    note:
      r.statusVerifikasi === "verified"
        ? "Lolos review lapangan."
        : r.flaggedDuplicate
          ? "Perlu pemeriksaan manual oleh verifikator."
          : "Menunggu keputusan verifikator.",
    time: r.createdAt,
  }));

  const tone = (status: string) =>
    status === "verified"
      ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
      : status === "flagged"
        ? "bg-[#fbf3db] text-[#956400]"
        : "bg-[var(--color-paper-2)] text-[var(--color-ink-2)]";

  if (entries.length === 0) {
    return <p className="text-[13px] text-[var(--color-ink-3)]">Belum ada entri yang dikirim untuk periode ini.</p>;
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <article key={entry.id} className="rule-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[12px]">{entry.id.slice(0, 8)}</span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${tone(entry.status)}`}>
                  {entry.status}
                </span>
              </div>
              <p className="mt-3 text-[15px] text-[var(--color-ink)]">{entry.desa}</p>
              <p className="mt-1 text-[13px] leading-6 text-[var(--color-ink-3)]">{entry.note}</p>
              <AjukanKoreksi rumahTanggaId={entry.id} pendapatanSaatIni={entry.pendapatanPerKapita} />
            </div>
            <div className="sm:text-right">
              <p className="font-mono text-[13px]">{rupiah(entry.pendapatanPerKapita)}/kapita</p>
              <p className="mt-1 text-[12px] text-[var(--color-ink-4)]">{waktu(entry.time)}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
