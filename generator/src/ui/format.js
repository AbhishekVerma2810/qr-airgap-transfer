import { BYTES_PER_KB } from '../config.js';

/**
 * Human-friendly size such as "512 B", "48 KB" or "1.5 MB".
 * @param {number} bytes
 * @returns {string}
 */
export function formatSize(bytes) {
  if (bytes < BYTES_PER_KB) return `${bytes} B`;
  const kilobytes = bytes / BYTES_PER_KB;
  if (kilobytes < BYTES_PER_KB) return `${Math.ceil(kilobytes)} KB`;
  return `${(kilobytes / BYTES_PER_KB).toFixed(1)} MB`;
}
