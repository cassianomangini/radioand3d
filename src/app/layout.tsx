import { randomInt } from "node:crypto";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { connection } from "next/server";
import { SiteShell } from "@/components/site-shell";
import { isIndexableDeployment, SITE_URL } from "@/lib/site-seo";
import { getRadioTracks } from "@/features/radio/catalog";
import { RadioProvider } from "@/features/radio/radio-provider";
import "./globals.css";

const outfit = localFont({
  src: "./fonts/outfit-latin.woff2",
  weight: "400 800",
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = localFont({
  src: "./fonts/dm-sans-latin.woff2",
  weight: "400 800",
  variable: "--font-dm-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "CMangini3D",
  description: "CMangini3D: caixas sob medida, placas personalizadas e impressão 3D por encomenda. Estúdio em São Caetano do Sul, com envio para todo o Brasil.",
  robots: {
    index: isIndexableDeployment(),
    follow: isIndexableDeployment(),
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  const tracks = await getRadioTracks().catch(() => []);
  const playlistSeed = randomInt(0, 4294967296);

  return (
    <html lang="pt-BR" className={`${outfit.variable} ${dmSans.variable}`}>
      <body>
        <RadioProvider tracks={tracks} playlistSeed={playlistSeed}>
          <SiteShell>{children}</SiteShell>
        </RadioProvider>
      </body>
    </html>
  );
}
