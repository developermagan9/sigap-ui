import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type Role = "admin" | "verifikator" | "petugas" | "auditor";

const PUBLIC_PATHS = [
  "/",
  "/cek-status",
  "/klaim",
  "/metodologi",
  "/transaksi",
  "/login"
];

const PUBLIC_PREFIXES = [
  "/program/",
  "/api/auth/",
  "/_next",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Rute /admin yang boleh diakses role selain admin. Harus konsisten dengan
 *  guard backend DAN dengan menu di `components/nav/Sidebar.tsx` — menu yang
 *  ditampilkan tapi diblokir middleware akan terasa seperti sesi kedaluwarsa. */
const IZIN_ADMIN_TAMBAHAN: Record<string, Role[]> = {
  // Backend: @Roles('verifikator','admin') di rumah-tangga.controller.ts
  "/admin/verifikasi": ["verifikator"],
  // Backend: @Roles('verifikator','admin') di sanggahan.controller.ts — sebelumnya
  // diblokir di sini padahal "Sanggahan Data" ada di menu sidebar verifikator,
  // jadi mengkliknya melempar verifikator ke /login tanpa penjelasan.
  "/admin/sanggahan": ["verifikator"],
  // Backend: @Roles('admin','auditor') di audit.controller.ts. Role `auditor`
  // ada di seed & enum sejak awal tapi tidak pernah punya satu rute pun.
  "/admin/audit-log": ["auditor"],
};

function isAllowed(pathname: string, role: Role | undefined) {
  if (pathname.startsWith("/petugas")) {
    return role === "petugas";
  }

  if (pathname === "/verifikator") {
    return role === "admin" || role === "verifikator";
  }

  if (pathname.startsWith("/admin")) {
    if (role === "admin") return true;
    const tambahan = IZIN_ADMIN_TAMBAHAN[pathname];
    return !!role && !!tambahan && tambahan.includes(role);
  }

  return true;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const role = request.cookies.get("sigap_role")?.value as Role | undefined;

  if (isAllowed(pathname, role)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|favicon.ico).*)"],
};
