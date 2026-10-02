import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
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
  fingerprintMetadata,
  isAudioObject,
  reconcileR2CatalogWithLocalFiles,
  sidecarIsCurrent
} from "./lib/visualizer-batch.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const WORK_DIRECTORY = join(ROOT, "output/radio-visualizer");
const CACHE_DIRECTORY = join(WORK_DIRECTORY, "cache");
const PUBLISH_DIRECTORY = join(WORK_DIRECTORY, "publish");
const RECONCILIATION_REPORT = join(WORK_DIRECTORY, "reconciliation.json");
const PYTHON_HELPER = join(ROOT, "scripts/analyze-radio-visualizer.py");
const REQUIREMENTS = join(ROOT, "scripts/requirements-visualizer-analysis.txt");
const VENV_DIRECTORY = join(WORK_DIRECTORY, ".venv");
const VENV_PYTHON = join(
  VENV_DIRECTORY,
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python"
);
const REQUIREMENTS_MARKER = join(CACHE_DIRECTORY, "python-requirements.sha256");

function usage() {
  return "Usage: pnpm visualizer:sync -- <local-audio-directory> [options]\n" +
    "   or: RADIO_LOCAL_AUDIO_DIR=<directory> pnpm visualizer:sync\n\n" +
    "R2 defines the canonical radio catalog. Audio analysis reads the matching files from the local directory; no music is downloaded.\n\n" +
    "Options:\n" +
    "  --audio-dir <directory>  Local Artesopolis radio folder; overrides RADIO_LOCAL_AUDIO_DIR.\n" +
    "  --model <name>           Demucs model (default: htdemucs).\n" +
    "  --device <auto|cpu|cuda> Device selection (default: auto).\n" +
    "  --fps <number>           Analysis frames per second (default: 25).\n" +
    "  --bars <count>           Canonical visualizer bars (default: 36).\n" +
    "  --voice-bars <count>     Center bars reserved for separated vocals (default: 8).\n" +
    "  --python <command>       Use an already-prepared Python executable.\n" +
    "  --force                  Reprocess every R2 track even when its sidecar is current.\n";
}

function parseArgs(argv) {
  const raw = argv[0] === "--" ? argv.slice(1) : argv;
  const args = [...raw];
  let positionalAudioDirectory = null;

  if (args[0] && !args[0].startsWith("-")) {
    positionalAudioDirectory = args.shift();
  }

  const options = {
    audioDirectory: positionalAudioDirectory,
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

    if (argument === "--audio-dir") options.audioDirectory = value;
    else if (argument === "--model") options.model = value;
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

function requireEnvironment(options) {
  const readAccessKeyId = process.env.R2_ACCESS_KEY_ID;
  const readSecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const values = {
    endpoint: process.env.R2_S3_ENDPOINT,
    bucket: process.env.R2_BUCKET,
    readAccessKeyId,
    readSecretAccessKey,
    writeAccessKeyId:
      process.env.R2_VISUALIZER_WRITE_ACCESS_KEY_ID || readAccessKeyId,
    writeSecretAccessKey:
      process.env.R2_VISUALIZER_WRITE_SECRET_ACCESS_KEY || readSecretAccessKey
  };

  const required = {
    endpoint: values.endpoint,
    bucket: values.bucket,
    readAccessKeyId: values.readAccessKeyId,
    readSecretAccessKey: values.readSecretAccessKey
  };
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(
      "The complete batch requires these R2 values in .env.local: " +
      missing.join(", ") +
      "."
    );
  }

  const audioDirectoryValue =
    options.audioDirectory ||
    process.env.RADIO_LOCAL_AUDIO_DIR;

  if (!audioDirectoryValue) {
    throw new Error(
      "Local radio folder is required. Set RADIO_LOCAL_AUDIO_DIR in .env.local or run: " +
      'pnpm visualizer:sync -- "D:\\Músicas\\radio artesopolis"'
    );
  }

  const audioDirectory = resolve(audioDirectoryValue);
  if (!existsSync(audioDirectory) || !statSync(audioDirectory).isDirectory()) {
    throw new Error("Local radio folder was not found: " + audioDirectory);
  }

  return { ...values, audioDirectory };
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

function cleanPythonEnvironment(extra = {}) {
  const environment = { ...process.env, ...extra };
  delete environment.PYTHONHOME;
  delete environment.PYTHONPATH;
  return environment;
}

function runChecked(command, args, label, environment = process.env) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    env: environment
  });
  if (result.error) throw new Error(label + ": " + result.error.message);
  if (result.status !== 0) {
    throw new Error(label + " failed with exit code " + String(result.status ?? "unknown") + ".");
  }
}

const PYTHON_SANITY_IMPORTS =
  "import difflib, json, pathlib, subprocess, venv; print('cm-radio-python-ok')";

function pythonWorks(command, prefix = []) {
  const result = spawnSync(
    command,
    [...prefix, "-c", PYTHON_SANITY_IMPORTS],
    {
      cwd: ROOT,
      stdio: "ignore",
      env: cleanPythonEnvironment()
    }
  );
  return !result.error && result.status === 0;
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
    if (pythonWorks(candidate.command, candidate.prefix)) return candidate;
  }
  return null;
}

function ensurePython(options) {
  if (options.python) {
    if (!pythonWorks(options.python)) {
      throw new Error(
        "The Python executable passed with --python is incomplete: it cannot import the standard library required by the visualizer (including difflib)."
      );
    }
    return options.python;
  }

  mkdirSync(CACHE_DIRECTORY, { recursive: true });
  const requirementsHash = sha256(readFileSync(REQUIREMENTS));
  let installedHash = existsSync(REQUIREMENTS_MARKER)
    ? readFileSync(REQUIREMENTS_MARKER, "utf8").trim()
    : "";

  if (existsSync(VENV_PYTHON) && !pythonWorks(VENV_PYTHON)) {
    process.stdout.write(
      "Existing visualizer Python environment is incomplete (standard library import failed). Rebuilding it automatically...\n"
    );
    rmSync(VENV_DIRECTORY, { recursive: true, force: true });
    rmSync(REQUIREMENTS_MARKER, { force: true });
    installedHash = "";
  }

  if (!existsSync(VENV_PYTHON)) {
    const systemPython = findSystemPython();
    if (!systemPython) {
      throw new Error(
        "No usable Python installation was found. The visualizer needs a normal CPython 3 installation with the standard library (difflib, venv, pathlib). On Windows, install Python 3.11 or 3.12 from python.org and run pnpm visualizer:sync again."
      );
    }
    process.stdout.write("Preparing the radio visualizer Python environment (first run only)...\n");
    runChecked(
      systemPython.command,
      [...systemPython.prefix, "-m", "venv", VENV_DIRECTORY],
      "Creating Python virtual environment",
      cleanPythonEnvironment()
    );

    if (!pythonWorks(VENV_PYTHON)) {
      rmSync(VENV_DIRECTORY, { recursive: true, force: true });
      throw new Error(
        "Python created a virtual environment that cannot import its own standard library (difflib). Reinstall CPython 3.11 or 3.12 and run pnpm visualizer:sync again."
      );
    }
  }

  if (installedHash !== requirementsHash) {
    process.stdout.write("Installing/updating musical-analysis dependencies (first run can take several minutes)...\n");
    const environment = cleanPythonEnvironment();
    runChecked(
      VENV_PYTHON,
      ["-m", "pip", "install", "--upgrade", "pip"],
      "Updating pip",
      environment
    );
    runChecked(
      VENV_PYTHON,
      ["-m", "pip", "install", "-r", REQUIREMENTS],
      "Installing visualizer dependencies",
      environment
    );
    writeFileSync(REQUIREMENTS_MARKER, requirementsHash + "\n", "utf8");
  }

  if (!pythonWorks(VENV_PYTHON)) {
    throw new Error(
      "The visualizer Python environment became unusable after dependency installation. Delete output/radio-visualizer/.venv and rerun, or reinstall CPython 3.11/3.12."
    );
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

function walkLocalAudioFiles(rootDirectory) {
  const result = [];

  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(path);
        continue;
      }
      if (!entry.isFile()) continue;
      const extension = extname(entry.name).replace(/^\./, "").toLowerCase();
      if (!isAudioObject("file." + extension)) continue;
      const stat = statSync(path);
      result.push({
        path,
        relativeId: relative(rootDirectory, path).split(sep).join("/"),
        size: stat.size
      });
    }
  }

  visit(rootDirectory);
  return result;
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
      "The available R2 credential cannot write to _analysis/v1/*. " +
      "Either grant write permission to the current R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY, " +
      "or configure dedicated R2_VISUALIZER_WRITE_ACCESS_KEY_ID / R2_VISUALIZER_WRITE_SECRET_ACCESS_KEY values. " +
      (error instanceof Error ? error.message : String(error))
    );
  } finally {
    client.destroy();
  }
}

const options = parseArgs(process.argv.slice(2));
loadProjectEnvironment();
const environment = requireEnvironment(options);
mkdirSync(CACHE_DIRECTORY, { recursive: true });
mkdirSync(PUBLISH_DIRECTORY, { recursive: true });

const readClient = createR2Client(
  environment.endpoint,
  environment.readAccessKeyId,
  environment.readSecretAccessKey
);

try {
  process.stdout.write("Reading the complete radio catalog from R2...\n");
  const audioObjects = await listAudioObjects(readClient, environment.bucket);
  if (!audioObjects.length) throw new Error("R2 returned no audio tracks.");

  process.stdout.write(
    "R2 catalog: " + audioObjects.length + " audio track(s). Reading local Artesopolis folder...\n"
  );
  const localFiles = walkLocalAudioFiles(environment.audioDirectory);
  process.stdout.write(
    "Local folder: " + localFiles.length + " audio file(s). Reconciling with R2...\n"
  );

  const reconciliation = reconcileR2CatalogWithLocalFiles(audioObjects, localFiles);
  writeJsonAtomic(RECONCILIATION_REPORT, {
    r2Tracks: audioObjects.length,
    localAudioFiles: localFiles.length,
    matched: reconciliation.matched.length,
    missing: reconciliation.missing,
    ambiguous: reconciliation.ambiguous,
    sizeMismatches: reconciliation.sizeMismatches
  });

  if (
    reconciliation.missing.length ||
    reconciliation.ambiguous.length ||
    reconciliation.sizeMismatches.length
  ) {
    throw new Error(
      "Local/R2 reconciliation failed before analysis. " +
      "Matched " + reconciliation.matched.length + "/" + audioObjects.length +
      "; missing " + reconciliation.missing.length +
      "; ambiguous " + reconciliation.ambiguous.length +
      "; size mismatches " + reconciliation.sizeMismatches.length +
      ". See output/radio-visualizer/reconciliation.json."
    );
  }

  process.stdout.write(
    "Reconciliation OK: " + reconciliation.matched.length +
    "/" + audioObjects.length + " R2 tracks matched to identical-size local files. No music download is required.\n"
  );

  const planned = await mapLimit(reconciliation.matched, 12, async (item, index) => {
    const fingerprint = analysisFingerprint(item.object, options);
    const sidecarKey = analysisObjectKey(item.trackId);
    const current = !options.force && await sidecarCurrent(
      readClient,
      environment.bucket,
      sidecarKey,
      fingerprint
    );
    if ((index + 1) % 40 === 0 || index + 1 === reconciliation.matched.length) {
      process.stdout.write(
        "Checked sidecars " + (index + 1) + "/" + reconciliation.matched.length + "\n"
      );
    }
    return { ...item, fingerprint, sidecarKey, current };
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

  const jobs = pending.map((item) => ({
    trackId: item.trackId,
    audioPath: item.audioPath,
    outputPath: join(PUBLISH_DIRECTORY, item.sidecarKey),
    objectKey: item.sidecarKey,
    uploadMetadata: fingerprintMetadata(item.fingerprint),
    fps: options.fps,
    barCount: options.bars,
    voiceBars: options.voiceBars
  }));

  writeJsonAtomic(manifestPath, {
    reportPath,
    totalCatalogTracks: audioObjects.length,
    localAudioDirectory: environment.audioDirectory,
    jobs
  });

  process.stdout.write(
    "Starting batch: " + jobs.length +
    " pending track(s), reading audio locally and uploading each completed sidecar immediately.\n"
  );

  const pythonEnvironment = cleanPythonEnvironment({
    CM_VISUALIZER_R2_ENDPOINT: environment.endpoint,
    CM_VISUALIZER_R2_BUCKET: environment.bucket,
    CM_VISUALIZER_R2_ACCESS_KEY_ID: environment.writeAccessKeyId,
    CM_VISUALIZER_R2_SECRET_ACCESS_KEY: environment.writeSecretAccessKey
  });

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
      "Some tracks failed. Run the same command again; current R2 sidecars are skipped and only pending tracks are retried.\n"
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
