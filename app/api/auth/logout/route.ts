import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  // Cabut token di backend (jti masuk `revoked_token`), bukan hanya menghapus cookie —
  // salinan token yang bocor/tersimpan di tempat lain ikut tidak berlaku lagi.
  // Gagal di sini (API mati, token sudah kedaluwarsa) tidak menghalangi logout lokal.
  const token = (await cookies()).get("sigap_token")?.value;
  if (token) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
    await fetch(`${apiUrl}/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
  }

  // Location relatif, bukan `new URL("/", request.url)`: di dalam container `request.url`
  // memakai HOSTNAME bind server (0.0.0.0), sehingga browser terlempar ke http://0.0.0.0:3000/.
  const response = new NextResponse(null, { status: 307, headers: { Location: "/" } });
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
