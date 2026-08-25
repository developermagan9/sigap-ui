import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Check, Cube, Layers, Ledger, Scale, ShieldCheck, Users } from "@/components/ui/Icons";
import { angka, persen, rupiah, rupiahRingkas } from "@/lib/format";

/** Label kriteria TOPSIS — cocok dengan `KRITERIA_DEFAULT` di sigap-api/src/mining/mining.service.ts.
 *  Backend cuma menyimpan `bobot_kriteria` sebagai angka mentah tanpa label manusia. */
export const KRITERIA_LABEL: Record<string, string> = {
  pendapatanPerKapita: "Pendapatan per kapita",
  jumlahTanggungan: "Jumlah tanggungan",
  jumlahDisabilitasLansia: "Disabilitas / lansia",
  skorKondisiRumah: "Kondisi rumah",
};

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

export function AdminStatsGrid({
  totalRumahTangga,
  dataTerverifikasi,
  clusterPrioritas,
  totalAlokasi,
  sisaAnggaran,
  kuotaPenerima,
  jumlahKlaim,
}: {
  totalRumahTangga: number;
  dataTerverifikasi: number;
  clusterPrioritas: number;
  totalAlokasi: number;
  sisaAnggaran: number;
  kuotaPenerima: number;
  jumlahKlaim: number;
}) {
  const items = [
    {
      label: "Data terverifikasi",
      value: angka(dataTerverifikasi),
      sub: `${angka(Math.max(totalRumahTangga - dataTerverifikasi, 0))} rumah tangga masih tertahan atau ditolak`,
      icon: <Users className="h-[18px] w-[18px]" />,
    },
    {
      label: "Cluster prioritas",
      value: angka(clusterPrioritas),
      sub: "dua kelompok paling rentan masuk antrean ranking",
      icon: <Layers className="h-[18px] w-[18px]" />,
    },
    {
      label: "Dana siap disalurkan",
      value: rupiahRingkas(totalAlokasi),
      sub: `${rupiah(sisaAnggaran)} tersisa sebagai carry-over`,
      icon: <Scale className="h-[18px] w-[18px]" />,
    },
    {
      label: "Sudah diklaim",
      value: kuotaPenerima > 0 ? persen(jumlahKlaim / kuotaPenerima) : "—",
      sub: `${angka(jumlahKlaim)} dari ${angka(kuotaPenerima)} penerima telah menarik dananya`,
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

type ClusterRingkas = {
  clusterIndex: number;
  label: string;
  jumlahAnggota: number;
  centroid: Record<string, number>;
};

export function ClusterSummaryCards({ clusters }: { clusters: ClusterRingkas[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {clusters.map((cluster, index) => (
        <Reveal key={cluster.clusterIndex} delay={index * 70}>
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
            </dl>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export function BobotList({ bobot }: { bobot: Record<string, number> }) {
  return (
    <ul className="flex flex-col gap-3">
      {Object.entries(bobot).map(([key, value]) => (
        <li
          key={key}
          className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-line)] bg-white p-4"
        >
          <span className="text-[13px] text-[var(--color-ink-2)]">{KRITERIA_LABEL[key] ?? key}</span>
          <span className="font-mono text-[12px]">{persen(value, 0)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Lima invarian yang diperiksa server saat `build-merkle` dijalankan (lihat
 *  merkle.service.ts checkInvariants()). Tidak ada endpoint pratinjau — status
 *  lolos/gagal sungguhan baru diketahui saat build-merkle benar-benar dipanggil
 *  di halaman On-chain, jadi daftar ini bersifat informasi, bukan status hidup. */
export function ApprovalChecklist() {
  const items = [
    "Total nominal alokasi sama dengan jumlah amount tiap penerima",
    "Total alokasi tidak melebihi anggaran efektif",
    "Jumlah leaf Merkle sama dengan kuota penerima",
    "Setiap alamat wallet valid dan unik",
    "Setiap nominal amount lebih besar dari nol",
  ];
  return (
    <ul className="flex flex-col gap-3">
      {items.map((nama) => (
        <li key={nama} className="flex items-center gap-3 rounded-xl border border-[var(--color-line)] bg-white p-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-paper-2)] text-[var(--color-ink-3)]">
            <Check className="h-3.5 w-3.5" />
          </span>
          <span className="text-[13px] text-[var(--color-ink-2)]">{nama}</span>
        </li>
      ))}
    </ul>
  );
}

export function OnChainSummary({
  totalRecipients,
  totalClaimed,
  totalPending,
  nominalDasar,
}: {
  totalRecipients: number;
  totalClaimed: number;
  totalPending: number;
  nominalDasar: number;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {[
        { label: "Transaksi berhasil", value: angka(totalClaimed), sub: `${angka(totalPending)} penerima masih menunggu klaim`, icon: <Ledger className="h-[18px] w-[18px]" /> },
        { label: "Nominal per keluarga", value: rupiahRingkas(nominalDasar), sub: "skema flat menghindari kebocoran peringkat kemiskinan di ledger", icon: <Scale className="h-[18px] w-[18px]" /> },
        { label: "Dana sudah tersalur", value: rupiahRingkas(nominalDasar * totalClaimed), sub: `dari ${angka(totalRecipients)} penerima terdaftar`, icon: <Cube className="h-[18px] w-[18px]" /> },
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
