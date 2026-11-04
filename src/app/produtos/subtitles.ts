const subtitles: Record<string, string> = {
  "porta-figurinhas-3d": "Um produto para organizar seus cards preferidos",
};

export function getProductSubtitle(slug: string): string | null {
  return subtitles[slug] ?? null;
}
