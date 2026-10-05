import type { Metadata } from "next";

const rawSiteUrl =
  process.env.SITE_URL?.trim() ??
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ??
  "";

function parseSiteUrl(value: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return new URL(url.origin);
  } catch {
    return null;
  }
}

export const siteUrl = parseSiteUrl(rawSiteUrl);

export const siteIndexable =
  Boolean(siteUrl) &&
  (process.env.SITE_INDEXABLE === "true" ||
    process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true");

export function absoluteSiteUrl(pathname: string) {
  if (!siteUrl) return undefined;
  return new URL(pathname, siteUrl).toString();
}

export function buildPublicMetadata({
  title,
  description,
  pathname
}: {
  title: string;
  description: string;
  pathname: string;
}): Metadata {
  const canonical = absoluteSiteUrl(pathname);

  return {
    title,
    description,
    robots: {
      index: siteIndexable,
      follow: siteIndexable
    },
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "pt_BR",
      siteName: "CM 3D & Radio",
      url: canonical
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}
