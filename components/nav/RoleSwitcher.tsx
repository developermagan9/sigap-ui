"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClientIcon } from "./ClientIcon";
import { PERIODE_AKTIF_ID } from "@/lib/constants";

type Role = "admin" | "verifikator" | "petugas";

const ROLES: { id: Role; label: string; icon: string }[] = [
  { id: "admin", label: "Admin", icon: "ph:shield-star-duotone" },
  { id: "verifikator", label: "Verifikator", icon: "ph:check-circle-duotone" },
  { id: "petugas", label: "Petugas", icon: "ph:clipboard-text-duotone" },
];

export function RoleSwitcher({ currentRole }: { currentRole: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSwitch = async (newRole: Role) => {
    setOpen(false);
    if (newRole === currentRole) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        if (newRole === "admin") router.push(`/admin/periode/${PERIODE_AKTIF_ID}`);
        else if (newRole === "verifikator") router.push("/admin/verifikasi");
        else if (newRole === "petugas") router.push("/petugas/tugas");

        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const aktif = ROLES.find((r) => r.id === currentRole) ?? ROLES[0];

  return (
    <div className="relative mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-md border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-2.5 py-2 text-[12px] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent)]/10 disabled:opacity-60"
      >
        <ClientIcon icon="ph:magic-wand-duotone" className="shrink-0 text-[var(--color-accent)]" />
        <span className="flex-1 truncate text-left font-medium">
          {loading ? "Mengganti..." : `Ganti ke ${aktif.label}`}
        </span>
        <ClientIcon
          icon="ph:caret-down-duotone"
          className={`shrink-0 text-[var(--color-ink-3)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Tutup pilihan role"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-full z-50 mb-1.5 overflow-hidden rounded-md border border-[var(--color-line)] bg-white shadow-lg">
            <p className="border-b border-[var(--color-line)] px-3 py-2 text-[10px] uppercase tracking-wider text-[var(--color-ink-4)]">
              Ganti role
            </p>
            {ROLES.map((r) => (
              <button
                key={r.id}
                disabled={r.id === currentRole}
                onClick={() => handleSwitch(r.id)}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-[12px] transition-colors ${
                  r.id === currentRole
                    ? "cursor-default bg-[var(--color-accent)]/10 font-medium text-[var(--color-ink)]"
                    : "text-[var(--color-ink-2)] hover:bg-[var(--color-paper-2)]"
                }`}
              >
                <ClientIcon icon={r.icon} />
                {r.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
