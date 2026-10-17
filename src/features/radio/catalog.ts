import type { RadioTrack } from "./radio-provider";
import { getDevRadioTracks } from "./dev-catalog";
import { getPublishedR2RadioTracks } from "./published-r2-catalog";

export async function getRadioTracks(): Promise<RadioTrack[]> {
  if (process.env.RADIO_CATALOG_SOURCE === "r2") {
    return getPublishedR2RadioTracks();
  }
  return getDevRadioTracks();
}
