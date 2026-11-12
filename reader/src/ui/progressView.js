import { byId } from '../shared/ui/dom.js';

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
 * Show how many parts have been collected.
 * @param {{received:number,total:number,missing:number[],name:string}} progress
 */
export function renderProgress({ received, total, missing, name }) {
  byId('scan-progress').max = total || 1;
  byId('scan-progress').value = received;
  byId('scan-percent').textContent = percentText(received, total);
  byId('scan-summary').textContent = total
    ? `${name}: ${received} of ${total} parts`
    : 'No QR codes read yet.';
  byId('scan-missing').textContent = missing.length
    ? `Missing parts: ${missing.map((i) => i + 1).join(', ')}`
    : '';
}
