"use client";

import { useCallback, useEffect, useState } from "react";
import { ClientIcon } from "./ClientIcon";
import { MobileDrawer } from "./MobileDrawer";

function useJamSekarang() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

export function Topbar({
  role,
  username,
  isSuper,
}: {
  role: string;
  username: string;
  isSuper: boolean;
}) {
  const now = useJamSekarang();
  const [menuOpen, setMenuOpen] = useState(false);
  const tutupMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[rgba(248,250,252,0.95)] backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-4 sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Buka menu"
            aria-expanded={menuOpen}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-transparent text-[var(--color-ink-3)] transition-colors hover:border-[var(--color-line)] hover:bg-white lg:hidden"
          >
            <ClientIcon icon="ph:list-duotone" className="text-lg" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--color-ink)]">{username}</p>
            <p className="truncate text-xs capitalize text-[var(--color-ink-3)]">
              {isSuper ? "Super Administrator" : role || "Publik"}
            </p>
          </div>

          <div className="hidden flex-col items-end leading-tight sm:flex" aria-live="off">
            <span className="font-mono text-[13px] tabular-nums text-[var(--color-ink)]">
              {now
                ? now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                : "--:--:--"}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-ink-4)]">
              {now ? now.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }) : ""}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Notifikasi"
              className="relative grid h-10 w-10 place-items-center rounded-md border border-transparent text-[var(--color-ink-3)] transition-colors hover:border-[var(--color-line)] hover:bg-white"
            >
              <ClientIcon icon="ph:bell-duotone" className="text-lg" />
            </button>
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--color-line)] bg-white text-xs font-semibold uppercase text-[var(--color-primary)]">
              {username ? username.substring(0, 2) : "GU"}
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer open={menuOpen} onClose={tutupMenu} role={role} isSuper={isSuper} />
    </>
  );
}
