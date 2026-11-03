import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RadioDockPreview } from "./radio-dock-preview";

export const metadata: Metadata = {
  title: "CM Rádio — Prévia da transformação para navbar",
  description: "Laboratório isolado da Rádio lateral para o player no cabeçalho.",
  robots: { index: false, follow: false }
};

export default function RadioDockPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <RadioDockPreview />;
}
