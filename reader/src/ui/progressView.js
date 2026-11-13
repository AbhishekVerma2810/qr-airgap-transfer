import { byId } from '../shared/ui/dom.js';
import { formatDuration } from '../shared/time/duration.js';

const PERCENT_FULL = 100;

/**
 * Text such as "40% done, 60% left" (empty before the first code is read).
 * @param {number} received
 * @param {number} total
 * @returns {string}
 */
export function percentText(received, total) {
  if (!total) return '';
  const done = Math.floor((received / total) * PERCENT_FULL);
  return `${done}% done, ${PERCENT_FULL - done}% left`;
}

/**
 * Text such as "about 2m 10s left" (empty when nothing is missing).
 * @param {number|null} timeLeftMs null while the scanning speed is still unknown
 * @param {number} missingCount
 * @returns {string}
 */
export function etaText(timeLeftMs, missingCount) {
  if (!missingCount) return '';
  if (timeLeftMs === null) return 'estimating time left...';
  return `about ${formatDuration(timeLeftMs)} left`;
}

/**
 * Show how many parts have been collected.
 * @param {{received:number,total:number,missing:number[],name:string}} progress
 * @param {number|null} [timeLeftMs] estimated time to finish, if known
 */
export function renderProgress({ received, total, missing, name }, timeLeftMs = null) {
  byId('scan-progress').max = total || 1;
  byId('scan-progress').value = received;
  byId('scan-percent').textContent = [
    percentText(received, total),
    etaText(timeLeftMs, missing.length),
  ]
    .filter(Boolean)
    .join(' · ');
  byId('scan-summary').textContent = total
    ? `${name}: ${received} of ${total} parts`
    : 'No QR codes read yet.';
  byId('scan-missing').textContent = missing.length
    ? `Missing parts: ${missing.map((i) => i + 1).join(', ')}`
    : '';
}
