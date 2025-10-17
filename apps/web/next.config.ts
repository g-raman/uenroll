import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/db", "@repo/env", "@repo/ui"],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: config => {
    // Enable async WebAssembly
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    // Handle .wasm files correctly
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    return config;
  },
};

export default nextConfig;
