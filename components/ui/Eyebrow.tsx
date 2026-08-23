import type { ReactNode } from "react";

export function Eyebrow({
  children,
  tone = "ink",
  className = "",
}: {
  children: ReactNode;
  tone?: "ink" | "sage" | "clay" | "gold";
  className?: string;
}) {
  const tones = {
    ink: "text-ink-3 bg-paper-2 ring-[var(--hairline)]",
    sage: "text-sage bg-sage-soft ring-sage/20",
    clay: "text-clay bg-clay-soft ring-clay/20",
    gold: "text-gold bg-gold/8 ring-gold/25",
  } as const;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] ring-1 ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
