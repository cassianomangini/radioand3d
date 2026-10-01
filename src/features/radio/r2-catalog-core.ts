import type { RadioTrack } from "./radio-provider";

interface ObjectPage {
  Contents?: { Key?: string }[];
  IsTruncated?: boolean;
  NextContinuationToken?: string;
}

const audioExtensions = new Set(["mp3", "m4a", "wav", "aac", "ogg", "opus", "flac"]);

export async function collectAudioKeys(
  listPage: (continuationToken?: string) => Promise<ObjectPage>
): Promise<string[]> {
  const keys = new Set<string>();
  const seenTokens = new Set<string>();
  let continuationToken: string | undefined;

  do {
    const page = await listPage(continuationToken);
    for (const object of page.Contents ?? []) {
      const key = object.Key;
      if (key && audioExtensions.has(key.split(".").at(-1)?.toLowerCase() ?? "")) {
        keys.add(key);
      }
    }

    if (!page.IsTruncated) break;
    const nextToken = page.NextContinuationToken;
    if (!nextToken || seenTokens.has(nextToken)) {
      throw new Error("R2 returned an incomplete or repeated object-list page.");
    }
    seenTokens.add(nextToken);
    continuationToken = nextToken;
  } while (true);

  return [...keys].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function radioTrackFromKey(key: string, publicBaseUrl: string): RadioTrack {
  const filename = key.split("/").at(-1) ?? key;
  const title = filename.replace(/\.[^.]+$/, "").replace(/^CMangic\s+-\s+/i, "");
  const encodedKey = key.split("/").map((segment) => encodeURIComponent(segment)).join("/");

  return {
    id: key,
    title,
    artist: "CMangic",
    src: `${publicBaseUrl.replace(/\/+$/, "")}/${encodedKey}`
  };
}
