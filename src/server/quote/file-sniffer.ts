/**
 * Lightweight fail-closed signature validation for quote previews.
 *
 * A signature is not a malware scan or full CAD parser. Files remain private
 * and are never rendered/executed by the public site. 3MF additionally checks
 * the ZIP central directory for the mandatory OPC manifest and a 3D model.
 */
export type DetectedQuoteFile =
  | 'stl-binary' | 'stl-ascii' | '3mf-zip' | 'obj-text'
  | 'step-text' | 'pdf' | 'png' | 'jpeg' | 'webp';

function ascii(bytes: Uint8Array): string {
  return new TextDecoder('latin1').decode(bytes);
}

function starts(bytes: Uint8Array, signature: readonly number[]): boolean {
  return bytes.length >= signature.length &&
    signature.every((value, index) => bytes[index] === value);
}

function mostlyText(bytes: Uint8Array): boolean {
  if (!bytes.length) return false;
  let controls = 0;
  for (const byte of bytes) {
    if (byte === 0) return false;
    if (byte < 9 || (byte > 13 && byte < 32)) controls++;
  }
  return controls < bytes.length / 50;
}

export function detectQuoteFile(
  extension: string, head: Uint8Array, sizeBytes: number, tail?: Uint8Array
): DetectedQuoteFile | null {
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > 50_000_000 ||
    head.length < 8 || head.length > 131_072) return null;

  if (extension === '.pdf') return starts(head, [37,80,68,70,45]) ? 'pdf' : null;
  if (extension === '.png') return starts(head, [137,80,78,71,13,10,26,10]) ? 'png' : null;
  if (extension === '.jpg' || extension === '.jpeg') {
    return starts(head, [255,216,255]) ? 'jpeg' : null;
  }
  if (extension === '.webp') {
    return starts(head, [82,73,70,70]) && ascii(head.slice(8,12)) === 'WEBP' ? 'webp' : null;
  }

  const prefix = ascii(head);
  if (extension === '.stl') {
    if (sizeBytes >= 84 && head.length >= 84) {
      const triangleCount = new DataView(head.buffer, head.byteOffset + 80, 4).getUint32(0, true);
      if (84 + triangleCount * 50 === sizeBytes && triangleCount > 0) return 'stl-binary';
    }
    if (mostlyText(head) && /^\s*solid\b/i.test(prefix) &&
      /\bfacet\s+normal\b/i.test(prefix)) return 'stl-ascii';
    return null;
  }
  if (extension === '.obj') {
    return mostlyText(head) && /(?:^|\r?\n)\s*(?:v|vn|vt|f)\s+\S+/i.test(prefix)
      ? 'obj-text' : null;
  }
  if (extension === '.step' || extension === '.stp') {
    return mostlyText(head) && /^\s*ISO-10303-21\s*;/i.test(prefix)
      ? 'step-text' : null;
  }
  if (extension === '.3mf') {
    if (!starts(head, [80,75,3,4]) || !tail || tail.length < 22) return null;
    const index = ascii(tail);
    // 3MF is an OPC ZIP container: require both the content types manifest
    // and at least one model part, not merely a generic ZIP magic prefix.
    return index.includes('PK\x05\x06') &&
      index.includes('[Content_Types].xml') &&
      /3D\/[^\x00-\x1f]{1,100}\.model/i.test(index) ? '3mf-zip' : null;
  }
  return null;
}
