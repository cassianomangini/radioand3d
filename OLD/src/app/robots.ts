import type { MetadataRoute } from "next";
import { absoluteSiteUrl, siteIndexable } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  if (!siteIndexable) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/"
      }
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: absoluteSiteUrl("/sitemap.xml")
  };
}
