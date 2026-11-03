import { constants, crc32, inflateRawSync } from 'node:zlib';

type Reader = (first: number, last: number) => Promise<Uint8Array>;
type Entry = { name: string; method: number; packed: number; unpacked: number; crc: number; offset: number };
const MAX_DIR = 256 * 1024;
const MAX_XML = 128 * 1024;
const decoder = new TextDecoder('utf-8', { fatal: true });
const getView = (b: Uint8Array) => new DataView(b.buffer, b.byteOffset, b.byteLength);
const u16 = (d: DataView, p: number) => d.getUint16(p, true);
const u32 = (d: DataView, p: number) => d.getUint32(p, true);

async function read(readRange: Reader, start: number, length: number): Promise<Uint8Array> {
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(length) || start < 0 || length < 1 || length > MAX_DIR) throw Error('bounds');
  const output = new Uint8Array(length);
  for (let offset = 0; offset < length;) {
    const len = Math.min(128 * 1024, length - offset);
    const part = await readRange(start + offset, start + offset + len - 1);
    if (part.length !== len) throw Error('short_read');
    output.set(part, offset);
    offset += len;
  }
  return output;
}

async function unpack(entry: Entry, end: number, readRange: Reader, prefix = false): Promise<Uint8Array> {
  if (entry.offset + 30 > end) throw Error('local_bounds');
  const hdr = getView(await read(readRange, entry.offset, 30));
  const nameLen = u16(hdr, 26), extraLen = u16(hdr, 28);
  if (u32(hdr, 0) !== 0x04034b50 || u16(hdr, 8) !== entry.method ||
      (u16(hdr, 6) & 1) || !nameLen || nameLen > 1024 || extraLen > 8192) throw Error('local_invalid');
  const localName = decoder.decode(await read(readRange, entry.offset + 30, nameLen));
  if (localName !== entry.name) throw Error('name_mismatch');
  const start = entry.offset + 30 + nameLen + extraLen;
  if (start + entry.packed > end) throw Error('content_bounds');
  const len = prefix ? Math.min(entry.packed, 4096) : entry.packed;
  if (!len || (!prefix && len > MAX_XML)) throw Error('entry_too_large');
  const input = await read(readRange, start, len);
  const bytes = entry.method === 0 ? input : inflateRawSync(input, {
    finishFlush: prefix ? constants.Z_SYNC_FLUSH : constants.Z_FINISH,
    maxOutputLength: prefix ? 1024 * 1024 : MAX_XML,
  });
  if (!prefix && (bytes.length !== entry.unpacked || crc32(bytes) !== entry.crc)) throw Error('crc');
  return bytes;
}

/** Bounded ZIP/OPC envelope inspection; never claim to be a full CAD/antivirus scan. */
export async function validate3mfArchive(size: number, readRange: Reader): Promise<boolean> {
  if (!Number.isSafeInteger(size) || size < 22 || size > 50_000_000) return false;
  try {
    const endLen = Math.min(size, 65557);
    const endStart = size - endLen;
    const end = getView(await read(readRange, endStart, endLen));
    let eocd = -1;
    for (let p = endLen - 22; p >= 0; p--) {
      if (u32(end, p) === 0x06054b50 && p + 22 + u16(end, p + 20) === endLen) { eocd = p; break; }
    }
    if (eocd < 0 || u16(end, eocd + 4) || u16(end, eocd + 6)) return false;
    const count = u16(end, eocd + 10), dirLen = u32(end, eocd + 12), dirStart = u32(end, eocd + 16);
    if (!count || count > 512 || count !== u16(end, eocd + 8) ||
        !dirLen || dirLen > MAX_DIR || dirStart + dirLen !== endStart + eocd) return false;
    const directory = await read(readRange, dirStart, dirLen), d = getView(directory);
    const entries: Entry[] = [], seen = new Set<string>();
    let pos = 0, total = 0;
    for (let i = 0; i < count; i++) {
      if (pos + 46 > directory.length || u32(d, pos) !== 0x02014b50) return false;
      const flags = u16(d, pos + 8), method = u16(d, pos + 10);
      const packed = u32(d, pos + 20), unpacked = u32(d, pos + 24);
      const nameLen = u16(d, pos + 28), extra = u16(d, pos + 30), comment = u16(d, pos + 32);
      const offset = u32(d, pos + 42), next = pos + 46 + nameLen + extra + comment;
      if (next > dirLen || !nameLen || nameLen > 1024 || (flags & 1) || ![0,8].includes(method) ||
          [packed, unpacked, offset].includes(0xffffffff) || u16(d, pos + 34) || offset + 30 > dirStart) return false;
      const name = decoder.decode(directory.subarray(pos + 46, pos + 46 + nameLen));
      if (!name || name.startsWith('/') || name.includes('\\') || /[\x00-\x1f\x7f]/.test(name) ||
          name.split('/').some(s => s === '..' || s === '.') || seen.has(name)) return false;
      seen.add(name); total += unpacked;
      if (total > 512 * 1024 * 1024) return false;
      entries.push({name, method, packed, unpacked, crc: u32(d, pos + 16), offset});
      pos = next;
    }
    if (pos !== dirLen) return false;
    const types = entries.find(e => e.name === '[Content_Types].xml');
    const rels = entries.find(e => e.name === '_rels/.rels');
    const models = entries.filter(e => /^3D\/[^/]+\.model$/i.test(e.name));
    if (!types || !rels || !models.length || types.unpacked > MAX_XML || rels.unpacked > MAX_XML) return false;
    const [contentTypes, relationships] = await Promise.all([
      unpack(types, dirStart, readRange), unpack(rels, dirStart, readRange),
    ]);
    const typesXml = decoder.decode(contentTypes);
    const relsXml = decoder.decode(relationships);
    if (!/<Types(?:\s|>)/i.test(typesXml) ||
        !typesXml.includes('application/vnd.ms-package.3dmanufacturing-3dmodel+xml') ||
        !/<Relationships(?:\s|>)/i.test(relsXml) || !relsXml.includes('3dmodel')) return false;
    for (const model of models) {
      const prefix = await unpack(model, dirStart, readRange, true);
      const xml = decoder.decode(prefix.subarray(0, Math.min(4096, prefix.length)));
      if (!/<model(?:\s|>)/i.test(xml) || !xml.includes('schemas.microsoft.com/3dmanufacturing/core/')) return false;
    }
    return true;
  } catch { return false; }
}
