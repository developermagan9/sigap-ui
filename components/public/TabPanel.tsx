"use client";

import { useState } from "react";

/**
 * Tab sederhana untuk halaman publik. Isi tiap tab dirender di server dan
 * dikirim sebagai prop ReactNode, jadi komponen klien ini tidak perlu tahu
 * apa pun tentang data — cukup memilih mana yang ditampilkan.
 */
export function TabPanel({ tabs }: { tabs: { key: string; label: string; content: React.ReactNode }[] }) {
  const [aktif, setAktif] = useState(tabs[0]?.key ?? "");
  const terpilih = tabs.find((t) => t.key === aktif) ?? tabs[0];

  return (
    <>
      <div className="mb-6 flex gap-2 border-b border-[var(--color-line)]" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={aktif === t.key}
            onClick={() => setAktif(t.key)}
            className={`border-b-2 px-4 py-3 text-[13px] uppercase tracking-[0.14em] transition-colors ${
              aktif === t.key
                ? "border-[var(--color-primary)] text-[var(--color-ink)]"
                : "border-transparent text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{terpilih?.content}</div>
    </>
  );
}
