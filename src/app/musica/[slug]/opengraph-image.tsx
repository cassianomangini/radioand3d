import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getPublishedRadioPublication } from "@/features/radio/publications";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const publication = getPublishedRadioPublication(slug);
  if (!publication) notFound();

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, color: "#fff", background: "linear-gradient(135deg, #081322 0%, #12336c 58%, #0a111e 100%)" }}>
      <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: 6, color: "#70e5f5" }}>CM RÁDIO</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", fontSize: publication.title.length > 34 ? 66 : 82, fontWeight: 700, lineHeight: 1.06, overflowWrap: "break-word" }}>{publication.title}</div>
        <div style={{ display: "flex", fontSize: 32, color: "#c7d9e9" }}>{publication.artist}</div>
      </div>
      <div style={{ display: "flex", fontSize: 22, letterSpacing: 2, color: "#9bc5da" }}>CM 3D & RADIO · OUVIR NA HOME</div>
    </div>,
    size
  );
}
