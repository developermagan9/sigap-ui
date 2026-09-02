import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Layers, Scale, Link as LinkIcon } from "@/components/ui/Icons";
import { LoginForm } from "@/components/auth/LoginForm";
import { BrandMark } from "@/components/brand/BrandMark";
import { ApiClient } from "@/lib/api";
import { NAMA_JARINGAN } from "@/lib/constants";
import { angka, persen, rupiahRingkas } from "@/lib/format";

export const metadata: Metadata = {
  title: "Masuk — SIGAP-Bansos",
};

const PIPELINE = [
  {
    icon: Layers,
    title: "Clustering K-Means",
    desc: "Rumah tangga dikelompokkan menurut tingkat kerentanan sebelum diberi peringkat.",
  },
  {
    icon: Scale,
    title: "Ranking TOPSIS",
    desc: "Peringkat penerima dihitung objektif dari beberapa kriteria kelayakan sekaligus.",
  },
  {
    icon: LinkIcon,
    title: "Audit on-chain",
    desc: "Setiap pencairan dicatat sebagai Merkle root yang bisa diverifikasi publik.",
  },
];

export default async function LoginPage() {
  // Statistik panel kiri dibaca dari API publik (tanpa token) — halaman login
  // memang dilihat sebelum ada sesi, jadi hanya endpoint publik yang boleh dipakai.
  const programs = await ApiClient.public.getPrograms().catch(() => []);
  const detail = programs[0] ? await ApiClient.public.getProgramDetail(programs[0].id).catch(() => null) : null;

  const totalAlokasi = detail?.total_alokasi ?? 0;
  const persenTersalur = totalAlokasi > 0 ? (detail?.total_tersalur ?? 0) / totalAlokasi : 0;

  const STATS = [
    { label: "Program aktif", value: detail?.nama_program ?? "Belum ada periode disahkan", hint: detail?.status ?? "—" },
    {
      label: "Dana tersalur",
      value: rupiahRingkas(detail?.total_tersalur ?? 0),
      hint: `${persen(persenTersalur)} dari alokasi`,
    },
    { label: "Penerima terverifikasi", value: angka(detail?.total_verifikasi ?? 0), hint: NAMA_JARINGAN },
  ];

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Left — editorial brand panel */}
      <div className="relative hidden overflow-hidden bg-[var(--color-primary)] px-10 py-10 text-[#F8FAFC] lg:flex lg:w-[46%] lg:flex-col lg:justify-between xl:w-[42%] xl:px-16 xl:py-14">
        {/* Ambient texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 75%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(132,204,22,0.12), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(20,121,209,0.30), transparent 70%)" }}
        />

        <div className="fade-in-up relative z-10">
          <Link href="/" className="inline-flex rounded-xl bg-white px-5 py-3.5 shadow-sm">
            <BrandMark height={46} priority />
          </Link>
        </div>

        <div className="fade-in-up relative z-10 max-w-md" style={{ ["--delay" as string]: "80ms" }}>
          <h1 className="font-display text-[2.1rem] leading-[1.08] tracking-[-0.02em] xl:text-[2.4rem]">
            Bantuan sosial yang penyalurannya bisa ditelusuri, bukan sekadar dijanjikan.
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed text-[#F8FAFC]/70">
            Prioritas penerima dihitung objektif lewat K-Means dan TOPSIS, lalu setiap pencairan dana
            dicatat on-chain agar bisa diaudit publik kapan saja.
          </p>

          <div className="mt-8 flex flex-col">
            {PIPELINE.map((step, i) => (
              <div
                key={step.title}
                className={`fade-in-up flex items-start gap-3.5 py-3.5 ${
                  i > 0 ? "border-t border-white/10" : ""
                }`}
                style={{ ["--delay" as string]: `${160 + i * 80}ms` }}
              >
                <step.icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#84CC16]" strokeWidth={1.6} />
                <div>
                  <p className="text-[13px] font-medium text-[#F8FAFC]">{step.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#F8FAFC]/60">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fade-in-up relative z-10 mt-10" style={{ ["--delay" as string]: "420ms" }}>
          <div className="flex items-stretch divide-x divide-white/10 border-t border-white/10 pt-5">
            {STATS.map((s) => (
              <div key={s.label} className="flex-1 px-4 first:pl-0 last:pr-0">
                <p className="text-[10.5px] uppercase tracking-[0.1em] text-[#F8FAFC]/45">{s.label}</p>
                <p className="tnum mt-1.5 truncate font-display text-[15px] tracking-[-0.01em]">{s.value}</p>
                <p className="mt-0.5 text-[11px] text-[#F8FAFC]/50">{s.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — auth form */}
      <div className="relative flex flex-1 flex-col px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center justify-between lg:justify-end">
          <Link
            href="/"
            className="inline-flex lg:hidden"
          >
            <BrandMark height={34} priority />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 transition-colors hover:text-ink"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            Kembali ke beranda
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm rounded-[12px] border border-[var(--color-line)] bg-[var(--color-card)] p-8 sm:p-9 lift-1">
            <LoginForm />
          </div>
        </div>

        <p className="pb-2 text-center text-[11px] text-ink-4">SIGAP-Bansos © 2026. Purwarupa Sistem Transparansi.</p>
      </div>
    </div>
  );
}
