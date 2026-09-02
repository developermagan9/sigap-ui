"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClientIcon } from "./ClientIcon";
import { activeHref, primaryMenuFor } from "./menu";

export function MobileNav({ initialRole }: { initialRole: string }) {
  const pathname = usePathname();
  // Menu mengikuti role aktif apa adanya (sama seperti Sidebar desktop) —
  // supaya ganti role lewat RoleSwitcher benar-benar mengganti menu yang tampil.
  const items = primaryMenuFor(initialRole || "public");
  const aktif = activeHref(items, pathname);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-line)] bg-[rgba(248,250,252,0.96)] pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      aria-label="Navigasi bawah"
    >
      {/* Flex, bukan `grid-cols-${n}`: kelas Tailwind yang dirakit dari variabel
          tidak pernah ikut ter-compile, sehingga bar ini dulu menumpuk vertikal
          dan menutup sepertiga layar ponsel. */}
      <div className="flex items-stretch">
        {items.map((item) => {
          const isActive = item.href === aktif;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] ${
                isActive ? "font-medium text-[var(--color-primary)]" : "text-[var(--color-ink-3)]"
              }`}
            >
              <ClientIcon icon={item.icon} className="text-xl" />
              <span className="max-w-full truncate">{item.short ?? item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
