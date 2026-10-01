import { closeSync, openSync, readFileSync, readSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const [audioDirectory, lyricsDirectory] = process.argv.slice(2);

if (!audioDirectory || !lyricsDirectory) {
  throw new Error("Usage: node scripts/import-radio-lyrics.mjs <audio-directory> <lyrics-directory>");
}

const manifest = JSON.parse(readFileSync(join(audioDirectory, "_CMangic-rename-manifest-2026-09-30.json"), "utf8"));
const renamed = new Map(manifest.items.map(({ old, new: current }) => [old, current]));
const audioNames = new Set(readdirSync(audioDirectory).filter((name) => /\.(?:mp3|m4a|wav|aac|ogg|opus|flac)$/i.test(name)));
const lyrics = {};
const lyricsBySunoId = new Map();
const matchedTextFiles = new Set();
const textFiles = readdirSync(lyricsDirectory).filter((name) => name.toLowerCase().endsWith(".txt")).sort();

function cleanLyrics(value) {
  const lines = value.replace(/\r\n?/g, "\n").replace(/\0+$/g, "").split("\n");
  while (lines.length > 0 && (!lines[0].trim() || /^lyrics(?:\s*[—–-]\s*.+)?$/i.test(lines[0].trim()))) lines.shift();
  return lines.join("\n").trim().replace(/^\uFEFF/, "").trim();
}

function syncSafeNumber(bytes, offset) {
  return (bytes[offset] & 0x7f) * 0x200000 + (bytes[offset + 1] & 0x7f) * 0x4000 + (bytes[offset + 2] & 0x7f) * 0x80 + (bytes[offset + 3] & 0x7f);
}

function readAt(fd, size, position) {
  const buffer = Buffer.alloc(size);
  let count = 0;
  while (count < size) {
    const bytes = readSync(fd, buffer, count, size - count, position + count);
    if (bytes === 0) break;
    count += bytes;
  }
  return buffer.subarray(0, count);
}

function decodeId3Text(bytes, encoding) {
  if (encoding === 0) return bytes.toString("latin1");
  if (encoding === 3) return bytes.toString("utf8");
  if (encoding !== 1 && encoding !== 2) return "";

  const hasBom = bytes[0] === 0xff && bytes[1] === 0xfe || bytes[0] === 0xfe && bytes[1] === 0xff;
  const bigEndian = encoding === 2 || bytes[0] === 0xfe && bytes[1] === 0xff;
  return new TextDecoder(bigEndian ? "utf-16be" : "utf-16le").decode(hasBom ? bytes.subarray(2) : bytes);
}

function readEmbeddedMetadata(filename) {
  const fd = openSync(join(audioDirectory, filename), "r");
  try {
    const header = readAt(fd, 10, 0);
    if (header.length !== 10 || header.toString("ascii", 0, 3) !== "ID3") return {};
    const version = header[3];
    if ((version !== 3 && version !== 4) || header[5] & 0x80) return {};

    const tagSize = syncSafeNumber(header, 6);
    if (tagSize > 10_000_000) return {};
    const tag = readAt(fd, tagSize, 10);
    if (tag.length !== tagSize) return {};

    let offset = 0;
    let embeddedLyrics = null;
    let sunoId = null;
    if (header[5] & 0x40) {
      offset = version === 4 ? syncSafeNumber(tag, 0) : tag.readUInt32BE(0) + 4;
    }

    while (offset + 10 <= tag.length) {
      const frame = tag.toString("ascii", offset, offset + 4);
      if (!/^[A-Z0-9]{4}$/.test(frame)) break;
      const size = version === 4 ? syncSafeNumber(tag, offset + 4) : tag.readUInt32BE(offset + 4);
      if (size <= 0 || offset + 10 + size > tag.length) break;

      if (frame === "USLT" && tag[offset + 8] === 0 && tag[offset + 9] === 0) {
        const data = tag.subarray(offset + 10, offset + 10 + size);
        const decoded = decodeId3Text(data.subarray(4), data[0]);
        const separator = decoded.indexOf("\0");
        const body = cleanLyrics(separator === -1 ? decoded : decoded.slice(separator + 1));
        if (body) embeddedLyrics = body;
      }
      if (frame === "TXXX" && tag[offset + 8] === 0 && tag[offset + 9] === 0) {
        const data = tag.subarray(offset + 10, offset + 10 + size);
        const decoded = decodeId3Text(data.subarray(1), data[0]);
        const match = /\bid=([0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})\b/i.exec(decoded);
        if (match) sunoId = match[1].toLowerCase();
      }
      offset += 10 + size;
    }
    return { embeddedLyrics, sunoId };
  } finally {
    closeSync(fd);
  }
}

for (const filename of textFiles) {
  const match = /^(.*)\.(mp3|m4a|wav|aac|ogg|opus|flac)(?: \((\d+)\))?\.txt$/i.exec(filename);
  if (!match) continue;

  const [, stem, extension, copy] = match;
  const originalName = `${stem}${copy ? ` (${copy})` : ""}.${extension}`;
  const currentName = renamed.get(originalName);

  const lines = readFileSync(join(lyricsDirectory, filename), "utf8").replace(/^\uFEFF/, "").split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === "--- Lyrics ---");
  if (start === -1) continue;

  const end = lines.findIndex((line, index) => index > start && /^--- (?:Raw API Response|Resposta Bruta da API) ---$/.test(line.trim()));
  const body = cleanLyrics(lines.slice(start + 1, end === -1 ? undefined : end).join("\n"));
  if (!body) continue;

  if (end !== -1) {
    try {
      const sunoId = JSON.parse(lines.slice(end + 1).join("\n")).id?.toLowerCase();
      if (/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(sunoId)) {
        const previous = lyricsBySunoId.get(sunoId);
        if (!lyricsBySunoId.has(sunoId)) lyricsBySunoId.set(sunoId, { body, filename });
        else if (previous?.body !== body) lyricsBySunoId.set(sunoId, null);
      }
    } catch {
      // An invalid export cannot be used for ID matching.
    }
  }

  if (!currentName || !audioNames.has(currentName)) continue;
  if (Object.hasOwn(lyrics, currentName)) {
    throw new Error(`Multiple exact lyric files match ${currentName}`);
  }
  lyrics[currentName] = body;
  matchedTextFiles.add(filename);
}

const exportedCount = Object.keys(lyrics).length;
let embeddedCount = 0;
let sunoIdCount = 0;
for (const filename of [...audioNames].filter((name) => name.toLowerCase().endsWith(".mp3")).sort()) {
  if (Object.hasOwn(lyrics, filename)) continue;
  const { embeddedLyrics, sunoId } = readEmbeddedMetadata(filename);
  if (embeddedLyrics) {
    lyrics[filename] = embeddedLyrics;
    embeddedCount += 1;
  } else if (sunoId && lyricsBySunoId.get(sunoId)) {
    const match = lyricsBySunoId.get(sunoId);
    lyrics[filename] = match.body;
    matchedTextFiles.add(match.filename);
    sunoIdCount += 1;
  }
}

const output = resolve("src/features/radio/lyrics.generated.json");
writeFileSync(output, `${JSON.stringify(Object.fromEntries(Object.entries(lyrics).sort(([a], [b]) => a.localeCompare(b, "pt-BR"))), null, 2)}\n`, "utf8");
process.stdout.write(`Linked ${exportedCount} exact text lyrics, ${embeddedCount} embedded MP3 lyrics, and ${sunoIdCount} Suno ID matches (${Object.keys(lyrics).length} total). ${audioNames.size - Object.keys(lyrics).length} tracks remain without lyrics; ${textFiles.length - matchedTextFiles.size} text exports require review.\n`);
