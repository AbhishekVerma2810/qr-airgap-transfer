import { ZIP } from '../shared/config.js';
import { crc32 } from '../shared/codec/crc32.js';

const CENTRAL = {
  method: 10,
  crc: 16,
  size: 24,
  nameLength: 28,
  extraLength: 30,
  commentLength: 32,
  localOffset: 42,
};
const LOCAL = { nameLength: 26, extraLength: 28 };
const END = { count: 10, centralOffset: 16 };
const decoder = new TextDecoder();
const MAX_COMMENT_LENGTH = 0xffff;
const END_COMMENT_SEARCH_LIMIT = MAX_COMMENT_LENGTH + ZIP.endRecordSize;

function findEndRecord(view) {
  const lowest = Math.max(0, view.byteLength - END_COMMENT_SEARCH_LIMIT);
  for (let at = view.byteLength - ZIP.endRecordSize; at >= lowest; at--) {
    if (view.getUint32(at, true) === ZIP.endSignature) return at;
  }
  throw new Error('Not a valid ZIP archive.');
}

function readCentralEntry(view, bytes, at) {
  const nameLength = view.getUint16(at + CENTRAL.nameLength, true);
  const skip =
    nameLength +
    view.getUint16(at + CENTRAL.extraLength, true) +
    view.getUint16(at + CENTRAL.commentLength, true);
  const info = {
    method: view.getUint16(at + CENTRAL.method, true),
    crc: view.getUint32(at + CENTRAL.crc, true),
    size: view.getUint32(at + CENTRAL.size, true),
    localOffset: view.getUint32(at + CENTRAL.localOffset, true),
    name: decoder.decode(
      bytes.subarray(at + ZIP.centralHeaderSize, at + ZIP.centralHeaderSize + nameLength),
    ),
  };
  return { info, next: at + ZIP.centralHeaderSize + skip };
}

function readContent(view, bytes, info) {
  const at = info.localOffset;
  const dataStart =
    at +
    ZIP.localHeaderSize +
    view.getUint16(at + LOCAL.nameLength, true) +
    view.getUint16(at + CENTRAL.nameLength, true);
  const content = bytes.slice(dataStart, dataStart + info.size);
  if (crc32(content) !== info.crc) throw new Error(`Corrupted entry: ${info.name}`);
  return content;
}

function toEntry(view, bytes, info) {
  if (info.method !== 0) throw new Error('Unsupported ZIP compression.');
  const isDir = info.name.endsWith('/');
  const path = isDir ? info.name.slice(0, -1) : info.name;
  return { path, isDir, bytes: isDir ? new Uint8Array() : readContent(view, bytes, info) };
}

/**
 * Read a store-only ZIP archive (as made by `createZip`).
 * @param {Uint8Array} bytes
 * @returns {import('./zipWriter.js').ArchiveEntry[]}
 */
export function readZip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const end = findEndRecord(view);
  const count = view.getUint16(end + END.count, true);
  let at = view.getUint32(end + END.centralOffset, true);
  const entries = [];
  for (let i = 0; i < count; i++) {
    const { info, next } = readCentralEntry(view, bytes, at);
    entries.push(toEntry(view, bytes, info));
    at = next;
  }
  return entries;
}
