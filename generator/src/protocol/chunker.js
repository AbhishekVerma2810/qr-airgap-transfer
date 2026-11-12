import { FILE_ID_BYTES } from '../config.js';
import { bytesToBase64 } from '../shared/codec/base64.js';
import { compress } from '../shared/codec/compressor.js';
import { crc32 } from '../shared/codec/crc32.js';
import { encodePacket } from '../shared/protocol/packet.js';

function randomFileId() {
  const bytes = crypto.getRandomValues(new Uint8Array(FILE_ID_BYTES));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function sliceText(text, size) {
  const slices = [];
  for (let start = 0; start < text.length; start += size) {
    slices.push(text.slice(start, start + size));
  }
  return slices;
}

/**
 * Split a file into QR-sized texts. One text per QR code.
 * Small files give a single text; big files give many.
 * @param {{name: string, bytes: Uint8Array}} file
 * @param {number} chunkSize max base64 characters per QR code
 * @returns {Promise<string[]>}
 */
export async function splitIntoPackets(file, chunkSize) {
  const encoded = bytesToBase64(await compress(file.bytes));
  const slices = sliceText(encoded, chunkSize);
  const fileId = randomFileId();
  const crc = crc32(file.bytes);
  return slices.map((data, index) =>
    encodePacket({ fileId, index, total: slices.length, crc, name: file.name, data }),
  );
}
