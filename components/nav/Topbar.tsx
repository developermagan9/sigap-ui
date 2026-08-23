"use client";

import { ClientIcon } from "./ClientIcon";

export function Topbar({ role, username }: { role: string; username: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[rgba(247,245,239,0.95)] backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button
          className="rounded-md p-2 text-[var(--color-ink-3)] hover:bg-white border border-transparent hover:border-[var(--color-line)] lg:hidden"
          aria-label="Menu"
        >
          <ClientIcon icon="ph:list-duotone" className="text-lg" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--color-ink)]">{username}</p>
          <p className="truncate text-xs text-[var(--color-ink-3)] capitalize">
            {role || "Publik"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative rounded-md p-2 text-[var(--color-ink-3)] hover:bg-white border border-transparent hover:border-[var(--color-line)]">
            <ClientIcon icon="ph:bell-duotone" className="text-lg" />
          </button>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-white border border-[var(--color-line)] text-xs font-semibold text-[var(--color-primary)] uppercase">
            {username ? username.substring(0, 2) : "GU"}
          </div>
        </div>
      </div>
    </header>
  );
}
