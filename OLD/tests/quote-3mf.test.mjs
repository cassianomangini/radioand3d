import assert from 'node:assert/strict';
import { test } from 'node:test';
import { crc32, deflateRawSync } from 'node:zlib';
import { validate3mfArchive } from '../src/server/quote/zip-3mf.ts';

const manifest = '<?xml version="1.0"?><Types><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>';
const rels = '<?xml version="1.0"?><Relationships><Relationship Target="/3D/3dmodel.model" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>';
const model = '<?xml version="1.0"?><model xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><resources/><build/></model>';

function makeZip(files, method = 8) {
  const locals = [], dirs = [];
  let offset = 0;
  for (const [name, data] of files) {
    const bytes = Buffer.from(data);
    const encodedName = Buffer.from(name);
    const packed = method === 8 ? deflateRawSync(bytes) : bytes;
    const crc = crc32(bytes);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(packed.length, 18);
    local.writeUInt32LE(bytes.length, 22);
    local.writeUInt16LE(encodedName.length, 26);
    locals.push(local, encodedName, packed);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(packed.length, 20);
    central.writeUInt32LE(bytes.length, 24);
    central.writeUInt16LE(encodedName.length, 28);
    central.writeUInt32LE(offset, 42);
    dirs.push(central, encodedName);
    offset += local.length + encodedName.length + packed.length;
  }
  const dir = Buffer.concat(dirs);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(dir.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, dir, end]);
}
const files = [
  ['[Content_Types].xml', manifest],
  ['_rels/.rels', rels],
  ['3D/3dmodel.model', model],
];
async function verify(bytes) {
  return validate3mfArchive(bytes.length, async (first, last) =>
    new Uint8Array(bytes.subarray(first, last + 1)));
}

test('accepts real stored/deflated 3MF ZIP/OPC with model XML', async () => {
  assert.equal(await verify(makeZip(files, 0)), true);
  assert.equal(await verify(makeZip(files, 8)), true);
});

test('rejects fake ZIP markers, missing relationships or model XML', async () => {
  assert.equal(await verify(Buffer.from('PK\\x03\\x04[Content_Types].xml 3D/a.model PK\\x05\\x06')), false);
  assert.equal(await verify(makeZip(files.filter(([name]) => name !== '_rels/.rels'))), false);
  assert.equal(await verify(makeZip(files.map(([n,v]) => n.endsWith('.model') ? [n,'not XML'] : [n,v]))), false);
});

test('rejects forged central directory and corrupted manifest checksums', async () => {
  const brokenEnd = Buffer.from(makeZip(files));
  brokenEnd.writeUInt32LE(1, brokenEnd.length - 6);
  assert.equal(await verify(brokenEnd), false);
  const brokenPayload = Buffer.from(makeZip(files, 0));
  brokenPayload[36] ^= 0x10;
  assert.equal(await verify(brokenPayload), false);
});

test('rejects path traversal and conflicting ZIP names', async () => {
  assert.equal(await verify(makeZip([...files,['../bad.xml', 'oops']])), false);
  assert.equal(await verify(makeZip([...files,[files[0][0],manifest]])), false);
});
