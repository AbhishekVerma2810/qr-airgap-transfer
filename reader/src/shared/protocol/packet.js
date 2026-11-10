import { PROTOCOL_TAG, FIELD_SEPARATOR, PACKET_FIELD_COUNT } from '../config.js';

/**
 * @typedef {object} Packet
 * @property {string} fileId  random id shared by all parts of one file
 * @property {number} index   zero-based part number
 * @property {number} total   number of parts in the file
 * @property {number} crc     CRC-32 of the original file
 * @property {string} name    original file name
 * @property {string} data    base64 slice of the compressed file
 */

/**
 * Turn a packet into the text stored inside one QR code.
 * @param {Packet} packet
 * @returns {string}
 */
export function encodePacket(packet) {
  return [
    PROTOCOL_TAG,
    packet.fileId,
    packet.index,
    packet.total,
    packet.crc,
    encodeURIComponent(packet.name),
    packet.data,
  ].join(FIELD_SEPARATOR);
}

function isValidNumber(value) {
  return Number.isInteger(value) && value >= 0;
}

function parseFields([, fileId, index, total, crc, name, data]) {
  return {
    fileId,
    index: Number(index),
    total: Number(total),
    crc: Number(crc),
    name: decodeURIComponent(name),
    data,
  };
}

function isValidPacket(packet) {
  const numbers = [packet.index, packet.total, packet.crc];
  return numbers.every(isValidNumber) && packet.index < packet.total;
}

/**
 * Parse QR text into a packet.
 * @param {string} text
 * @returns {Packet|null} null when the text is not one of our packets
 */
export function decodePacket(text) {
  const fields = text.split(FIELD_SEPARATOR);
  if (fields.length !== PACKET_FIELD_COUNT) return null;
  if (fields[0] !== PROTOCOL_TAG) return null;
  try {
    const packet = parseFields(fields);
    return isValidPacket(packet) ? packet : null;
  } catch {
    return null;
  }
}
