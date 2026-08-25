"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "@/components/ui/Icons";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { PERIODE_AKTIF_ID } from "@/lib/constants";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        router.push(`/admin/periode/${PERIODE_AKTIF_ID}`);
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
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-sm rounded-lg border border-[var(--color-line)] bg-white p-8 shadow-sm">
        <h1 className="font-display text-[1.6rem] leading-tight tracking-[-0.02em] text-ink">
          Masuk ke SIGAP
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
          Sistem Informasi Penyaluran Bantuan Sosial.
        </p>

        {error && (
          <div className="mt-5 rounded bg-clay-soft px-3.5 py-2.5 text-center text-[13px] text-clay ring-1 ring-clay/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
          <label className="block">
            <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
              Username
            </span>
            <input
              type="text"
              required
              autoComplete="username"
              autoFocus
              className="mt-1.5 w-full rounded border border-[var(--color-line)] bg-paper-2 px-3 py-2
                text-[14px] text-ink outline-none transition-colors focus:border-[var(--color-primary)]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">
              Kata Sandi
            </span>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className="w-full rounded border border-[var(--color-line)] bg-paper-2 px-3 py-2 pr-10
                  text-[14px] text-ink outline-none transition-colors focus:border-[var(--color-primary)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-ink-3 hover:text-ink"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <LoadingButton
            type="submit"
            loading={loading}
            className="mt-2 w-full justify-center"
          >
            {loading ? "Memproses..." : "Masuk"}
          </LoadingButton>
        </form>
      </div>
    </div>
  );
}
