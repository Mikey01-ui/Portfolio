import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/camera",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/camera",
  },
  experimental: {
    staticGenerationMaxConcurrency: 2,
  },
};

export default nextConfig;
