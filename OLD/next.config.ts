import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The CI runs a production build before starting an isolated development
  // visual lab. Next dev and Next start must never share the same .next
  // Turbopack font/build artifacts on the runner.
  ...(process.env.CM_VISUAL_LAB_QA === "1" ? { distDir: ".next-visual-lab" } : {}),
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cf.shopee.com.br",
        pathname: "/file/**"
      }
    ]
  }
};

export default nextConfig;
