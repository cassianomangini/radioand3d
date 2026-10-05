import { randomInt } from "node:crypto";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
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

  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${plexMono.variable}`}>
        <RadioProvider tracks={tracks} playlistSeed={playlistSeed}>
          <PublicExperience>{children}</PublicExperience>
        </RadioProvider>
      </body>
    </html>
  );
}
