import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required by the Cloudflare adapter (OpenNext), which bundles the standalone output into a Worker.
  output: "standalone",
};

export default nextConfig;
