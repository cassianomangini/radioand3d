/** A customer link is only a reference for manual review; never fetch it here. */
export function validModelLink(value: string): boolean {
  const link = value.trim();
  if (!link || link.length > 2000 || /\s|[\u0000-\u001f\u007f]/.test(link)) return false;
  try {
    const url = new URL(link);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
    if (url.hostname === 'makerworld.com' || url.hostname === 'www.makerworld.com') {
      return /^\/(?:[a-z]{2}(?:-[A-Z]{2})?\/)?models\/\d+(?:-[^/?#]+)?\/?$/i.test(url.pathname);
    }
    return url.hostname === 'share.bambulab.com' && /^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}
