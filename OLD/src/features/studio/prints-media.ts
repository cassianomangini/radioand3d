import manifest from "./prints-media.json";

export type StudioPrintMedia = {
  id: string;
  src: string;
  kind: "image" | "video";
  title: string;
  alt: string;
  project: string;
  poster?: string;
};

export const studioPrintMedia: StudioPrintMedia[] = manifest.items as StudioPrintMedia[];
