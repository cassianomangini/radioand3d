import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StudioPrintsCarousel } from "@/components/studio-radio/studio-prints-carousel";
import type { StudioPrintMedia } from "@/features/studio/prints-media";

export const metadata: Metadata = {
  title: "CM / QA de movimento (desenvolvimento)",
  robots: { index: false, follow: false }
};

// Deliberately not product imagery: test assets are pre-existing site artwork.
const fixtureMedia: StudioPrintMedia[] = [
  {
    id: "fixture-alpha",
    kind: "image",
    src: "/images/x1_fundo_2.png",
    project: "qa",
    title: "Mídia A · somente teste técnico",
    alt: "Arte de teste, não fotografia de produto"
  },
  {
    id: "fixture-beta",
    kind: "image",
    src: "/images/cm-radio-preview-art.png",
    project: "qa",
    title: "Mídia B · somente teste técnico",
    alt: "Arte de teste, não fotografia de produto"
  }
];

export default function StudioCarouselQaPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <main style={{
      minHeight: "100dvh",
      background: "#020305",
      color: "white",
      padding: "2rem",
      fontFamily: "var(--font-sans)"
    }}>
      <h1 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>
        QA: carrossel / mídia de teste, não portfólio
      </h1>
      <div style={{
        position: "relative",
        width: "min(100%, 850px)",
        height: "min(65dvh, 560px)",
        minHeight: "340px",
        overflow: "hidden",
        container: "studio / inline-size"
      }}>
        <StudioPrintsCarousel active media={fixtureMedia} />
      </div>
    </main>
  );
}
