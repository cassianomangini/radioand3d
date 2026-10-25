import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import manifest from "@/features/studio/prints-media.json";

export const runtime = "nodejs";

const mediaById = new Map(manifest.items.map((item) => [item.id, item]));
let r2Client: S3Client | null = null;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const media = mediaById.get(id);
  if (!media) return new Response(null, { status: 404 });

  const endpoint = process.env.R2_S3_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    return new Response(null, { status: 503 });
  }

  r2Client ??= new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey }
  });

  try {
    const object = await r2Client.send(new GetObjectCommand({
      Bucket: "carrossel",
      Key: media.r2Key
    }));
    if (!object.Body) return new Response(null, { status: 502 });
    const extension = media.r2Key.split(".").pop()?.toLowerCase();
    const contentType = extension === "png" ? "image/png"
      : extension === "webp" ? "image/webp"
      : extension === "avif" ? "image/avif"
      : "image/jpeg";

    return new Response(object.Body.transformToWebStream(), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        ...(object.ContentLength ? { "Content-Length": String(object.ContentLength) } : {})
      }
    });
  } catch (error) {
    if (error instanceof Error && error.name === "NoSuchKey") {
      return new Response(null, { status: 404 });
    }
    return new Response(null, { status: 502 });
  }
}
