export interface RadioPublicationVersion {
  id: string;
  r2Key: string;
  state: "draft" | "published" | "archived";
}

export interface RadioPublication {
  id: string;
  slug: string;
  title: string;
  artist: string;
  state: "draft" | "published" | "archived";
  primaryVersionId: string;
  versions: RadioPublicationVersion[];
}

export interface SourceRadioTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
  visualizerAnalysisSrc?: string;
  artwork?: string;
  durationSeconds?: number;
  fixture?: boolean;
}

export interface PublishedRadioTrack extends SourceRadioTrack {
  publicId: string;
  shareSlug: string;
}

export function validateRadioPublications(publications: RadioPublication[]): void {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const versionIds = new Set<string>();
  const keys = new Set<string>();

  for (const publication of publications) {
    if (!publication.id || ids.has(publication.id)) throw new Error(`Duplicate or missing track id: ${publication.id}`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(publication.slug) || slugs.has(publication.slug)) {
      throw new Error(`Invalid or duplicate slug: ${publication.slug}`);
    }
    if (!publication.title.trim() || !publication.artist.trim()) throw new Error(`Missing public metadata: ${publication.id}`);
    ids.add(publication.id);
    slugs.add(publication.slug);

    const primary = publication.versions.find((version) => version.id === publication.primaryVersionId);
    if (publication.state === "published" && primary?.state !== "published") {
      throw new Error(`Published track has no published primary version: ${publication.id}`);
    }
    for (const version of publication.versions) {
      if (!version.id || versionIds.has(version.id)) throw new Error(`Duplicate or missing version id: ${version.id}`);
      if (!version.r2Key || keys.has(version.r2Key)) throw new Error(`Duplicate or missing r2Key: ${version.r2Key}`);
      versionIds.add(version.id);
      keys.add(version.r2Key);
    }
  }
}

export function resolvePublishedRadioTracks(
  publications: RadioPublication[],
  sourceTracks: SourceRadioTrack[]
): PublishedRadioTrack[] {
  validateRadioPublications(publications);
  const sourceByKey = new Map(sourceTracks.map((track) => [track.id, track]));
  return publications.flatMap((publication) => {
    if (publication.state !== "published") return [];
    const version = publication.versions.find((entry) => entry.id === publication.primaryVersionId);
    if (!version || version.state !== "published") return [];
    const source = sourceByKey.get(version.r2Key);
    if (!source) return [];
    return [{
      ...source,
      title: publication.title,
      artist: publication.artist,
      publicId: publication.id,
      shareSlug: publication.slug
    }];
  });
}
