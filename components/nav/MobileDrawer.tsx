"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand/BrandMark";
import { ClientIcon } from "./ClientIcon";
import { NavList } from "./NavList";
import { NavAccount } from "./NavAccount";
import { menuFor } from "./menu";

/**
 * Menu penuh untuk layar di bawah `lg`, tempat Sidebar disembunyikan.
 * Bottom-bar hanya memuat 3–4 tujuan utama, jadi tanpa drawer ini sebagian
 * besar halaman admin tidak bisa dicapai dari ponsel maupun tablet potret.
 */
export function MobileDrawer({
  open,
  onClose,
  role,
  isSuper,
}: {
  open: boolean;
  onClose: () => void;
  role: string;
  isSuper: boolean;
}) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Tutup saat rute berganti — mis. ketika navigasi datang dari tempat lain
  // (bottom-bar, tombol di dalam halaman) selagi drawer masih terbuka.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Kunci scroll latar supaya jempol tidak menggeser halaman di belakang panel.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  return (
    // `inert` saat tertutup: tanpa ini panel yang tergeser ke luar layar tetap
    // ikut urutan tab, jadi keyboard bisa nyasar ke menu yang tak terlihat.
    <div className="lg:hidden" inert={!open}>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-[rgba(15,23,42,0.4)] transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        tabIndex={-1}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] flex-col border-r border-[var(--color-line)]
          bg-[var(--color-paper)] pb-[env(safe-area-inset-bottom)] text-[var(--color-ink)] shadow-xl outline-none
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between gap-2 px-4 pb-4 pt-4">
          <BrandMark height={44} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-transparent text-[var(--color-ink-3)] transition-colors hover:border-[var(--color-line)] hover:bg-white"
          >
            <ClientIcon icon="ph:x-duotone" className="text-lg" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4">
          <NavList items={menuFor(role)} pathname={pathname} onNavigate={onClose} />
        </div>

        <div className="mt-auto border-t border-[var(--color-line)] px-4 pb-4 pt-4">
          <NavAccount role={role || "public"} isSuper={isSuper} />
        </div>
      </div>
    </div>
  );
}
