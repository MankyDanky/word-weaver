import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This ignores TypeScript errors during the build process
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
