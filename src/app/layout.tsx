import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { connection } from "next/server";
import { getRadioTracks } from "@/features/radio/catalog";
import { RadioProvider } from "@/features/radio/radio-provider";
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
  title: "CM 3D & Radio | Estúdio de Impressão 3D",
  description:
    "Estúdio de Impressão 3D e CM Rádio em uma experiência integrada.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();
  const tracks = await getRadioTracks();

  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${plexMono.variable}`}>
        <RadioProvider tracks={tracks}>{children}</RadioProvider>
      </body>
    </html>
  );
}
