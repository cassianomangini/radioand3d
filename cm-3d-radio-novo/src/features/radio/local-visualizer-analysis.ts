import { existsSync } from "node:fs";
import { join } from "node:path";
import { visualizerAnalysisObjectKey } from "./r2-catalog-core";

export function findLocalVisualizerAnalysis(trackId: string) {
  const objectKey = visualizerAnalysisObjectKey(trackId);
  if (objectKey.includes("..")) return null;

  const localPath = join(process.cwd(), "output", "radio-visualizer", "publish", objectKey);
  if (existsSync(localPath)) return localPath;

  const legacyPath = join(process.cwd(), "..", "OLD", "output", "radio-visualizer", "publish", objectKey);
  if (existsSync(legacyPath)) return legacyPath;

  return null;
}
