"use client";

import type { ReactNode } from "react";
import { Loader } from "./Loader";
import { Modal } from "./Modal";

/** Dialog konfirmasi untuk aksi krusial (approve/reject, kunci on-chain, kirim ke verifikator, dst).
 *  `loading` mengunci kedua tombol supaya aksi tidak terkirim dua kali. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  children,
  tone = "primary",
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  tone?: "primary" | "danger";
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-[6px] border border-[var(--color-line)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper-2)] disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center justify-center gap-2 rounded-[6px] px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60 ${
              tone === "danger"
                ? "bg-[var(--color-danger-strong)] hover:bg-[#b91c1c]"
                : "bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)]"
            }`}
          >
            {loading && <Loader size="sm" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
