import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getPublishedRadioPublication } from "@/features/radio/publications";

export const alt = "Música na CM Rádio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const publication = getPublishedRadioPublication(slug);
  if (!publication) notFound();

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, color: "#ffffff", background: "linear-gradient(135deg, #05070b 0%, #10161f 58%, #080a13 100%)" }}>
      <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: 6, color: "#52d6ff" }}>CM RÁDIO</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", fontSize: publication.title.length > 34 ? 66 : 82, fontWeight: 700, lineHeight: 1.06, overflowWrap: "break-word" }}>{publication.title}</div>
        <div style={{ display: "flex", fontSize: 32, color: "#eaebec" }}>{publication.artist}</div>
      </div>
      <div style={{ display: "flex", fontSize: 22, letterSpacing: 2, color: "#adbac9" }}>CM 3D & RÁDIO · OUVIR NA HOME</div>
    </div>,
    size
  );
}
