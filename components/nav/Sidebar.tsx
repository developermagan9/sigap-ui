"use client";

import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand/BrandMark";
import { NavList } from "./NavList";
import { NavAccount } from "./NavAccount";
import { menuFor } from "./menu";

export function Sidebar({ initialRole, isSuper }: { initialRole: string; isSuper: boolean }) {
  const pathname = usePathname();
  // Menu mengikuti role aktif (initialRole) apa adanya — termasuk untuk ITSUP,
  // supaya berpindah role lewat RoleSwitcher benar-benar mengganti menu yang
  // tampil, bukan selalu menu gabungan superuser.
  const role = initialRole || "public";
  const items = menuFor(role);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-[var(--color-line)] bg-[rgba(248,250,252,0.96)] px-4 py-4 text-[var(--color-ink)] backdrop-blur-md lg:flex xl:w-80">
      <div className="flex justify-center pb-6 pt-1">
        <BrandMark height={56} priority />
      </div>

      <div className="mt-2 flex-1 overflow-y-auto">
        <NavList items={items} pathname={pathname} />
      </div>

      <div className="mt-auto border-t border-[var(--color-line)] pt-4">
        <NavAccount role={role} isSuper={isSuper} />
      </div>
    </aside>
  );
}
