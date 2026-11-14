import { parseTextPacket, textChecksum } from '../shared/protocol/textPackets.js';

/** Outcome of {@link TextAssembler#add}. */
export const AddResult = { ADDED: 'added', DUPLICATE: 'duplicate', OTHER: 'other' };

/** Collects scanned QR texts (any order, repeats ignored) and rebuilds the original text. */
export class TextAssembler {
  #plain = null;
  #id = null;
  #total = 0;
  #crc = '';
  #parts = new Map();

  /**
   * @param {string} raw text read from one QR code
   * @returns {string} an {@link AddResult} value
   */
  add(raw) {
    const packet = parseTextPacket(raw);
    return packet ? this.#addPart(packet) : this.#addPlain(raw);
  }

  #addPlain(raw) {
    if (this.#id !== null) return AddResult.OTHER;
    const same = this.#plain === raw;
    this.#plain = raw;
    return same ? AddResult.DUPLICATE : AddResult.ADDED;
  }

  #addPart(packet) {
    if (this.#plain !== null) return AddResult.OTHER;
    if (this.#id === null) this.#start(packet);
    if (packet.id !== this.#id) return AddResult.OTHER;
    if (this.#parts.has(packet.index)) return AddResult.DUPLICATE;
    this.#parts.set(packet.index, packet.chunk);
    return AddResult.ADDED;
  }

  #start({ id, total, crc }) {
    this.#id = id;
    this.#total = total;
    this.#crc = crc.toLowerCase();
  }

  /** True once all parts (or one plain QR) have been read. */
  get isComplete() {
    return this.#plain !== null || (this.#total > 0 && this.#parts.size === this.#total);
  }

  /** @returns {{received:number,total:number,missing:number[]}} */
  get progress() {
    if (this.#plain !== null) return { received: 1, total: 1, missing: [] };
    const missing = Array.from({ length: this.#total }, (_, i) => i).filter(
      (i) => !this.#parts.has(i),
    );
    return { received: this.#parts.size, total: this.#total, missing };
  }

  /**
   * The rebuilt text. Throws if the checksum does not match.
   * @returns {string}
   */
  build() {
    if (this.#plain !== null) return this.#plain;
    const text = Array.from({ length: this.#total }, (_, i) => this.#parts.get(i)).join('');
    if (textChecksum(text) !== this.#crc) {
      throw new Error('The text failed its checksum. Press Reset and scan again.');
    }
    return text;
  }
}
