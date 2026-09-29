import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  // Cabut token di backend (tokenVersion naik), bukan hanya menghapus cookie —
  // salinan token yang bocor/tersimpan di tempat lain ikut tidak berlaku lagi.
  // Gagal di sini (API mati, token sudah kedaluwarsa) tidak menghalangi logout lokal.
  const token = (await cookies()).get("sigap_token")?.value;
  if (token) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
    await fetch(`${apiUrl}/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set("sigap_username", "", { httpOnly: true, sameSite: "lax", path: "/", expires: new Date(0) });
  response.cookies.set("sigap_role", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  response.cookies.set("sigap_token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  return response;
}
