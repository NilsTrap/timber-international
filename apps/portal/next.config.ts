import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Important for monorepo: transpile workspace packages
  transpilePackages: [
    "@timber/ui",
    "@timber/database",
    "@timber/auth",
    "@timber/config",
    "@timber/utils",
  ],
};

export default nextConfig;
