import type { MetadataRoute } from "next";
import { isIndexableDeployment, SITE_URL } from "@/lib/site-seo";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexableDeployment()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      // As fotos publicas do Estudio e exemplos do formulario usam URLs
      // /api/. O Google segue a correspondencia de caminho mais especifica.
      allow: ["/", "/api/studio/photos/", "/api/orcamentos/photos/"],
      disallow: ["/api/", "/dev/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
