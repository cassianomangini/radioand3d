import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync
} from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { buildSyncedLyrics } from "./lib/lyrics-sync.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const CANONICAL_PATH = join(ROOT, "src/features/radio/lyrics.generated.json");
const OUTPUT_PATH = join(ROOT, "src/features/radio/lyrics.synced.generated.json");
const CACHE_DIRECTORY = join(ROOT, "output/lyrics-sync");
const PYTHON_HELPER = join(ROOT, "scripts/transcribe-radio-lyrics.py");
const CACHE_VERSION = 1;

function usage() {
  return `Usage: pnpm lyrics:sync -- <audio-directory> [options]\n\n` +
    `Options:\n` +
    `  --track <filename>       Process only an exact track ID. Repeatable.\n` +
    `  --limit <count>          Limit the selected tracks after filtering.\n` +
    `  --model <name>           WhisperX model (default: large-v3).\n` +
    `  --device <auto|cpu|cuda> Device selection (default: auto).\n` +
    `  --compute-type <value>   WhisperX compute type (default: auto).\n` +
    `  --batch-size <count>     Transcription batch size (default: 8).\n` +
    `  --min-coverage <0..1>    Minimum direct word-match coverage (default: 0.45).\n` +
    `  --python <command>       Python executable/launcher (default: PYTHON or python).\n` +
    `  --force                  Ignore cached WhisperX output.\n`;
}

function parseArgs(argv) {
  const [audioDirectory, ...rest] = argv;
  if (!audioDirectory || audioDirectory === "--help" || audioDirectory === "-h") {
    process.stdout.write(usage());
    process.exit(audioDirectory ? 0 : 1);
  }

  const options = {
    audioDirectory: resolve(audioDirectory),
    tracks: [],
    limit: null,
    model: "large-v3",
    device: "auto",
    computeType: "auto",
    batchSize: 8,
    minCoverage: 0.45,
    python: process.env.PYTHON || "python",
    force: false
  };

  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    if (argument === "--force") {
      options.force = true;
      continue;
    }
    const value = rest[index + 1];
    if (!value) throw new Error(`Missing value for ${argument}`);
    index += 1;

    if (argument === "--track") options.tracks.push(value);
    else if (argument === "--limit") options.limit = Number.parseInt(value, 10);
    else if (argument === "--model") options.model = value;
    else if (argument === "--device") options.device = value;
    else if (argument === "--compute-type") options.computeType = value;
    else if (argument === "--batch-size") options.batchSize = Number.parseInt(value, 10);
    else if (argument === "--min-coverage") options.minCoverage = Number.parseFloat(value);
    else if (argument === "--python") options.python = value;
    else throw new Error(`Unknown option: ${argument}`);
  }

  if (!Number.isInteger(options.batchSize) || options.batchSize < 1) throw new Error("--batch-size must be a positive integer.");
  if (options.limit !== null && (!Number.isInteger(options.limit) || options.limit < 1)) throw new Error("--limit must be a positive integer.");
  if (!Number.isFinite(options.minCoverage) || options.minCoverage < 0 || options.minCoverage > 1) throw new Error("--min-coverage must be between 0 and 1.");
  if (!["auto", "cpu", "cuda"].includes(options.device)) throw new Error("--device must be auto, cpu or cuda.");
  return options;
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJsonAtomic(path, value) {
  const temporary = `${path}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(temporary, path);
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function cachePaths(trackId) {
  const key = hash(trackId);
  return {
    outputPath: join(CACHE_DIRECTORY, `${key}.whisperx.json`),
    metadataPath: join(CACHE_DIRECTORY, `${key}.meta.json`)
  };
}

function cacheFingerprint(trackId, audioPath, options) {
  const stat = statSync(audioPath);
  return {
    version: CACHE_VERSION,
    trackId,
    audioSize: stat.size,
    audioMtimeMs: Math.round(stat.mtimeMs),
    model: options.model,
    device: options.device,
    computeType: options.computeType
  };
}

function sameFingerprint(left, right) {
  return left && Object.keys(right).every((key) => left[key] === right[key]);
}

const options = parseArgs(process.argv.slice(2));
if (!existsSync(options.audioDirectory)) throw new Error(`Audio directory not found: ${options.audioDirectory}`);
mkdirSync(CACHE_DIRECTORY, { recursive: true });

const canonical = readJson(CANONICAL_PATH, {});
const requested = new Set(options.tracks);
let selected = Object.entries(canonical)
  .filter(([trackId]) => requested.size === 0 || requested.has(trackId))
  .map(([trackId, lyrics]) => ({ trackId, lyrics, audioPath: join(options.audioDirectory, trackId) }))
  .filter(({ trackId, audioPath }) => {
    if (existsSync(audioPath)) return true;
    process.stderr.write(`skip missing audio: ${trackId}\n`);
    return false;
  });

if (requested.size > 0) {
  const known = new Set(Object.keys(canonical));
  for (const trackId of requested) {
    if (!known.has(trackId)) process.stderr.write(`unknown canonical lyric track: ${trackId}\n`);
  }
}
if (options.limit !== null) selected = selected.slice(0, options.limit);
if (!selected.length) throw new Error("No tracks with canonical lyrics and local audio were selected.");

const jobs = [];
const fingerprints = new Map();
for (const item of selected) {
  const sourceHash = hash(item.lyrics);
  const paths = cachePaths(item.trackId);
  const fingerprint = cacheFingerprint(item.trackId, item.audioPath, options);
  fingerprints.set(item.trackId, { sourceHash, paths, fingerprint });
  const cached = readJson(paths.metadataPath, null);
  const validCache = !options.force && existsSync(paths.outputPath) && sameFingerprint(cached, fingerprint);
  if (!validCache) jobs.push({ trackId: item.trackId, audioPath: item.audioPath, outputPath: paths.outputPath });
}

let transcriptionFailed = false;
if (jobs.length) {
  const manifestPath = join(CACHE_DIRECTORY, "manifest.json");
  const reportPath = join(CACHE_DIRECTORY, "report.json");
  writeJsonAtomic(manifestPath, { reportPath, jobs });
  process.stdout.write(`WhisperX: ${jobs.length} track(s) require transcription/alignment; ${selected.length - jobs.length} cache hit(s).\n`);

  const result = spawnSync(
    options.python,
    [
      PYTHON_HELPER,
      manifestPath,
      "--model", options.model,
      "--device", options.device,
      "--compute-type", options.computeType,
      "--batch-size", String(options.batchSize)
    ],
    { cwd: ROOT, stdio: "inherit" }
  );

  if (result.error) throw new Error(`Could not start ${options.python}: ${result.error.message}`);
  transcriptionFailed = result.status !== 0;

  for (const job of jobs) {
    const cached = fingerprints.get(job.trackId);
    if (cached && existsSync(cached.paths.outputPath)) writeJsonAtomic(cached.paths.metadataPath, cached.fingerprint);
  }
}

const generated = readJson(OUTPUT_PATH, {});
const failures = [];
let written = 0;

for (const item of selected) {
  const cached = fingerprints.get(item.trackId);
  if (!cached || !existsSync(cached.paths.outputPath)) {
    failures.push({ trackId: item.trackId, error: "WhisperX output is unavailable." });
    continue;
  }

  try {
    const whisperResult = readJson(cached.paths.outputPath, null);
    const synced = buildSyncedLyrics(item.lyrics, whisperResult, { minCoverage: options.minCoverage });
    generated[item.trackId] = {
      ...synced,
      sourceHash: cached.sourceHash,
      model: options.model,
      generatedAt: new Date().toISOString()
    };
    written += 1;
  } catch (error) {
    failures.push({ trackId: item.trackId, error: error instanceof Error ? error.message : String(error) });
  }
}

for (const trackId of Object.keys(generated)) {
  if (!Object.hasOwn(canonical, trackId)) delete generated[trackId];
}

const sorted = Object.fromEntries(Object.entries(generated).sort(([left], [right]) => left.localeCompare(right, "pt-BR")));
writeJsonAtomic(OUTPUT_PATH, sorted);

process.stdout.write(`Synced ${written}/${selected.length} selected track(s). Generated catalog now has ${Object.keys(sorted).length} synchronized track(s).\n`);
for (const failure of failures) process.stderr.write(`sync failed: ${failure.trackId}: ${failure.error}\n`);

if (transcriptionFailed || failures.length) process.exitCode = 1;
