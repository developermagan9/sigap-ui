import type { ReactNode } from "react";

export function Stat({
  label, value, sub, icon, tone = "ink", size = "md",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  tone?: "ink" | "sage" | "clay";
  size?: "md" | "lg";
}) {
  const warna = { ink: "text-ink", sage: "text-sage", clay: "text-clay" }[tone];
  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3">{label}</p>
        {icon && <span className="text-ink-4">{icon}</span>}
      </div>
      <div>
        <p className={`font-display ${size === "lg" ? "text-[2.75rem] leading-[0.95] sm:text-[3.25rem]" : "text-[2rem] leading-[1]"} tnum tracking-[-0.03em] ${warna}`}>
          {value}
        </p>
        {sub && <p className="mt-2.5 text-[13px] leading-relaxed text-ink-3">{sub}</p>}
      </div>
    </div>
  );
}
