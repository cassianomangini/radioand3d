import publicationManifest from "./publications.generated.json";
import { validateRadioPublications, type RadioPublication } from "./publications-core";

if (publicationManifest.schemaVersion !== 1) throw new Error("Unsupported radio publication manifest version.");

export const radioPublications = publicationManifest.tracks as RadioPublication[];
validateRadioPublications(radioPublications);

export const publishedRadioPublications = radioPublications.filter((track) => track.state === "published");

export function getPublishedRadioPublication(slug: string) {
  return publishedRadioPublications.find((track) => track.slug === slug) ?? null;
}
