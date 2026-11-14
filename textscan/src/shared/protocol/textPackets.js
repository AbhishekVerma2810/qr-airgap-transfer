import { crc32 } from '../codec/crc32.js';
import {
  CRC_HEX_DIGITS,
  FIELD_SEPARATOR,
  HEX_RADIX,
  TEXT_FIELD_COUNT,
  TEXT_ID_BYTES,
  TEXT_TAG,
} from '../config.js';

/**
 * CRC-32 of the text's UTF-8 bytes, as 8 lowercase hex digits.
 * @param {string} text
 * @returns {string}
 */
export function textChecksum(text) {
  const checksum = crc32(new TextEncoder().encode(text)) >>> 0;
  return checksum.toString(HEX_RADIX).padStart(CRC_HEX_DIGITS, '0');
}

function newId() {
  const bytes = crypto.getRandomValues(new Uint8Array(TEXT_ID_BYTES));
  return [...bytes].map((byte) => byte.toString(HEX_RADIX).padStart(2, '0')).join('');
}

/** Cut by characters (not UTF-16 units) so emoji and other symbols are never split. */
function sliceText(text, size) {
  const characters = Array.from(text);
  const parts = [];
  for (let start = 0; start < characters.length; start += size) {
    parts.push(characters.slice(start, start + size).join(''));
  }
  return parts;
}

function wrapParts(id, text, chunks) {
  const crc = textChecksum(text);
  return chunks.map((chunk, i) =>
    [TEXT_TAG, id, i, chunks.length, crc, chunk].join(FIELD_SEPARATOR),
  );
}

/**
 * Turn text into QR payloads. Short text stays PLAIN (any phone scanner can read it);
 * longer text becomes numbered `QRT1` parts.
 * @param {string} text
 * @param {number} chunkChars characters per QR code
 * @param {string} [id] shared id of the parts (random when omitted)
 * @returns {string[]}
 */
export function splitText(text, chunkChars, id = newId()) {
  const chunks = sliceText(text, chunkChars);
  const lookslikePacket = text.startsWith(`${TEXT_TAG}${FIELD_SEPARATOR}`);
  if (chunks.length === 1 && !lookslikePacket) return chunks;
  return chunks.length ? wrapParts(id, text, chunks) : [];
}

function isValid({ index, total }) {
  return Number.isInteger(index) && Number.isInteger(total) && index >= 0 && index < total;
}

/**
 * Read one `QRT1` part.
 * @param {string} raw text found in a QR code
 * @returns {{id:string,index:number,total:number,crc:string,chunk:string}|null}
 *   null when the text is not a part (plain text, or damaged)
 */
export function parseTextPacket(raw) {
  const fields = raw.split(FIELD_SEPARATOR);
  if (fields[0] !== TEXT_TAG || fields.length < TEXT_FIELD_COUNT) return null;
  const [, id, index, total, crc] = fields;
  const chunk = fields.slice(TEXT_FIELD_COUNT - 1).join(FIELD_SEPARATOR);
  const packet = { id, index: Number(index), total: Number(total), crc, chunk };
  return isValid(packet) ? packet : null;
}
