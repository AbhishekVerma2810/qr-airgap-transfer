import { ZIP } from '../shared/config.js';
import { crc32 } from '../shared/codec/crc32.js';

const U16 = 2;
const U32 = 4;
const SETTERS = { [U16]: 'setUint16', [U32]: 'setUint32' };
const encoder = new TextEncoder();

/**
 * @typedef {object} ArchiveEntry
 * @property {string} path   forward-slash path relative to the folder root
 * @property {boolean} isDir true for (possibly empty) directories
 * @property {Uint8Array} bytes file content (empty for directories)
 */

function packFields(fields) {
  const total = fields.reduce((sum, [size]) => sum + size, 0);
  const view = new DataView(new ArrayBuffer(total));
  let offset = 0;
  for (const [size, value] of fields) {
    view[SETTERS[size]](offset, value, true);
    offset += size;
  }
  return new Uint8Array(view.buffer);
}

function concat(parts) {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function describe(entry) {
  const name = encoder.encode(entry.isDir ? `${entry.path}/` : entry.path);
  return { name, crc: crc32(entry.bytes), size: entry.bytes.length, entry };
}

function localRecord({ name, crc, size, entry }) {
  const { version, utf8Flag, fixedDosDate } = ZIP;
  const header = packFields([
    [U32, ZIP.localSignature],
    [U16, version],
    [U16, utf8Flag],
    [U16, 0],
    [U16, 0],
    [U16, fixedDosDate],
    [U32, crc],
    [U32, size],
    [U32, size],
    [U16, name.length],
    [U16, 0],
  ]);
  return concat([header, name, entry.bytes]);
}

function centralHead({ crc, size, name }) {
  return packFields([
    [U32, ZIP.centralSignature],
    [U16, ZIP.version],
    [U16, ZIP.version],
    [U16, ZIP.utf8Flag],
    [U16, 0],
    [U16, 0],
    [U16, ZIP.fixedDosDate],
    [U32, crc],
    [U32, size],
    [U32, size],
    [U16, name.length],
  ]);
}

function centralTail(isDir, offset) {
  const attribute = isDir ? ZIP.directoryAttribute : 0;
  return packFields([
    [U16, 0],
    [U16, 0],
    [U16, 0],
    [U16, 0],
    [U32, attribute],
    [U32, offset],
  ]);
}

function centralRecord(info, offset) {
  return concat([centralHead(info), centralTail(info.entry.isDir, offset), info.name]);
}

function endRecord(count, centralSize, centralOffset) {
  return packFields([
    [U32, ZIP.endSignature],
    [U16, 0],
    [U16, 0],
    [U16, count],
    [U16, count],
    [U32, centralSize],
    [U32, centralOffset],
    [U16, 0],
  ]);
}

function startOffsets(records) {
  let position = 0;
  return records.map((record) => {
    const start = position;
    position += record.length;
    return start;
  });
}

/**
 * Build a store-only (uncompressed) ZIP archive.
 * @param {ArchiveEntry[]} entries
 * @returns {Uint8Array}
 */
export function createZip(entries) {
  if (entries.length > ZIP.maxEntries) throw new Error('Too many files for one archive.');
  const infos = entries.map(describe);
  const locals = infos.map(localRecord);
  const offsets = startOffsets(locals);
  const central = concat(infos.map((info, i) => centralRecord(info, offsets[i])));
  const localBlock = concat(locals);
  return concat([localBlock, central, endRecord(infos.length, central.length, localBlock.length)]);
}
