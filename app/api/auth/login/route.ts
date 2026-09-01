import { NextResponse } from "next/server";

/** Baca `exp` (unix seconds) dari payload JWT tanpa verifikasi ulang — token ini
 *  sudah divalidasi backend lewat keberhasilan login, di sini cuma dipakai untuk
 *  menyamakan umur cookie dengan umur token sungguhan. */
function jwtMaxAgeSeconds(token: string): number | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf8"));
    if (typeof payload.exp !== "number") return null;
    const remaining = payload.exp - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
    const loginRes = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!loginRes.ok) {
      const err = await loginRes.json().catch(() => null);
      return NextResponse.json({ error: err?.error?.message || "Login failed" }, { status: loginRes.status });
    }

    const data = await loginRes.json();
    // Backend login response tidak menyertakan username kembali — pakai yang
    // sudah dikirim di request ini (sudah tervalidasi oleh keberhasilan login).
    const role = data.role;

    // Umur cookie HARUS ikut umur JWT sungguhan (`exp` di payload token, diatur
    // JWT_EXPIRES_IN backend — default 1 jam), bukan angka tetap yang bisa beda
    // sendiri dari itu. Sebelumnya di-hardcode 8 jam sementara token cuma valid 1
    // jam: cookie (dibaca proxy.ts) masih ada 7 jam lebih lama dari token yang
    // sudah kedaluwarsa, jadi middleware tetap meloloskan halaman tapi tiap
    // panggilan API di baliknya gagal 401 "Unauthorized" tanpa redirect ke
    // /login — pengguna kena crash, bukan diarahkan masuk ulang.
    const maxAge = jwtMaxAgeSeconds(data.access_token) ?? 60 * 60; // fallback 1 jam kalau exp tak terbaca

    // We want to return a JSON response so the client component can redirect.
    // Setting cookies on the response:
    const response = NextResponse.json({ success: true, role });

    response.cookies.set("sigap_token", data.access_token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    response.cookies.set("sigap_username", username, { httpOnly: true, sameSite: "lax", path: "/", maxAge });

    response.cookies.set("sigap_role", role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
