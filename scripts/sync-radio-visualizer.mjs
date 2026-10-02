import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync
} from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import {
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import {
  analysisFingerprint,
  analysisObjectKey,
  encodePublicObjectUrl,
  fingerprintMetadata,
  isAudioObject,
  sidecarIsCurrent
} from "./lib/visualizer-batch.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const WORK_DIRECTORY = join(ROOT, "output/radio-visualizer");
const CACHE_DIRECTORY = join(WORK_DIRECTORY, "cache");
const PUBLISH_DIRECTORY = join(WORK_DIRECTORY, "publish");
const PYTHON_HELPER = join(ROOT, "scripts/analyze-radio-visualizer.py");
const REQUIREMENTS = join(ROOT, "scripts/requirements-visualizer-analysis.txt");
const VENV_DIRECTORY = join(WORK_DIRECTORY, ".venv");
const VENV_PYTHON = join(
  VENV_DIRECTORY,
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python"
);
const REQUIREMENTS_MARKER = join(CACHE_DIRECTORY, "python-requirements.sha256");

function usage() {
  return "Usage: pnpm visualizer:sync [options]\n\n" +
    "Processes the complete R2 radio catalog, uploads every missing/stale sidecar, and resumes safely.\n\n" +
    "Options:\n" +
    "  --model <name>           Demucs model (default: htdemucs).\n" +
    "  --device <auto|cpu|cuda> Device selection (default: auto).\n" +
    "  --fps <number>           Analysis frames per second (default: 25).\n" +
    "  --bars <count>           Canonical visualizer bars (default: 36).\n" +
    "  --voice-bars <count>     Center bars reserved for separated vocals (default: 8).\n" +
    "  --python <command>       Use an already-prepared Python executable.\n" +
    "  --force                  Reprocess every R2 track even when its sidecar is current.\n";
}

function parseArgs(argv) {
  const args = argv[0] === "--" ? argv.slice(1) : argv;
  const options = {
    model: "htdemucs",
    device: "auto",
    fps: 25,
    bars: 36,
    voiceBars: 8,
    python: null,
    force: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help" || argument === "-h") {
      process.stdout.write(usage());
      process.exit(0);
    }
    if (argument === "--force") {
      options.force = true;
      continue;
    }

    const value = args[index + 1];
    if (!value) throw new Error("Missing value for " + argument);
    index += 1;

    if (argument === "--model") options.model = value;
    else if (argument === "--device") options.device = value;
    else if (argument === "--fps") options.fps = Number.parseFloat(value);
    else if (argument === "--bars") options.bars = Number.parseInt(value, 10);
    else if (argument === "--voice-bars") options.voiceBars = Number.parseInt(value, 10);
    else if (argument === "--python") options.python = value;
    else throw new Error("Unknown option: " + argument + "\n\n" + usage());
  }

  if (!Number.isFinite(options.fps) || options.fps < 10 || options.fps > 60) {
    throw new Error("--fps must be between 10 and 60.");
  }
  if (!Number.isInteger(options.bars) || options.bars < 12 || options.bars > 96) {
    throw new Error("--bars must be an integer between 12 and 96.");
  }
  if (!Number.isInteger(options.voiceBars) || options.voiceBars < 4 || options.voiceBars >= options.bars) {
    throw new Error("--voice-bars must be at least 4 and smaller than --bars.");
  }
  if ((options.bars - options.voiceBars) % 2 !== 0) {
    throw new Error("--bars minus --voice-bars must be even.");
  }
  if (!["auto", "cpu", "cuda"].includes(options.device)) {
    throw new Error("--device must be auto, cpu or cuda.");
  }

  return options;
}

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    let value = rawValue.trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function loadProjectEnvironment() {
  loadEnvFile(join(ROOT, ".env.local"));
  loadEnvFile(join(ROOT, ".env"));
}

function requireEnvironment() {
  const values = {
    endpoint: process.env.R2_S3_ENDPOINT,
    bucket: process.env.R2_BUCKET,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
    readAccessKeyId: process.env.R2_ACCESS_KEY_ID,
    readSecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    writeAccessKeyId: process.env.R2_VISUALIZER_WRITE_ACCESS_KEY_ID,
    writeSecretAccessKey: process.env.R2_VISUALIZER_WRITE_SECRET_ACCESS_KEY
  };

  const missing = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(
      "The complete R2 batch requires these values in .env.local: " +
      missing.join(", ") +
      ". The visualizer write credential must have PutObject permission only for _analysis/v1/*."
    );
  }

  return values;
}

function writeJsonAtomic(path, value) {
  mkdirSync(resolve(path, ".."), { recursive: true });
  const temporary = path + ".tmp";
  writeFileSync(temporary, JSON.stringify(value, null, 2) + "\n", "utf8");
  renameSync(temporary, path);
}

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function runChecked(command, args, label) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env
  });
  if (result.error) throw new Error(label + ": " + result.error.message);
  if (result.status !== 0) {
    throw new Error(label + " failed with exit code " + String(result.status ?? "unknown") + ".");
  }
}

function findSystemPython() {
  const candidates = process.platform === "win32"
    ? [
        { command: "py", prefix: ["-3.11"] },
        { command: "py", prefix: ["-3.12"] },
        { command: "py", prefix: ["-3"] },
        { command: "python", prefix: [] }
      ]
    : [
        { command: "python3.11", prefix: [] },
        { command: "python3.12", prefix: [] },
        { command: "python3", prefix: [] },
        { command: "python", prefix: [] }
      ];

  for (const candidate of candidates) {
    const result = spawnSync(
      candidate.command,
      [...candidate.prefix, "--version"],
      { stdio: "ignore" }
    );
    if (!result.error && result.status === 0) return candidate;
  }
  return null;
}

function ensurePython(options) {
  if (options.python) return options.python;

  mkdirSync(CACHE_DIRECTORY, { recursive: true });
  const requirementsHash = sha256(readFileSync(REQUIREMENTS));
  const installedHash = existsSync(REQUIREMENTS_MARKER)
    ? readFileSync(REQUIREMENTS_MARKER, "utf8").trim()
    : "";

  if (!existsSync(VENV_PYTHON)) {
    const systemPython = findSystemPython();
    if (!systemPython) {
      throw new Error("Python 3 was not found. Install Python 3 once; the visualizer command prepares the rest automatically.");
    }
    process.stdout.write("Preparing the radio visualizer Python environment (first run only)...\n");
    runChecked(
      systemPython.command,
      [...systemPython.prefix, "-m", "venv", VENV_DIRECTORY],
      "Creating Python virtual environment"
    );
  }

  if (installedHash !== requirementsHash) {
    process.stdout.write("Installing/updating musical-analysis dependencies (first run can take several minutes)...\n");
    runChecked(VENV_PYTHON, ["-m", "pip", "install", "--upgrade", "pip"], "Updating pip");
    runChecked(VENV_PYTHON, ["-m", "pip", "install", "-r", REQUIREMENTS], "Installing visualizer dependencies");
    writeFileSync(REQUIREMENTS_MARKER, requirementsHash + "\n", "utf8");
  }

  return VENV_PYTHON;
}

function createR2Client(endpoint, accessKeyId, secretAccessKey) {
  return new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey }
  });
}

async function listAudioObjects(client, bucket) {
  const objects = [];
  let continuationToken;

  do {
    const page = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      ContinuationToken: continuationToken,
      MaxKeys: 1000
    }));

    for (const object of page.Contents ?? []) {
      if (object.Key && isAudioObject(object.Key)) {
        objects.push({
          Key: object.Key,
          ETag: object.ETag,
          Size: object.Size ?? 0
        });
      }
    }

    if (!page.IsTruncated) break;
    continuationToken = page.NextContinuationToken;
    if (!continuationToken) {
      throw new Error("R2 returned a truncated catalog without a continuation token.");
    }
  } while (true);

  return objects.sort((left, right) => left.Key.localeCompare(right.Key, "pt-BR"));
}

async function mapLimit(items, concurrency, mapper) {
  const result = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      result[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );
  return result;
}

async function sidecarCurrent(client, bucket, objectKey, fingerprint) {
  try {
    const response = await client.send(new HeadObjectCommand({
      Bucket: bucket,
      Key: objectKey
    }));
    return sidecarIsCurrent(response.Metadata, fingerprint);
  } catch (error) {
    const status = error?.$metadata?.httpStatusCode;
    if (status === 404 || error?.name === "NotFound" || error?.name === "NoSuchKey") {
      return false;
    }
    throw error;
  }
}

async function verifyWriteAccess(environment) {
  const client = createR2Client(
    environment.endpoint,
    environment.writeAccessKeyId,
    environment.writeSecretAccessKey
  );
  try {
    await client.send(new PutObjectCommand({
      Bucket: environment.bucket,
      Key: "_analysis/v1/_pipeline-write-check.json",
      Body: "{}\n",
      ContentType: "application/json; charset=utf-8",
      CacheControl: "no-store"
    }));
  } catch (error) {
    throw new Error(
      "R2 visualizer write credential cannot write to _analysis/v1/*. " +
      "Fix R2_VISUALIZER_WRITE_ACCESS_KEY_ID / R2_VISUALIZER_WRITE_SECRET_ACCESS_KEY before starting the batch. " +
      (error instanceof Error ? error.message : String(error))
    );
  } finally {
    client.destroy();
  }
}

const options = parseArgs(process.argv.slice(2));
loadProjectEnvironment();
const environment = requireEnvironment();
mkdirSync(CACHE_DIRECTORY, { recursive: true });
mkdirSync(PUBLISH_DIRECTORY, { recursive: true });

const readClient = createR2Client(
  environment.endpoint,
  environment.readAccessKeyId,
  environment.readSecretAccessKey
);

let audioObjects;
try {
  process.stdout.write("Reading the complete radio catalog from R2...\n");
  audioObjects = await listAudioObjects(readClient, environment.bucket);
  if (!audioObjects.length) throw new Error("R2 returned no audio tracks.");
  process.stdout.write(
    "R2 catalog: " + audioObjects.length + " audio track(s). Checking existing analysis...\n"
  );

  const planned = await mapLimit(audioObjects, 12, async (object, index) => {
    const trackId = object.Key;
    const fingerprint = analysisFingerprint(object, options);
    const sidecarKey = analysisObjectKey(trackId);
    const current = !options.force && await sidecarCurrent(
      readClient,
      environment.bucket,
      sidecarKey,
      fingerprint
    );
    if ((index + 1) % 40 === 0 || index + 1 === audioObjects.length) {
      process.stdout.write("Checked " + (index + 1) + "/" + audioObjects.length + "\n");
    }
    return { object, trackId, fingerprint, sidecarKey, current };
  });

  const pending = planned.filter((item) => !item.current);
  const currentCount = planned.length - pending.length;
  process.stdout.write(
    "Analysis status: " + currentCount + " current, " + pending.length + " pending.\n"
  );

  if (!pending.length) {
    process.stdout.write("All radio tracks already have current musical visualizer analysis in R2.\n");
    process.exit(0);
  }

  process.stdout.write("Checking R2 sidecar write permission before starting expensive analysis...\n");
  await verifyWriteAccess(environment);

  const python = ensurePython(options);
  const manifestPath = join(WORK_DIRECTORY, "manifest.json");
  const reportPath = join(WORK_DIRECTORY, "report.json");

  const jobs = pending.map((item) => {
    const outputPath = join(PUBLISH_DIRECTORY, item.sidecarKey);
    return {
      trackId: item.trackId,
      audioUrl: encodePublicObjectUrl(environment.publicBaseUrl, item.trackId),
      outputPath,
      objectKey: item.sidecarKey,
      uploadMetadata: fingerprintMetadata(item.fingerprint),
      fps: options.fps,
      barCount: options.bars,
      voiceBars: options.voiceBars
    };
  });

  writeJsonAtomic(manifestPath, {
    reportPath,
    totalCatalogTracks: audioObjects.length,
    jobs
  });

  process.stdout.write(
    "Starting batch: " + jobs.length +
    " track(s). Each completed track is uploaded immediately, so reruns resume safely.\n"
  );

  const pythonEnvironment = {
    ...process.env,
    CM_VISUALIZER_R2_ENDPOINT: environment.endpoint,
    CM_VISUALIZER_R2_BUCKET: environment.bucket,
    CM_VISUALIZER_R2_ACCESS_KEY_ID: environment.writeAccessKeyId,
    CM_VISUALIZER_R2_SECRET_ACCESS_KEY: environment.writeSecretAccessKey
  };

  const result = spawnSync(
    python,
    [
      PYTHON_HELPER,
      manifestPath,
      "--model", options.model,
      "--device", options.device
    ],
    {
      cwd: ROOT,
      stdio: "inherit",
      env: pythonEnvironment
    }
  );

  if (result.error) {
    throw new Error("Could not start musical analysis: " + result.error.message);
  }

  const report = readJson(reportPath, { processed: [], failed: [] });
  const processed = Array.isArray(report.processed) ? report.processed.length : 0;
  const failed = Array.isArray(report.failed) ? report.failed.length : 0;

  process.stdout.write(
    "Batch result: " + processed + " processed/uploaded, " + failed +
    " failed, " + currentCount + " already current.\n"
  );

  if (result.status !== 0 || failed > 0) {
    process.stderr.write(
      "Some tracks failed. Run pnpm visualizer:sync again; current R2 sidecars are skipped and only pending tracks are retried.\n"
    );
    process.exitCode = 1;
  } else {
    process.stdout.write(
      "Complete: " + audioObjects.length +
      " radio tracks are covered by the musical visualizer pipeline.\n"
    );
  }
} finally {
  readClient.destroy();
}
