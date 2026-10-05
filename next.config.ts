import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
