"use client";

import type { ReactNode } from "react";

export function Field({
  label, hint, children, error, wajib,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  error?: string | null;
  wajib?: boolean;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium">
          {label}
          {wajib && <span className="ml-1 text-clay">*</span>}
        </span>
        {hint && <span className="text-[11px] text-ink-4">{hint}</span>}
      </span>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-2 text-[11px] leading-relaxed text-clay">{error}</p>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-2xl bg-paper-2 px-4 py-3 text-[14px] text-ink ring-1 ring-[var(--hairline)] " +
  "outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] " +
  "placeholder:text-ink-4 focus:bg-card focus:ring-sage/40 focus:lift-1";

export const inputErrCls =
  "w-full rounded-2xl bg-clay-soft px-4 py-3 text-[14px] text-ink ring-1 ring-clay/30 " +
  "outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]";
