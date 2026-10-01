import { createHash } from "node:crypto";
import lyrics from "@/features/radio/lyrics.generated.json";
import syncedLyrics from "@/features/radio/lyrics.synced.generated.json";
import type { GeneratedSyncedLyrics } from "@/features/radio/synced-lyrics";

const lyricsByTrack = lyrics as Record<string, string>;
const syncedLyricsByTrack = syncedLyrics as Record<string, GeneratedSyncedLyrics>;

function hashLyrics(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Track ID is required." }, { status: 400 });

  const lyricsForTrack = Object.hasOwn(lyricsByTrack, id) ? lyricsByTrack[id] : null;
  const syncedForTrack = Object.hasOwn(syncedLyricsByTrack, id) ? syncedLyricsByTrack[id] : null;
  const currentSyncedLyrics =
    lyricsForTrack && syncedForTrack?.sourceHash === hashLyrics(lyricsForTrack)
      ? syncedForTrack
      : null;

  return Response.json(
    { lyrics: lyricsForTrack, syncedLyrics: currentSyncedLyrics },
    { headers: { "Cache-Control": "no-store" } }
  );
}
