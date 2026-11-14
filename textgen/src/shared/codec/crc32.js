const POLYNOMIAL = 0xedb88320;
const BYTE_MASK = 0xff;
const ALL_BITS = 0xffffffff;
const TABLE = buildTable();

function buildTable() {
  return Array.from({ length: 256 }, (_, n) => {
    let value = n;
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? POLYNOMIAL ^ (value >>> 1) : value >>> 1;
    }
    return value >>> 0;
  });
}

/**
 * CRC-32 checksum used to prove the rebuilt file is identical.
 * @param {Uint8Array} bytes
 * @returns {number} unsigned 32-bit checksum
 */
export function crc32(bytes) {
  let crc = ALL_BITS;
  for (const byte of bytes) {
    crc = TABLE[(crc ^ byte) & BYTE_MASK] ^ (crc >>> 8);
  }
  return (crc ^ ALL_BITS) >>> 0;
}
