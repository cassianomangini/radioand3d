import { randomInt } from "node:crypto";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { connection } from "next/server";
import { getRadioTracks } from "@/features/radio/catalog";
import { RadioProvider } from "@/features/radio/radio-provider";
import { PublicExperience } from "@/components/studio-radio/public-experience";
import { siteIndexable, siteUrl } from "@/lib/site-config";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono"
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-outfit"
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-plus-jakarta"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export const metadata: Metadata = {
  metadataBase: siteUrl ?? undefined,
  title: {
    default: "CM 3D & Radio | Estúdio de Impressão 3D",
    template: "%s | CM 3D & Radio"
  },
  description:
    "Estúdio de Impressão 3D e CM Rádio em uma experiência integrada.",
  robots: {
    index: siteIndexable,
    follow: siteIndexable
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  const tracks = await getRadioTracks();
  const playlistSeed = randomInt(0, 4294967296);
  const websiteSchema =
    siteIndexable && siteUrl
      ? {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "CM 3D & Radio",
          url: siteUrl.toString(),
          inLanguage: "pt-BR",
          description:
            "Estúdio de Impressão 3D e CM Rádio em uma experiência integrada."
        }
      : null;

  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${plexMono.variable} ${outfit.variable} ${jakarta.variable}`}>
        <RadioProvider tracks={tracks} playlistSeed={playlistSeed}>
          <PublicExperience>{children}</PublicExperience>
        </RadioProvider>
        {websiteSchema ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />
        ) : null}
      </body>
    </html>
  );
}
