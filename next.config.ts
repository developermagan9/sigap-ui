import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Bikin `next build` menghasilkan server mandiri (`.next/standalone/server.js`)
  // + subset node_modules seperlunya — image Docker jadi ~150 MB, bukan >1 GB.
  output: "standalone",
  // Rute lama yang dulu hanya berisi redirect: klaim sekarang ada di Cek Status,
  // panel verifikator di /admin/verifikasi.
  async redirects() {
    return [
      { source: "/klaim", destination: "/cek-status", permanent: true },
      { source: "/verifikator", destination: "/admin/verifikasi", permanent: true },
    ];
  },
};

export default nextConfig;
