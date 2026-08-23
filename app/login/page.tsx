"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal masuk");
      }

      const { role } = await res.json();

      // Redirect based on role
      if (role === "admin" || username === "ITSUP") {
        router.push("/admin/periode/12");
      } else if (role === "verifikator") {
        router.push("/admin/verifikasi");
      } else if (role === "petugas") {
        router.push("/petugas/tugas");
      } else {
        router.push("/");
      }
      
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm border border-[var(--color-line)] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <span className="mb-4 mx-auto grid h-12 w-12 place-items-center border border-[var(--color-line)] bg-white text-[12px] font-semibold tracking-[0.15em] text-[var(--color-primary)]">
            SGP
          </span>
          <h1 className="font-display text-2xl tracking-tight">Masuk ke SIGAP</h1>
          <p className="mt-2 text-[13px] text-[var(--color-ink-3)]">
            Sistem Informasi Penyaluran Bantuan Sosial
          </p>
        </div>

        {error && (
          <div className="mb-4 border border-red-200 bg-red-50 p-3 text-center text-[13px] text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-ink-2)]">
              Username
            </label>
            <input
              type="text"
              required
              className="border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-[14px] outline-none focus:border-[var(--color-ink)]"
              placeholder="admin / verifikator / petugas"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-ink-2)]">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              className="border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2 text-[14px] outline-none focus:border-[var(--color-ink)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 border border-[var(--color-ink)] bg-[var(--color-ink)] px-4 py-2.5 text-[13px] font-semibold tracking-wide text-white transition-colors hover:bg-black disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="mt-8 border-t border-[var(--color-line)] pt-6">
          <p className="text-[11px] uppercase tracking-wider text-[var(--color-ink-4)] text-center">
            Kredensial Demo
          </p>
          <div className="mt-4 flex flex-col gap-1 text-[12px] text-[var(--color-ink-3)]">
            <p>Admin: <span className="font-semibold text-[var(--color-ink-2)]">admin</span></p>
            <p>Verifikator: <span className="font-semibold text-[var(--color-ink-2)]">verifikator</span></p>
            <p>Petugas: <span className="font-semibold text-[var(--color-ink-2)]">petugas</span></p>
            <p className="mt-1 text-[11px]">(Sandi: password123)</p>
            <div className="mt-3 pt-3 border-t border-[var(--color-line)] border-dashed">
              <p>Superuser: <span className="font-semibold text-[var(--color-ink-2)]">ITSUP</span></p>
              <p className="mt-1 text-[11px]">(Sandi: TuhanYesus1)</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
