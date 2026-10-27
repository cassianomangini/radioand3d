import { randomInt } from "node:crypto";
import type { Metadata, Viewport } from "next";
import { Manrope, Outfit } from "next/font/google";
import { connection } from "next/server";
import { SiteShell } from "@/components/site-shell";
import { getRadioTracks } from "@/features/radio/catalog";
import { RadioProvider } from "@/features/radio/radio-provider";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-outfit",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-manrope",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "CM 3D & Rádio",
  description: "Estúdio de impressão 3D e rádio de músicas autorais.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  const tracks = await getRadioTracks().catch(() => []);
  const playlistSeed = randomInt(0, 4294967296);

  return (
    <html lang="pt-BR" className={`${outfit.variable} ${manrope.variable}`}>
      <body>
        <RadioProvider tracks={tracks} playlistSeed={playlistSeed}>
          <SiteShell>{children}</SiteShell>
        </RadioProvider>
      </body>
    </html>
  );
}
