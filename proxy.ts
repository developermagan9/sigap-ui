import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type Role = "admin" | "verifikator" | "petugas";

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

function isAllowed(pathname: string, role: Role | undefined) {
  if (pathname.startsWith("/petugas")) {
    return role === "petugas";
  }

  if (pathname === "/verifikator") {
    return role === "admin" || role === "verifikator";
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/verifikasi") return role === "admin" || role === "verifikator";
    return role === "admin";
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
