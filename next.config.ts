import type { NextConfig } from "next";

// Gradual CSP: stricter script/connect/media directives need rendered browser QA
// for the Radio player and resumable Supabase Storage uploads.
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
] as const;

const nextConfig: NextConfig = {
  async headers() {
    const noIndexHeaders = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    // Nao aplicar noindex a imagens publicas servidas por /api/studio/photos
    // ou /api/orcamentos/photos. Outras APIs nao sao paginas indexaveis.
    const privateRoutes = [
      "/api/internal/:path*",
      "/api/quote/:path*",
      "/api/radio/:path*",
      "/dev/:path*",
    ];
    return [
      { source: "/:path*", headers: [...securityHeaders] },
      ...privateRoutes.map((source) => ({ source, headers: noIndexHeaders })),
    ];
  },
};

export default nextConfig;
