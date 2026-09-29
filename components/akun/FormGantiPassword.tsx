"use client";

import { useState, useTransition } from "react";
import { Field, inputCls } from "@/components/form/Field";
import { Button } from "@/components/ui/Button";
import { gantiPassword } from "@/lib/actions";

/** Ganti password sendiri. Backend mencabut semua sesi lama, jadi setelah sukses
 *  pengguna diarahkan ke halaman login untuk masuk dengan password baru. */
export function FormGantiPassword() {
  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [ulang, setUlang] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [memproses, mulai] = useTransition();

  const kirim = (e: React.FormEvent) => {
    e.preventDefault();
    setGalat(null);
    if (baru.length < 8) return setGalat("Password baru minimal 8 karakter.");
    if (baru !== ulang) return setGalat("Konfirmasi password tidak sama.");
    mulai(async () => {
      try {
        await gantiPassword(lama, baru);
        window.location.href = "/login?pesan=password-diganti";
      } catch (err) {
        setGalat(err instanceof Error ? err.message : "Gagal mengganti password.");
      }
    });
  };

  return (
    <form onSubmit={kirim} className="rule-card flex max-w-md flex-col gap-4 p-6" aria-label="Ganti password">
      <Field label="Password lama" wajib>
        <input type="password" className={inputCls} value={lama} onChange={(e) => setLama(e.target.value)} autoComplete="current-password" />
      </Field>
      <Field label="Password baru" hint="min. 8 karakter" wajib>
        <input type="password" className={inputCls} value={baru} onChange={(e) => setBaru(e.target.value)} autoComplete="new-password" />
      </Field>
      <Field label="Ulangi password baru" wajib>
        <input type="password" className={inputCls} value={ulang} onChange={(e) => setUlang(e.target.value)} autoComplete="new-password" />
      </Field>
      {galat && <p className="text-[12px] text-[var(--color-alert)]">{galat}</p>}
      <div>
        <Button type="submit" disabled={memproses || !lama || !baru || !ulang}>
          {memproses ? "Menyimpan…" : "Ganti password"}
        </Button>
      </div>
      <p className="text-[12px] leading-6 text-[var(--color-ink-3)]">
        Setelah diganti, semua sesi akun ini (termasuk di perangkat lain) berakhir dan Anda perlu masuk lagi.
      </p>
    </form>
  );
}
