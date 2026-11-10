import { base64ToBytes } from '../shared/codec/base64.js';
import { decompress } from '../shared/codec/compressor.js';
import { crc32 } from '../shared/codec/crc32.js';
import { decodePacket } from '../shared/protocol/packet.js';

/** Result of feeding one scanned text into the assembler. */
export const AddResult = Object.freeze({
  ADDED: 'added',
  DUPLICATE: 'duplicate',
  INVALID: 'invalid',
  OTHER_FILE: 'other-file',
});

/** Collects parts in any order and rebuilds the original file. */
export class Assembler {
  #parts = new Map();
  #first = null;

  /**
   * @param {string} text QR content
   * @returns {string} one of {@link AddResult}
   */
  add(text) {
    const packet = decodePacket(text);
    if (!packet) return AddResult.INVALID;
    this.#first ??= packet;
    if (packet.fileId !== this.#first.fileId) return AddResult.OTHER_FILE;
    if (this.#parts.has(packet.index)) return AddResult.DUPLICATE;
    this.#parts.set(packet.index, packet.data);
    return AddResult.ADDED;
  }

  /** @returns {{received:number,total:number,missing:number[],name:string}} */
  get progress() {
    const total = this.#first?.total ?? 0;
    const missing = this.#missingIndexes(total);
    return { received: this.#parts.size, total, missing, name: this.#first?.name ?? '' };
  }

  #missingIndexes(total) {
    const all = Array.from({ length: total }, (_, i) => i);
    return all.filter((i) => !this.#parts.has(i));
  }

  get isComplete() {
    const { total, received } = this.progress;
    return total > 0 && received === total;
  }

  /**
   * Rebuild the file. Throws if incomplete or the checksum differs.
   * @returns {Promise<{name:string, bytes:Uint8Array}>}
   */
  async build() {
    if (!this.isComplete) throw new Error('Some QR codes are still missing.');
    const ordered = [...this.#parts.keys()].sort((a, b) => a - b);
    const text = ordered.map((i) => this.#parts.get(i)).join('');
    const bytes = await decompress(base64ToBytes(text));
    if (crc32(bytes) !== this.#first.crc) throw new Error('Checksum mismatch: file is corrupted.');
    return { name: this.#first.name, bytes };
  }
}
