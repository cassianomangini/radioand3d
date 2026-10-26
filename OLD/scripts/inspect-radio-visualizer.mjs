import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  decodeMusicalVisualizerAnalysis,
  getResampledVisualizerRoles
} from "../src/features/radio/visualizer-analysis.ts";
import { inspectVisualizerFrames } from "./lib/visualizer-diagnostics.mjs";

function usage() {
  return [
    "Usage: pnpm visualizer:inspect -- <sidecar-json-file-or-url> [--json]",
    "",
    "Reads an existing visualizer sidecar. It never runs Demucs, changes R2, or rewrites analysis.",
    ""
  ].join("\n");
}

async function readSource(source) {
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to fetch sidecar: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  return JSON.parse(await readFile(resolve(source), "utf8"));
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

const args = process.argv.slice(2).filter((argument) => argument !== "--");
const jsonOutput = args.includes("--json");
const source = args.find((argument) => !argument.startsWith("-"));

if (!source || args.includes("--help") || args.includes("-h")) {
  process.stdout.write(usage());
  process.exit(source ? 0 : 1);
}

const payload = await readSource(source);
const analysis = decodeMusicalVisualizerAnalysis(payload);
if (!analysis) {
  throw new Error("The file is not a supported CM visualizer sidecar.");
}

const roles = getResampledVisualizerRoles(analysis, analysis.barCount);
const report = {
  source,
  fps: analysis.fps,
  duration: analysis.duration,
  ...inspectVisualizerFrames({
    data: analysis.data,
    frameCount: analysis.frameCount,
    barCount: analysis.barCount,
    roles
  })
};

if (jsonOutput) {
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
} else {
  process.stdout.write([
    `Visualizer analysis: ${source}`,
    `frames/bars: ${report.frameCount} / ${report.barCount} @ ${report.fps} fps`,
    `dynamic range:      ${formatPercent(report.dynamicRange)}`,
    `spatial spread:     ${formatPercent(report.spatialSpread)}`,
    `role contrast:      ${formatPercent(report.roleContrast)}`,
    `common motion:      ${formatPercent(report.commonMotionRatio)}  (1.0 = bars moving together)`,
    `active transitions: ${formatPercent(report.activeTransitionRatio)}`,
    `quiet frames:       ${formatPercent(report.quietFrameRatio)}`,
    "role activity:",
    ...Object.entries(report.roleActivity).map(
      ([role, value]) => `  ${role.padEnd(6)} ${formatPercent(value)}`
    ),
    ""
  ].join("\n"));
}
