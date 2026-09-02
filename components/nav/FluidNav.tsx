"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand/BrandMark";

const TAUTAN = [
  { href: "/", label: "Transparansi", ket: "Portal publik" },
  { href: "/transaksi", label: "Transaksi", ket: "Jejak on-chain publik" },
  { href: "/metodologi", label: "Metodologi", ket: "Kriteria & penjelasan" },
  { href: "/cek-status", label: "Cek Status", ket: "Status pencairan warga" },
  { href: "/admin/login", label: "Admin", ket: "Login admin / verifikator" },
  { href: "/petugas/login", label: "Petugas", ket: "Login petugas lapangan" },
];

export function FluidNav() {
  const [buka, setBuka] = useState(false);
  const path = usePathname();

  useEffect(() => setBuka(false), [path]);

  useEffect(() => {
    document.body.style.overflow = buka ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [buka]);

  const aktif = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href.split("/").slice(0, 2).join("/"));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-[var(--color-line)] bg-[rgba(248,250,252,0.9)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[78rem] items-center justify-between gap-6 px-4 py-4 sm:px-8">
          <Link href="/" className="min-w-0">
            <BrandMark height={44} priority />
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {TAUTAN.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`border px-3 py-2 text-[13px] transition-colors ${
                  aktif(t.href)
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                    : "border-transparent text-[var(--color-ink-3)] hover:border-[var(--color-line)] hover:bg-white hover:text-[var(--color-ink)]"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setBuka((v) => !v)}
            aria-expanded={buka}
            aria-label={buka ? "Tutup menu" : "Buka menu"}
            className="border border-[var(--color-line)] bg-white px-3 py-2 text-[12px] uppercase tracking-[0.14em] text-[var(--color-ink)] lg:hidden"
          >
            Menu
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-20 bg-[rgba(248,250,252,0.96)] px-4 pt-24 transition-opacity duration-200 lg:hidden ${
          buka ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="mx-auto max-w-[78rem] border border-[var(--color-line)] bg-white">
          {TAUTAN.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="block border-b border-[var(--color-line)] px-5 py-4 last:border-b-0"
            >
              <p className="font-display text-2xl">{t.label}</p>
              <p className="mt-1 text-[13px] text-[var(--color-ink-3)]">{t.ket}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
