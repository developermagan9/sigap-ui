"use client";

import Link from "next/link";
import { ClientIcon } from "./ClientIcon";
import { activeHref, type MenuItem } from "./menu";

/**
 * Daftar link menu vertikal — dipakai bersama oleh Sidebar (desktop) dan
 * MobileDrawer supaya keduanya tidak pernah menyimpang bentuk maupun isinya.
 */
export function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: MenuItem[];
  pathname: string;
  /** Dipanggil setelah item diklik — dipakai drawer untuk menutup dirinya. */
  onNavigate?: () => void;
}) {
  const aktif = activeHref(items, pathname);

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive = item.href === aktif;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            // min-h-11 ≈ 44px: ambang target sentuh yang nyaman di ponsel.
            className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-[14px] transition-colors border border-transparent ${
              isActive
                ? "bg-white border-[var(--color-line)] font-medium text-[var(--color-ink)]"
                : "text-[var(--color-ink-2)] hover:bg-white hover:border-[var(--color-line)] hover:text-[var(--color-ink)]"
            }`}
          >
            <ClientIcon
              icon={item.icon}
              className={`text-[1.2rem] shrink-0 ${isActive ? "text-[var(--color-primary)]" : "text-[var(--color-ink-3)]"}`}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
