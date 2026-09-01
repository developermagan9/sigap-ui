import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Bikin `next build` menghasilkan server mandiri (`.next/standalone/server.js`)
  // + subset node_modules seperlunya — image Docker jadi ~150 MB, bukan >1 GB.
  output: "standalone",
};

export default nextConfig;
