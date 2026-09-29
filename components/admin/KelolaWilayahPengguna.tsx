"use client";

import { useState, useTransition } from "react";
import { Field, inputCls } from "@/components/form/Field";
import { Button } from "@/components/ui/Button";
import { Cross } from "@/components/ui/Icons";
import {
  buatPengguna,
  hapusWilayahPengguna,
  resetPasswordPengguna,
  tambahWilayahPengguna,
  ubahPengguna,
} from "@/lib/actions";
import type { PenggunaRow, WilayahRow } from "@/lib/api";
import { waktu } from "@/lib/format";

const labelWilayah = (w: { desa: string; kecamatan: string }) => `${w.desa}, ${w.kecamatan}`;

const ROLE: { value: PenggunaRow["role"]; label: string }[] = [
  { value: "petugas", label: "Petugas pendataan" },
  { value: "verifikator", label: "Verifikator" },
  { value: "auditor", label: "Auditor (baca saja)" },
  { value: "admin", label: "Admin" },
];
/** Harus sama dengan ROLE_BERWILAYAH di users.service.ts. */
const butuhWilayah = (role: string) => role === "petugas" || role === "verifikator";

/** Form akun baru. Wilayah utama wajib untuk petugas & verifikator — tanpa itu
 *  scoping wilayah membuat mereka tidak melihat data apa pun. */
export function FormPenggunaBaru({ semuaWilayah }: { semuaWilayah: WilayahRow[] }) {
  const kosong = { username: "", nama: "", role: "petugas" as PenggunaRow["role"], password: "", wilayah_id: "" };
  const [data, setData] = useState(kosong);
  const [galat, setGalat] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);
  const [memproses, mulai] = useTransition();

  const kirim = (e: React.FormEvent) => {
    e.preventDefault();
    setGalat(null);
    setSukses(null);
    mulai(async () => {
      try {
        const u = await buatPengguna({
          username: data.username.trim(),
          nama: data.nama.trim(),
          role: data.role,
          password: data.password,
          wilayah_id: butuhWilayah(data.role) || data.role === "auditor" ? data.wilayah_id || undefined : undefined,
        });
        setSukses(`Akun ${u.username} dibuat.`);
        setData(kosong);
      } catch (err) {
        setGalat(err instanceof Error ? err.message : "Gagal membuat akun.");
      }
    });
  };

  return (
    <form onSubmit={kirim} className="rule-card p-5 sm:p-6" aria-label="Tambah pengguna">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">Tambah pengguna</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Username" wajib>
          <input className={inputCls} value={data.username} onChange={(e) => setData({ ...data, username: e.target.value })} autoComplete="off" />
        </Field>
        <Field label="Nama" wajib>
          <input className={inputCls} value={data.nama} onChange={(e) => setData({ ...data, nama: e.target.value })} />
        </Field>
        <Field label="Role" wajib>
          <select className={inputCls} value={data.role} onChange={(e) => setData({ ...data, role: e.target.value as PenggunaRow["role"] })}>
            {ROLE.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Wilayah utama" wajib={butuhWilayah(data.role)}>
          <select
            className={inputCls}
            value={data.wilayah_id}
            disabled={data.role === "admin"}
            onChange={(e) => setData({ ...data, wilayah_id: e.target.value })}
          >
            <option value="">{data.role === "admin" ? "Seluruh wilayah" : "Pilih wilayah…"}</option>
            {semuaWilayah.map((w) => (
              <option key={w.id} value={w.id}>{labelWilayah(w)}</option>
            ))}
          </select>
        </Field>
        <Field label="Password awal" hint="min. 8 karakter" wajib>
          <input type="password" className={inputCls} value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} autoComplete="new-password" />
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={memproses || !data.username || !data.nama || data.password.length < 8 || (butuhWilayah(data.role) && !data.wilayah_id)}>
          {memproses ? "Menyimpan…" : "Buat akun"}
        </Button>
        {sukses && <p className="text-[12px] text-[var(--color-primary)]">{sukses}</p>}
        {galat && <p className="text-[12px] text-[var(--color-alert)]">{galat}</p>}
      </div>
    </form>
  );
}

/** Ubah role / wilayah utama / status aktif, dan reset password. */
function PengaturanAkun({ user, semuaWilayah }: { user: PenggunaRow; semuaWilayah: WilayahRow[] }) {
  const [role, setRole] = useState(user.role);
  const [wilayahId, setWilayahId] = useState(user.wilayah?.id ?? "");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const [memproses, mulai] = useTransition();

  const jalankan = (aksi: () => Promise<unknown>, ok: string) => {
    setPesan(null);
    mulai(async () => {
      try {
        await aksi();
        setPesan({ ok: true, teks: ok });
      } catch (e) {
        setPesan({ ok: false, teks: e instanceof Error ? e.message : "Aksi gagal." });
      }
    });
  };

  const berubah = role !== user.role || wilayahId !== (user.wilayah?.id ?? "");

  return (
    <div className="mt-4 grid gap-4 border-t border-[var(--color-line)] pt-4 lg:grid-cols-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="text-[11px] text-[var(--color-ink-3)]">Role</span>
          <select aria-label={`Role ${user.username}`} className={`${inputCls} mt-1`} value={role} onChange={(e) => setRole(e.target.value as PenggunaRow["role"])}>
            {ROLE.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>
        <label className="flex-1">
          <span className="text-[11px] text-[var(--color-ink-3)]">Wilayah utama</span>
          <select
            aria-label={`Wilayah utama ${user.username}`}
            className={`${inputCls} mt-1`}
            value={role === "admin" ? "" : wilayahId}
            disabled={role === "admin"}
            onChange={(e) => setWilayahId(e.target.value)}
          >
            <option value="">{role === "admin" ? "Seluruh wilayah" : "—"}</option>
            {semuaWilayah.map((w) => (
              <option key={w.id} value={w.id}>{labelWilayah(w)}</option>
            ))}
          </select>
        </label>
        <Button
          variant="ghost"
          disabled={!berubah || memproses || (butuhWilayah(role) && !wilayahId)}
          onClick={() => jalankan(() => ubahPengguna(user.id, { role, wilayah_id: role === "admin" ? null : wilayahId || null }), "Perubahan disimpan.")}
        >
          Simpan
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="text-[11px] text-[var(--color-ink-3)]">Password baru</span>
          <input
            type="password"
            aria-label={`Password baru ${user.username}`}
            className={`${inputCls} mt-1`}
            value={passwordBaru}
            onChange={(e) => setPasswordBaru(e.target.value)}
            placeholder="min. 8 karakter"
            autoComplete="new-password"
          />
        </label>
        <Button
          variant="ghost"
          disabled={passwordBaru.length < 8 || memproses}
          onClick={() =>
            jalankan(async () => {
              await resetPasswordPengguna(user.id, passwordBaru);
              setPasswordBaru("");
            }, "Password direset; sesi lama pengguna ini dicabut.")
          }
        >
          Reset password
        </Button>
        <Button
          variant="ghost"
          disabled={memproses}
          onClick={() =>
            jalankan(
              () => ubahPengguna(user.id, { is_active: !user.isActive }),
              user.isActive ? "Akun dinonaktifkan; sesi aktifnya dicabut." : "Akun diaktifkan kembali.",
            )
          }
        >
          {user.isActive ? "Nonaktifkan" : "Aktifkan"}
        </Button>
      </div>

      {pesan && (
        <p className={`text-[12px] lg:col-span-2 ${pesan.ok ? "text-[var(--color-primary)]" : "text-[var(--color-alert)]"}`}>{pesan.teks}</p>
      )}
    </div>
  );
}

/** Satu kartu user: wilayah utama (tetap) + chip wilayah tambahan yang bisa dicabut. */
function KartuPengguna({ user, semuaWilayah }: { user: PenggunaRow; semuaWilayah: WilayahRow[] }) {
  const [pilihan, setPilihan] = useState("");
  const [atur, setAtur] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [memproses, mulai] = useTransition();

  const dimiliki = new Set([user.wilayah?.id, ...user.wilayah_tambahan.map((w) => w.id)]);
  const tersedia = semuaWilayah.filter((w) => !dimiliki.has(w.id));

  const jalankan = (aksi: () => Promise<unknown>) => {
    setGalat(null);
    mulai(async () => {
      try {
        await aksi();
        setPilihan("");
      } catch (e) {
        setGalat(e instanceof Error ? e.message : "Aksi gagal.");
      }
    });
  };

  return (
    <li className="rule-card p-5" data-testid={`pengguna-${user.username}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-[14px] font-medium text-[var(--color-ink)]">{user.nama}</p>
          <p className="font-mono text-[12px] text-[var(--color-ink-3)]">
            {user.username} · {user.role}
            {!user.isActive && " · nonaktif"}
          </p>
          <p className="mt-1 text-[11px] text-[var(--color-ink-4)]">
            Login terakhir: {user.lastLoginAt ? waktu(user.lastLoginAt) : "belum pernah"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-[12px] text-[var(--color-ink-3)]">
            Wilayah utama:{" "}
            <span className="text-[var(--color-ink-2)]">
              {user.role === "admin" ? "seluruh wilayah" : user.wilayah ? labelWilayah(user.wilayah) : "—"}
            </span>
          </p>
          <button
            type="button"
            onClick={() => setAtur((v) => !v)}
            className="text-[12px] text-[var(--color-ink-2)] underline underline-offset-2 hover:text-[var(--color-ink)]"
          >
            {atur ? "Tutup pengaturan akun" : "Atur akun"}
          </button>
        </div>
      </div>

      {atur && <PengaturanAkun user={user} semuaWilayah={semuaWilayah} />}

      {user.role !== "admin" && (
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {user.wilayah_tambahan.length === 0 && (
          <span className="text-[12px] text-[var(--color-ink-4)]">Belum ada wilayah tambahan.</span>
        )}
        {user.wilayah_tambahan.map((w) => (
          <span
            key={w.id}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-paper-2)] py-1 pl-3 pr-1 text-[12px] text-[var(--color-ink-2)] ring-1 ring-[var(--color-line)]"
          >
            {labelWilayah(w)}
            <button
              type="button"
              aria-label={`Cabut akses ${w.desa}`}
              disabled={memproses}
              onClick={() => jalankan(() => hapusWilayahPengguna(user.id, w.id))}
              className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--color-ink-3)] hover:bg-[var(--color-line)] disabled:opacity-40"
            >
              <Cross className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      )}

      {user.role !== "admin" && tersedia.length > 0 && (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (pilihan) jalankan(() => tambahWilayahPengguna(user.id, pilihan));
          }}
        >
          <select
            aria-label={`Tambah wilayah untuk ${user.username}`}
            className={`${inputCls} sm:max-w-sm`}
            value={pilihan}
            onChange={(e) => setPilihan(e.target.value)}
          >
            <option value="">Pilih wilayah kerja…</option>
            {tersedia.map((w) => (
              <option key={w.id} value={w.id}>
                {labelWilayah(w)} — {w.kabupaten}
              </option>
            ))}
          </select>
          <Button type="submit" variant="ghost" disabled={!pilihan || memproses}>
            {memproses ? "Menyimpan…" : "Tambah akses"}
          </Button>
        </form>
      )}

      {galat && <p className="mt-3 text-[12px] leading-6 text-[var(--color-alert)]">{galat}</p>}
    </li>
  );
}

export function KelolaWilayahPengguna({ users, semuaWilayah }: { users: PenggunaRow[]; semuaWilayah: WilayahRow[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {users.map((u) => (
        <KartuPengguna key={u.id} user={u} semuaWilayah={semuaWilayah} />
      ))}
    </ul>
  );
}
