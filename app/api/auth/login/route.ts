import { NextResponse } from "next/server";

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

    // We want to return a JSON response so the client component can redirect.
    // Setting cookies on the response:
    const response = NextResponse.json({ success: true, role });

    response.cookies.set("sigap_token", data.access_token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    response.cookies.set("sigap_username", username, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });

    response.cookies.set("sigap_role", role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
