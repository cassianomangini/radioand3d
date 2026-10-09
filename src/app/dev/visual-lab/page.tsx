import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VisualLabClient } from "./visual-lab-client";

export const metadata: Metadata = {
  title: "CM — Laboratório visual (desenvolvimento)",
  description: "Estudos de composição sem publicação comercial.",
  robots: { index: false, follow: false }
};

export default function VisualLabPage() {
  // Laboratory routes are deliberately unavailable on production or Vercel preview.
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <VisualLabClient />;
}
