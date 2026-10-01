export interface SyncedLyricWord {
  text: string;
  start: number;
  end: number;
  matched: boolean;
}

export interface SyncedLyricSection {
  kind: "section";
  text: string;
  breakBefore: boolean;
}

export interface SyncedLyricTimedLine {
  kind: "line";
  text: string;
  breakBefore: boolean;
  start: number;
  end: number;
  confidence: number;
  words: SyncedLyricWord[];
}

export type SyncedLyricLine = SyncedLyricSection | SyncedLyricTimedLine;

export interface SyncedLyrics {
  version: 1;
  source: "whisperx";
  language: string | null;
  coverage: number;
  lines: SyncedLyricLine[];
}

export interface GeneratedSyncedLyrics extends SyncedLyrics {
  sourceHash: string;
  model: string;
  generatedAt: string;
}

export function getActiveLyricLineIndex(lines: SyncedLyricLine[], position: number, graceSeconds = 0.55) {
  if (!Number.isFinite(position) || position < 0) return -1;

  let active = -1;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.kind !== "line") continue;
    if (position < line.start) break;
    if (position <= line.end + graceSeconds) active = index;
  }
  return active;
}

export function getActiveLyricWordIndex(line: SyncedLyricTimedLine, position: number, graceSeconds = 0.18) {
  if (!Number.isFinite(position) || position < line.start || !line.words.length) return -1;

  let active = -1;
  for (let index = 0; index < line.words.length; index += 1) {
    const word = line.words[index];
    if (position < word.start) break;
    if (position <= word.end + graceSeconds) active = index;
  }
  return active;
}
