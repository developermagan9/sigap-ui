import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/** Role yang boleh dipakai lewat penukar role superuser. */
const ROLE_VALID = ["admin", "verifikator", "petugas", "auditor"] as const;
type RoleValid = (typeof ROLE_VALID)[number];

/** Username akun superuser yang boleh berganti tampilan role saat demo. */
const SUPERUSER = "ITSUP";

/** Baca payload JWT tanpa verifikasi ulang — token ini httpOnly dan sudah
 *  divalidasi backend tiap request; di sini cuma dipakai untuk membaca `exp`
 *  dan memastikan pemilik sesi memang superuser. */
function payloadJwt(token: string): { exp?: number; username?: string } | null {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf8"));
  } catch {
    return null;
  }
}

/**
 * Ganti tampilan role untuk akun superuser saat demo.
 *
 * Dua hal yang diperbaiki di sini:
 *
 * 1. **Endpoint ini sebelumnya tidak memeriksa apa pun.** Siapa saja bisa
 *    POST `{ "role": "admin" }` tanpa sesi dan mendapatkan cookie `sigap_role=admin`
 *    — dan `proxy.ts` mengambil keputusan otorisasi rute murni dari cookie itu.
 *    Backend tetap menolak (role diambil dari JWT, bukan cookie), jadi tidak ada
 *    data yang bocor, tapi hasilnya halaman admin terbuka lalu error 401 di
 *    tiap pemanggilan API — pengguna melihat crash, bukan diarahkan login.
 *    Sekarang endpoint menuntut sesi yang sah DAN username superuser.
 *
 * 2. **`maxAge` cookie 8 jam sementara JWT hanya 1 jam.** Ini persis bug yang
 *    sudah diperbaiki di route login, tapi terulang di sini: setelah berganti
 *    role, cookie role hidup 7 jam lebih lama daripada tokennya. Sekarang
 *    umurnya mengikuti `exp` token yang sedang dipegang.
 */
export async function POST(request: Request) {
  try {
    const { role } = await request.json();

    if (!ROLE_VALID.includes(role as RoleValid)) {
      return NextResponse.json({ error: "Role tidak dikenal" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("sigap_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 401 });
    }

    const payload = payloadJwt(token);
    if (!payload) {
      return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
    }
    if (payload.username !== SUPERUSER) {
      return NextResponse.json(
        { error: "Hanya akun super administrator yang dapat berganti role" },
        { status: 403 },
      );
    }

    const sisaDetik =
      typeof payload.exp === "number" ? payload.exp - Math.floor(Date.now() / 1000) : 0;
    if (sisaDetik <= 0) {
      return NextResponse.json({ error: "Sesi sudah kedaluwarsa" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, role });
    response.cookies.set("sigap_role", role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: sisaDetik,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
