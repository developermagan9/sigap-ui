"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClientIcon } from "./ClientIcon";

const MOBILE_MENU = {
  public: [
    { href: "/", label: "Beranda", icon: "ph:house-line-duotone" },
    { href: "/cek-status", label: "Cek", icon: "ph:magnifying-glass-duotone" },
    { href: "/transaksi", label: "Transaksi", icon: "ph:link-duotone" },
    { href: "/login", label: "Masuk", icon: "ph:sign-in-duotone" },
  ],
  admin: [
    { href: "/admin/periode", label: "Dashboard", icon: "ph:chart-bar-duotone" },
    { href: "/admin/verifikasi", label: "Verifikasi", icon: "ph:check-circle-duotone" },
    { href: "/admin/on-chain", label: "On-chain", icon: "ph:currency-circle-dollar-duotone" },
  ],
  verifikator: [
    { href: "/admin/verifikasi", label: "Verifikasi", icon: "ph:check-circle-duotone" },
    { href: "/", label: "Publik", icon: "ph:globe-hemisphere-west-duotone" },
  ],
  auditor: [
    { href: "/admin/audit-log", label: "Audit Log", icon: "ph:clock-counter-clockwise-duotone" },
    { href: "/", label: "Publik", icon: "ph:globe-hemisphere-west-duotone" },
  ],
  petugas: [
    { href: "/petugas/tugas", label: "Tugas", icon: "ph:clipboard-text-duotone" },
    { href: "/", label: "Publik", icon: "ph:globe-hemisphere-west-duotone" },
  ],
};

export function MobileNav({ initialRole }: { initialRole: string }) {
  const pathname = usePathname();
  // Menu mengikuti role aktif apa adanya (sama seperti Sidebar desktop) —
  // supaya ganti role lewat RoleSwitcher benar-benar mengganti menu yang tampil.
  const role = initialRole || "public";
  const items = MOBILE_MENU[role as keyof typeof MOBILE_MENU] || MOBILE_MENU.public;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-line)] bg-[rgba(248,250,252,0.96)] pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Navigasi bawah"
    >
      <div className={`grid grid-cols-${items.length}`}>
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] ${
                isActive ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-ink-3)]'
              }`}
            >
              <ClientIcon icon={item.icon} className="text-xl" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
