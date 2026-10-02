import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync
} from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = resolve(import.meta.dirname, "..");
const WORK_DIRECTORY = join(ROOT, "output/radio-visualizer");
const CACHE_DIRECTORY = join(WORK_DIRECTORY, "cache");
const PUBLISH_DIRECTORY = join(WORK_DIRECTORY, "publish");
const PYTHON_HELPER = join(ROOT, "scripts/analyze-radio-visualizer.py");
const VENV_PYTHON = join(
  WORK_DIRECTORY,
  ".venv",
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python"
);
const ANALYSIS_PREFIX = "_analysis/v1";
const CACHE_VERSION = 1;
const AUDIO_EXTENSIONS = new Set([".mp3", ".m4a", ".wav", ".aac", ".ogg", ".opus", ".flac"]);

function defaultPython() {
  if (process.env.PYTHON) return process.env.PYTHON;
  if (existsSync(VENV_PYTHON)) return VENV_PYTHON;
  return "python";
}

function usage() {
  return `Usage: pnpm visualizer:sync -- <audio-directory> [options]\n\n` +
    `Options:\n` +
    `  --track <relative-path>  Process only an exact track ID. Repeatable.\n` +
    `  --limit <count>          Limit tracks after filtering.\n` +
    `  --model <name>           Demucs model (default: htdemucs).\n` +
    `  --device <auto|cpu|cuda> Device selection (default: auto).\n` +
    `  --fps <number>           Analysis frames per second (default: 25).\n` +
    `  --bars <count>           Canonical visualizer bars (default: 36).\n` +
    `  --voice-bars <count>     Center bars reserved for separated vocals (default: 8).\n` +
    `  --python <command>       Python executable.\n` +
    `  --force                  Ignore cached analysis.\n` +
    `  --upload                 Upload generated sidecars to the configured R2 bucket.\n`;
}

function parseArgs(argv) {
  const args = argv[0] === "--" ? argv.slice(1) : argv;
  const [audioDirectory, ...rest] = args;
  if (!audioDirectory || audioDirectory === "--help" || audioDirectory === "-h") {
    process.stdout.write(usage());
    process.exit(audioDirectory ? 0 : 1);
  }

  const options = {
    audioDirectory: resolve(audioDirectory),
    tracks: [],
    limit: null,
    model: "htdemucs",
    device: "auto",
    fps: 25,
    bars: 36,
    voiceBars: 8,
    python: defaultPython(),
    force: false,
    upload: false
  };

  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    if (argument === "--force") {
      options.force = true;
      continue;
    }
    if (argument === "--upload") {
      options.upload = true;
      continue;
    }

    const value = rest[index + 1];
    if (!value) throw new Error(`Missing value for ${argument}`);
    index += 1;
    if (argument === "--track") options.tracks.push(value.replaceAll("\\", "/"));
    else if (argument === "--limit") options.limit = Number.parseInt(value, 10);
    else if (argument === "--model") options.model = value;
    else if (argument === "--device") options.device = value;
    else if (argument === "--fps") options.fps = Number.parseFloat(value);
    else if (argument === "--bars") options.bars = Number.parseInt(value, 10);
    else if (argument === "--voice-bars") options.voiceBars = Number.parseInt(value, 10);
    else if (argument === "--python") options.python = value;
    else throw new Error(`Unknown option: ${argument}`);
  }

  if (!Number.isFinite(options.fps) || options.fps < 10 || options.fps > 60) throw new Error("--fps must be between 10 and 60.");
  if (!Number.isInteger(options.bars) || options.bars < 12 || options.bars > 96) throw new Error("--bars must be an integer between 12 and 96.");
  if (!Number.isInteger(options.voiceBars) || options.voiceBars < 4 || options.voiceBars >= options.bars) throw new Error("--voice-bars must be at least 4 and smaller than --bars.");
  if ((options.bars - options.voiceBars) % 2 !== 0) throw new Error("--bars minus --voice-bars must be even.");
  if (options.limit !== null && (!Number.isInteger(options.limit) || options.limit < 1)) throw new Error("--limit must be a positive integer.");
  if (!["auto", "cpu", "cuda"].includes(options.device)) throw new Error("--device must be auto, cpu or cuda.");
  return options;
}

function writeJsonAtomic(path, value) {
  const temporary = `${path}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(temporary, path);
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function objectKey(trackId) {
  return `${ANALYSIS_PREFIX}/${hash(trackId)}.json`;
}

function walkAudioFiles(directory) {
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...walkAudioFiles(path));
    else if (entry.isFile() && AUDIO_EXTENSIONS.has(extname(entry.name).toLowerCase())) result.push(path);
  }
  return result;
}

function trackIdForPath(audioDirectory, audioPath) {
  return relative(audioDirectory, audioPath).split(sep).join("/");
}

function cacheFingerprint(item, options) {
  const stat = statSync(item.audioPath);
  return {
    version: CACHE_VERSION,
    trackId: item.trackId,
    audioSize: stat.size,
    audioMtimeMs: Math.round(stat.mtimeMs),
    model: options.model,
    fps: options.fps,
    bars: options.bars,
    voiceBars: options.voiceBars
  };
}

function sameFingerprint(left, right) {
  return left && Object.keys(right).every((key) => left[key] === right[key]);
}

async function uploadOutputs(items) {
  const endpoint = process.env.R2_S3_ENDPOINT;
  const bucket = process.env.R2_BUCKET;
  const accessKeyId = process.env.R2_VISUALIZER_WRITE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_VISUALIZER_WRITE_SECRET_ACCESS_KEY;
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("--upload requires R2_S3_ENDPOINT, R2_BUCKET, R2_VISUALIZER_WRITE_ACCESS_KEY_ID and R2_VISUALIZER_WRITE_SECRET_ACCESS_KEY.");
  }

  const { PutObjectCommand, S3Client } = await import("@aws-sdk/client-s3");
  const client = new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey }
  });

  try {
    for (const item of items) {
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey(item.trackId),
        Body: readFileSync(item.outputPath),
        ContentType: "application/json; charset=utf-8",
        CacheControl: "public, max-age=300"
      }));
      process.stdout.write(`uploaded: ${item.trackId}\n`);
    }
  } finally {
    client.destroy();
  }
}

const options = parseArgs(process.argv.slice(2));
if (!existsSync(options.audioDirectory)) throw new Error(`Audio directory not found: ${options.audioDirectory}`);
mkdirSync(CACHE_DIRECTORY, { recursive: true });
mkdirSync(join(PUBLISH_DIRECTORY, ANALYSIS_PREFIX), { recursive: true });

const requested = new Set(options.tracks);
let selected = walkAudioFiles(options.audioDirectory)
  .map((audioPath) => ({ audioPath, trackId: trackIdForPath(options.audioDirectory, audioPath) }))
  .filter(({ trackId }) => requested.size === 0 || requested.has(trackId))
  .sort((left, right) => left.trackId.localeCompare(right.trackId, "pt-BR"));

if (options.limit !== null) selected = selected.slice(0, options.limit);
if (!selected.length) throw new Error("No audio tracks were selected.");

const jobs = [];
const publishItems = [];
for (const item of selected) {
  const key = hash(item.trackId);
  const outputPath = join(PUBLISH_DIRECTORY, ANALYSIS_PREFIX, `${key}.json`);
  const metadataPath = join(CACHE_DIRECTORY, `${key}.meta.json`);
  const fingerprint = cacheFingerprint(item, options);
  const cached = readJson(metadataPath, null);
  const valid = !options.force && existsSync(outputPath) && sameFingerprint(cached, fingerprint);
  publishItems.push({ ...item, outputPath, metadataPath, fingerprint });
  if (!valid) {
    jobs.push({
      trackId: item.trackId,
      audioPath: item.audioPath,
      outputPath,
      fps: options.fps,
      barCount: options.bars,
      voiceBars: options.voiceBars
    });
  }
}

let analysisFailed = false;
if (jobs.length) {
  const manifestPath = join(WORK_DIRECTORY, "manifest.json");
  const reportPath = join(WORK_DIRECTORY, "report.json");
  writeJsonAtomic(manifestPath, { reportPath, jobs });
  process.stdout.write(`Musical analysis: ${jobs.length} track(s); ${selected.length - jobs.length} cache hit(s).\n`);

  const result = spawnSync(
    options.python,
    [PYTHON_HELPER, manifestPath, "--model", options.model, "--device", options.device],
    { cwd: ROOT, stdio: "inherit", env: process.env }
  );
  if (result.error) throw new Error(`Could not start ${options.python}: ${result.error.message}`);
  analysisFailed = result.status !== 0;

  for (const item of publishItems) {
    if (existsSync(item.outputPath)) writeJsonAtomic(item.metadataPath, item.fingerprint);
  }
}

const ready = publishItems.filter((item) => existsSync(item.outputPath));
process.stdout.write(`Visualizer sidecars ready: ${ready.length}/${selected.length}. Output: ${join(PUBLISH_DIRECTORY, ANALYSIS_PREFIX)}\n`);

if (options.upload && ready.length) {
  await uploadOutputs(ready);
  process.stdout.write("Remote test ready: open the PR preview or deployed site; the player will fetch the uploaded R2 sidecar automatically.\n");
} else if (ready.length) {
  process.stdout.write("Local test ready: run pnpm dev with RADIO_CATALOG_SOURCE=r2; development automatically serves generated sidecars from output/.\n");
}
if (analysisFailed || ready.length !== selected.length) process.exitCode = 1;
