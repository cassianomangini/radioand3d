import type { RadioTrack } from "./radio-provider";
import { getDevRadioTracks } from "./dev-catalog";
import { getR2RadioTracks } from "./r2-catalog";

export async function getRadioTracks(): Promise<RadioTrack[]> {
  if (process.env.RADIO_CATALOG_SOURCE === "r2") {
    return getR2RadioTracks();
  }
  return getDevRadioTracks();
}
