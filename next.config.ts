import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["node:sqlite"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
