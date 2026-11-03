import { existsSync } from "node:fs";
import { resolve, sep } from "node:path";
import { visualizerAnalysisObjectKey } from "./r2-catalog-core";

const analysisRoots = [
  resolve(process.cwd(), "output", "radio-visualizer", "publish"),
  resolve(process.cwd(), "..", "OLD", "output", "radio-visualizer", "publish"),
];

export function findLocalVisualizerAnalysis(trackId: string) {
  const objectKey = visualizerAnalysisObjectKey(trackId);
  if (objectKey.includes("..")) return null;

  for (const root of analysisRoots) {
    const path = resolve(root, objectKey);
    if (!path.startsWith(`${root}${sep}`)) continue;
    if (existsSync(path)) return path;
  }

  return null;
}
