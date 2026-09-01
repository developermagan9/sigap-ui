import { NextResponse } from "next/server";

/**
 * Health check untuk Docker healthcheck + smoke test Jenkins.
 *
 * SENGAJA tidak memanggil API backend: tujuannya cuma memastikan proses server
 * Next hidup dan bisa melayani request. Kalau di sini ikut menembak backend,
 * healthcheck jadi merah setiap kali API sedang restart / belum siap — padahal
 * FE-nya sendiri baik-baik saja.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", service: "sigap-ui" });
}
