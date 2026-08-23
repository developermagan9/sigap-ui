import type { ReactNode } from "react";

/**
 * Double-Bezel (Doppelrand): kartu tidak pernah diletakkan rata di atas
 * background. Cangkang luar berperan sebagai baki, inti berada di dalamnya
 * dengan radius konsentris — terbaca seperti perangkat keras, bukan div.
 */
export function Bezel({
  children,
  className = "",
  innerClassName = "",
  tone = "default",
  size = "lg",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  tone?: "default" | "sunken" | "accent";
  size?: "lg" | "sm";
  as?: "div" | "section" | "article" | "aside";
}) {
  const shell =
    tone === "accent"
      ? "bg-sage/[0.07] ring-1 ring-sage/15"
      : tone === "sunken"
        ? "bg-paper-3/60 ring-1 ring-[var(--hairline-strong)]"
        : "bg-paper-2/70 ring-1 ring-[var(--hairline)]";

  const core = tone === "accent" ? "bg-card" : "bg-card";

  return (
    <Tag
      className={`${shell} ${size === "lg" ? "r-shell p-1.5" : "r-shell-sm p-[0.3125rem]"} lift-2 ${className}`}
    >
      <div className={`${core} ${size === "lg" ? "r-core" : "r-core-sm"} bezel-core h-full ${innerClassName}`}>
        {children}
      </div>
    </Tag>
  );
}
