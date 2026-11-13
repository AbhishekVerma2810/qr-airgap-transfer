import { RATE_WINDOW_SAMPLES } from '../config.js';

/**
 * Estimates how fast NEW parts arrive, from the most recent samples only,
 * so the time-left figure follows the real scanning speed.
 */
export class RateTracker {
  #samples = [];

  /**
   * Note that `received` parts are known at time `now` (ms). Repeats add nothing.
   * @param {number} received
   * @param {number} now
   */
  record(received, now) {
    if (this.#samples.at(-1)?.received === received) return;
    this.#samples.push({ received, now });
    if (this.#samples.length > RATE_WINDOW_SAMPLES) this.#samples.shift();
  }

  /** Forget everything (used by Reset). */
  reset() {
    this.#samples = [];
  }

  /**
   * Approximate milliseconds needed to receive `missingCount` more parts.
   * @param {number} missingCount
   * @returns {number|null} null while there is not enough data
   */
  estimateMs(missingCount) {
    if (this.#samples.length < 2) return null;
    const first = this.#samples[0];
    const last = this.#samples.at(-1);
    const rate = (last.received - first.received) / (last.now - first.now);
    return rate > 0 ? missingCount / rate : null;
  }
}
