import { TIME } from '../config.js';

/**
 * Turn milliseconds into short text such as "45s", "3m 05s" or "2h 10m".
 * @param {number} milliseconds
 * @returns {string}
 */
export function formatDuration(milliseconds) {
  const total = Math.max(0, Math.ceil(milliseconds / TIME.msPerSecond));
  const hours = Math.floor(total / TIME.secondsPerHour);
  const minutes = Math.floor((total % TIME.secondsPerHour) / TIME.secondsPerMinute);
  const seconds = String(total % TIME.secondsPerMinute).padStart(2, '0');
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${seconds}s`;
  return `${total}s`;
}
