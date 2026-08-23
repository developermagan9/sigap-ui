"use client";

export function LogoutButton() {
  return (
    <a
      href="/api/auth/logout"
      className="mt-2 block w-full text-center rounded-sm border border-[var(--color-line)] bg-white py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-white transition-colors"
    >
      Keluar
    </a>
  );
}
