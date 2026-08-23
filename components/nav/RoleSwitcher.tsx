"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClientIcon } from "./ClientIcon";

type Role = "admin" | "verifikator" | "petugas";

export function RoleSwitcher({ currentRole }: { currentRole: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSwitch = async (newRole: Role) => {
    if (newRole === currentRole) return;
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (res.ok) {
        if (newRole === "admin") router.push("/admin/periode/12");
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

  const roles: { id: Role, label: string, icon: string }[] = [
    { id: "admin", label: "Admin", icon: "ph:shield-star-duotone" },
    { id: "verifikator", label: "Verifikator", icon: "ph:check-circle-duotone" },
    { id: "petugas", label: "Petugas", icon: "ph:clipboard-text-duotone" },
  ];

  return (
    <div className="mt-4 flex flex-col gap-1.5 border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-2 rounded-md">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-accent)] font-semibold mb-1 px-1">
        <ClientIcon icon="ph:magic-wand-duotone" />
        <span>Akses Superuser</span>
      </div>
      {roles.map((r) => (
        <button
          key={r.id}
          disabled={loading || r.id === currentRole}
          onClick={() => handleSwitch(r.id)}
          className={`flex items-center gap-2 rounded px-2 py-1.5 text-[12px] transition-colors border border-transparent ${
            r.id === currentRole 
              ? "bg-[var(--color-accent)]/10 text-[var(--color-ink)] border-[var(--color-accent)]/20 font-medium cursor-default" 
              : "text-[var(--color-ink-3)] hover:bg-white hover:border-[var(--color-line)] hover:text-[var(--color-ink-2)]"
          }`}
        >
          <ClientIcon icon={r.icon} />
          <span>Ganti ke {r.label}</span>
        </button>
      ))}
    </div>
  );
}
