import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  /** Boleh ReactNode supaya deskripsi bisa memuat tautan (mis. ke detail program). */
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        {eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink-3">{eyebrow}</p>
        )}
        <h1 className={`font-display text-2xl text-ink sm:text-3xl ${eyebrow ? "mt-2" : ""}`}>
          {title}
        </h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-ink-3">{description}</p> : null}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
