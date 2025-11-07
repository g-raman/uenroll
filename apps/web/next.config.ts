import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/db", "@repo/env", "@repo/ui"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactCompiler: true,
};

export default nextConfig;
