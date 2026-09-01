"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClientIcon } from "./ClientIcon";
import { RoleSwitcher } from "./RoleSwitcher";
import { LogoutButton } from "./LogoutButton";

type Role = "admin" | "verifikator" | "petugas" | "auditor" | "public";

const MENU_ITEMS = {
  public: [
    { href: "/", label: "Beranda", icon: "ph:house-line-duotone" },
    { href: "/pencairan", label: "Pencairan", icon: "ph:currency-circle-dollar-duotone" },
    { href: "/transaksi", label: "Transaksi Publik", icon: "ph:link-duotone" },
    { href: "/metodologi", label: "Metodologi", icon: "ph:math-operations-duotone" },
    { href: "/cek-status", label: "Cek Status Bansos", icon: "ph:magnifying-glass-duotone" },
    { href: "/login", label: "Masuk", icon: "ph:sign-in-duotone" },
  ],
  admin: [
    { href: "/admin/periode", label: "Dashboard Program", icon: "ph:chart-bar-duotone" },
    { href: "/admin/periode/baru", label: "Periode Baru", icon: "ph:plus-circle-duotone" },
    { href: "/admin/verifikasi", label: "Verifikasi Data", icon: "ph:check-circle-duotone" },
    { href: "/admin/sanggahan", label: "Sanggahan Data", icon: "ph:chat-centered-text-duotone" },
    { href: "/admin/clustering", label: "Analisis Clustering", icon: "ph:intersect-duotone" },
    { href: "/admin/clustering/hasil", label: "Hasil Clustering", icon: "ph:chart-scatter-duotone" },
    { href: "/admin/bobot", label: "Konfigurasi Bobot", icon: "ph:sliders-duotone" },
    { href: "/admin/ranking", label: "Hasil Ranking", icon: "ph:list-numbers-duotone" },
    { href: "/admin/approval", label: "Review & Approval", icon: "ph:seal-check-duotone" },
    { href: "/admin/on-chain", label: "Penyaluran On-chain", icon: "ph:currency-circle-dollar-duotone" },
    { href: "/admin/audit-log", label: "Audit Log", icon: "ph:clock-counter-clockwise-duotone" },
    { href: "/", label: "Portal Publik", icon: "ph:globe-hemisphere-west-duotone" },
  ],
  verifikator: [
    { href: "/admin/verifikasi", label: "Verifikasi Data", icon: "ph:check-circle-duotone" },
    { href: "/admin/sanggahan", label: "Sanggahan Data", icon: "ph:chat-centered-text-duotone" },
    { href: "/", label: "Portal Publik", icon: "ph:globe-hemisphere-west-duotone" },
  ],
  // Role `auditor` ada di enum & seed sejak awal tapi tidak pernah punya menu —
  // praktis akun ini bisa login lalu terdampar. Sejak `GET /audit-log` mengizinkan
  // `auditor`, role ini akhirnya punya satu halaman yang benar-benar bisa dibuka.
  auditor: [
    { href: "/admin/audit-log", label: "Audit Log", icon: "ph:clock-counter-clockwise-duotone" },
    { href: "/", label: "Portal Publik", icon: "ph:globe-hemisphere-west-duotone" },
  ],
  petugas: [
    { href: "/petugas/tugas", label: "Tugas Pendataan", icon: "ph:clipboard-text-duotone" },
    { href: "/petugas/pendataan", label: "Form Input", icon: "ph:note-pencil-duotone" },
    { href: "/petugas/konfirmasi", label: "Konfirmasi", icon: "ph:paper-plane-tilt-duotone" },
    { href: "/petugas/riwayat", label: "Riwayat", icon: "ph:clock-counter-clockwise-duotone" },
    { href: "/", label: "Portal Publik", icon: "ph:globe-hemisphere-west-duotone" },
  ],
};

export function Sidebar({ initialRole, isSuper }: { initialRole: string; isSuper: boolean }) {
  const pathname = usePathname();
  // Menu mengikuti role aktif (initialRole) apa adanya — termasuk untuk ITSUP,
  // supaya berpindah role lewat RoleSwitcher benar-benar mengganti menu yang
  // tampil, bukan selalu menu gabungan superuser.
  const role: Role = (initialRole as Role) || "public";
  const items = MENU_ITEMS[role] || MENU_ITEMS.public;

  // Longest-prefix-wins: dengan rute sibling seperti /admin/clustering dan
  // /admin/clustering/hasil, cocokkan hanya item yang paling spesifik supaya
  // tidak dua-duanya menyala sekaligus.
  const activeHref = items
    .map((item) => item.href)
    .filter((href) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-[var(--color-line)] bg-[rgba(247,245,239,0.96)] backdrop-blur-md px-4 py-4 xl:w-80 lg:flex text-[var(--color-ink)]">
      <div className="px-3 pb-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-white border border-[var(--color-line)] text-[12px] font-bold text-[var(--color-primary)]">
          SGP
        </span>
        <div>
          <p className="font-display text-[15px] font-semibold tracking-wide">SIGAP Bansos</p>
          <p className="text-[11px] text-[var(--color-ink-3)] uppercase tracking-widest">{role === "public" ? "Transparansi" : "Internal"}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-2">
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] transition-colors border border-transparent ${
                  isActive
                    ? 'bg-white border-[var(--color-line)] font-medium text-[var(--color-ink)]'
                    : 'text-[var(--color-ink-2)] hover:bg-white hover:border-[var(--color-line)] hover:text-[var(--color-ink)]'
                }`}
              >
                <ClientIcon icon={item.icon} className={`text-[1.2rem] shrink-0 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink-3)]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-[var(--color-line)] pt-4">
        {role !== "public" ? (
          <div className="flex flex-col gap-2">
            <div className="px-2">
              <p className="text-[11px] text-[var(--color-ink-3)] uppercase tracking-wider">Login sebagai</p>
              <p className="text-[14px] font-medium text-[var(--color-ink)]">
                {isSuper ? "Super Administrator" : role}
              </p>
            </div>
            {isSuper && <RoleSwitcher currentRole={initialRole || "admin"} />}
            <LogoutButton />
          </div>
        ) : (
          <div className="px-2 pb-2">
            <p className="text-[var(--color-ink-3)] text-xs text-center leading-relaxed">
              Sistem Informasi<br/>Penyaluran Bantuan Sosial
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
