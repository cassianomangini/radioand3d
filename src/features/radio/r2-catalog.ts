import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import type { RadioTrack } from "./radio-provider";
import { collectAudioKeys, radioTrackFromKey, visualizerAnalysisObjectKey } from "./r2-catalog-core";

export async function getR2RadioTracks(): Promise<RadioTrack[]> {
  const endpoint = process.env.R2_S3_ENDPOINT;
  const bucket = process.env.R2_BUCKET;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !bucket || !publicBaseUrl || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 radio catalog requires endpoint, bucket, public URL, and read-only S3 credentials.");
  }

  const client = new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey }
  });

  try {
    const keys = await collectAudioKeys(async (continuationToken) => {
      return client.send(new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
        MaxKeys: 1000
      }));
    });
    return keys.map((key) => {
      const track = radioTrackFromKey(key, publicBaseUrl);
      if (process.env.NODE_ENV === "development") {
        const localAnalysisPath = resolve(
          process.cwd(),
          "output",
          "radio-visualizer",
          "publish",
          visualizerAnalysisObjectKey(key)
        );
        if (existsSync(localAnalysisPath)) {
          track.visualizerAnalysisSrc =
            `/dev/radio-visualizer-analysis?track=${encodeURIComponent(key)}`;
        }
      }
      return track;
    });
  } finally {
    client.destroy();
  }
}
