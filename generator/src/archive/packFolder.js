import { FOLDER_PREFIX } from '../shared/config.js';
import { createZip } from './zipWriter.js';

/**
 * Pack folder entries into a single "file" ready for the QR pipeline.
 * @param {string} folderName
 * @param {import('./zipWriter.js').ArchiveEntry[]} entries
 * @returns {{name: string, bytes: Uint8Array}}
 */
export function packFolder(folderName, entries) {
  return { name: `${FOLDER_PREFIX}${folderName}.zip`, bytes: createZip(entries) };
}
