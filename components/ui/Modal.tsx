"use client";

import { useEffect, type ReactNode } from "react";
import { Cross } from "./Icons";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-ink)]/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
      <button
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Tutup dialog"
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md rounded-t-xl border border-[var(--color-line)] bg-[var(--color-card)] p-6 shadow-xl sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[1.15rem] leading-tight text-[var(--color-ink)]">{title}</h3>
            {description && (
              <p className="mt-2 text-[13px] leading-6 text-[var(--color-ink-3)]">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-[var(--color-ink-3)] transition-colors hover:bg-[var(--color-paper-2)] hover:text-[var(--color-ink)]"
            aria-label="Tutup"
          >
            <Cross className="h-4 w-4" />
          </button>
        </div>
        {children}
        {footer && (
          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">{footer}</div>
        )}
      </div>
    </div>
  );
}
