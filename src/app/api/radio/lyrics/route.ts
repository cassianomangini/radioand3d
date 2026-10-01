import lyrics from "@/features/radio/lyrics.generated.json";

const lyricsByTrack = lyrics as Record<string, string>;

export function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Track ID is required." }, { status: 400 });

  return Response.json(
    { lyrics: Object.hasOwn(lyricsByTrack, id) ? lyricsByTrack[id] : null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
