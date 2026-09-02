import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "./Icons";

type Props = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "ghost" | "quiet";
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

/**
 * CTA "island": pil penuh dengan ikon yang bersarang di lingkarannya sendiri,
 * rata dengan padding kanan. Hover memicu ketegangan kinetik di dalam tombol
 * (ikon bergeser diagonal + membesar), bukan sekadar ganti warna.
 */
export function Button({
  children, href, variant = "primary", icon, className = "", onClick, type = "button", disabled,
}: Props) {
  const dasar =
    "group relative inline-flex items-center gap-3 rounded-[6px] px-4 py-3 text-sm font-medium " +
    "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] " +
    "disabled:opacity-40 disabled:pointer-events-none";

  const gaya = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[#092f68]",
    ghost: "border border-[var(--color-line)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]",
    quiet: "bg-transparent px-0 text-[var(--color-ink-2)] hover:text-[var(--color-ink)]",
  }[variant];

  const bulatan = {
    primary: "bg-white/12 text-white",
    ghost: "bg-[var(--color-paper-2)] text-[var(--color-ink)]",
    quiet: "bg-[var(--color-paper-2)] text-[var(--color-ink)]",
  }[variant];

  const isi = (
    <>
      <span className="relative z-10 whitespace-nowrap">{children}</span>
      <span
        className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] ${bulatan}
          transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5`}
      >
        {icon ?? <ArrowUpRight className="h-[15px] w-[15px]" />}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${dasar} ${gaya} ${className}`}>
        {isi}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${dasar} ${gaya} ${className}`}>
      {isi}
    </button>
  );
}
