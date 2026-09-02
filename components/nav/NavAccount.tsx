"use client";

import { RoleSwitcher } from "./RoleSwitcher";
import { LogoutButton } from "./LogoutButton";

/**
 * Blok akun di kaki menu (identitas + ganti role + keluar). Dipakai bersama
 * Sidebar dan MobileDrawer.
 */
export function NavAccount({ role, isSuper }: { role: string; isSuper: boolean }) {
  if (role === "public") {
    return (
      <div className="px-2 pb-2">
        <p className="text-center text-xs leading-relaxed text-[var(--color-ink-3)]">
          Sistem Informasi
          <br />
          Penyaluran Bantuan Sosial
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="px-2">
        <p className="text-[11px] uppercase tracking-wider text-[var(--color-ink-3)]">Login sebagai</p>
        <p className="truncate text-[14px] font-medium capitalize text-[var(--color-ink)]">
          {isSuper ? "Super Administrator" : role}
        </p>
      </div>
      {isSuper && <RoleSwitcher currentRole={role || "admin"} />}
      <LogoutButton />
    </div>
  );
}
