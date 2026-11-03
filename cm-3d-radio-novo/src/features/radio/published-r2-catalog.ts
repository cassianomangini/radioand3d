import { findLocalVisualizerAnalysis } from "./local-visualizer-analysis";
import { resolvePublishedRadioTracks } from "./publications-core";
import { publishedRadioPublications } from "./publications";
import { radioTrackFromKey } from "./r2-catalog-core";

export function getPublishedR2RadioTracks() {
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;
  if (!publicBaseUrl) throw new Error("R2 radio catalog requires a public URL.");

  const sourceTracks = publishedRadioPublications.flatMap((publication) =>
    publication.versions.map((version) => {
      const track = radioTrackFromKey(version.r2Key, publicBaseUrl);
      if (process.env.NODE_ENV === "development" && findLocalVisualizerAnalysis(version.r2Key)) {
        track.visualizerAnalysisSrc =
          `/dev/radio-visualizer-analysis?track=${encodeURIComponent(version.r2Key)}`;
      }
      return track;
    })
  );
  return resolvePublishedRadioTracks(publishedRadioPublications, sourceTracks);
}
