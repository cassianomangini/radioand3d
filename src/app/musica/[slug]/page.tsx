import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPublishedRadioPublication } from "@/features/radio/publications";
import { buildPublicMetadata, siteUrl } from "@/lib/site-config";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const publication = getPublishedRadioPublication(slug);
  if (!publication) notFound();
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0];
  const protocol = forwardedProtocol === "http" || forwardedProtocol === "https"
    ? forwardedProtocol
    : host?.startsWith("localhost") ? "http" : "https";
  const baseUrl = siteUrl ?? (host ? new URL(`${protocol}://${host}`) : undefined);
  return buildPublicMetadata({
    title: `${publication.title} — CM Rádio`,
    description: `Ouça ${publication.title}, de ${publication.artist}, na CM Rádio e conheça o Estúdio 3D.`,
    pathname: `/musica/${slug}`,
    baseUrl,
    image: {
      url: `/musica/${slug}/opengraph-image`,
      alt: `${publication.title} — ${publication.artist} na CM Rádio`,
      width: 1200,
      height: 630
    }
  });
}

export default async function SharedMusicPage({ params }: Props) {
  const { slug } = await params;
  if (!getPublishedRadioPublication(slug)) notFound();
  return null;
}
