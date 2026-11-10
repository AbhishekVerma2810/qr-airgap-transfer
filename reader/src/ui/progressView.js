import { byId } from '../shared/ui/dom.js';

/**
 * Show how many parts have been collected.
 * @param {{received:number,total:number,missing:number[],name:string}} progress
 */
export function renderProgress({ received, total, missing, name }) {
  byId('scan-progress').max = total || 1;
  byId('scan-progress').value = received;
  byId('scan-summary').textContent = total
    ? `${name}: ${received} of ${total} parts`
    : 'No QR codes read yet.';
  byId('scan-missing').textContent = missing.length
    ? `Missing parts: ${missing.map((i) => i + 1).join(', ')}`
    : '';
}
