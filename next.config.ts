import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staticGenerationMaxConcurrency: 2,
  },
};

export default nextConfig;
